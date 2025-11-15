// usePdfRenderer.js
// A production-ready two-stage PDF renderer hook using pdf.js with LRU-managed high-res canvases.
// Stage 1: low-res thumbnails (fast, offscreen render)
// Stage 2: high-res canvases for visible pages (+/- 1 neighbor), max 3–6 canvases via LRU

import { useCallback, useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Proper worker setup
if (pdfjsLib?.GlobalWorkerOptions) {
  // Use CDN worker for pdfjs-dist v5.x (version 5.4.394)
  const pdfjsVersion = pdfjsLib.version || '5.4.394';
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.js`;
}

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

export default function usePdfRenderer({
  initialPage = 1,
  onPageChange,
  onProgressUpdate,
  lruLimit = 4, // allowed 3–6 suggested
  eagerAllPages = false,
  keepHighResOnRender = false,
} = {}) {
  const containerRef = useRef(null);

  // State
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoomState] = useState(100);

  // PDF + DOM refs
  const pdfRef = useRef(null); // PDFDocumentProxy
  const pagesContainerRef = useRef(null); // Internal pages container
  const pageNodesRef = useRef(new Map()); // pageNum -> { wrapper, thumbImg, canvas }
  const renderTasksRef = useRef(new Map()); // pageNum -> renderTask
  const renderVersionRef = useRef(new Map()); // pageNum -> number (guards stale finishes)
  const pageScaleCacheRef = useRef(new Map()); // pageNum -> zoom scale last rendered
  const thumbURLsRef = useRef(new Map()); // pageNum -> objectURL
  const activeCanvasLRURef = useRef(new Map()); // pageNum -> true (in insertion order)
  const rafScrollRef = useRef(null);
  const pdfFingerprintRef = useRef('');

  // Cleanup helpers
  const revokeThumbURL = (pageNum) => {
    const url = thumbURLsRef.current.get(pageNum);
    if (url) {
      try {
        URL.revokeObjectURL(url);
      } catch {}
      thumbURLsRef.current.delete(pageNum);
    }
  };

  const cancelRenderTask = (pageNum) => {
    const task = renderTasksRef.current.get(pageNum);
    if (task && typeof task.cancel === 'function') {
      try {
        task.cancel();
      } catch {}
    }
    renderTasksRef.current.delete(pageNum);
  };

  const clearAllRenderTasks = () => {
    renderTasksRef.current.forEach((task) => {
      if (task && typeof task.cancel === 'function') {
        try {
          task.cancel();
        } catch {}
      }
    });
    renderTasksRef.current.clear();
  };

  const resetDOM = () => {
    // Clear pages container
    if (pagesContainerRef.current && pagesContainerRef.current.parentNode) {
      try {
        pagesContainerRef.current.parentNode.removeChild(pagesContainerRef.current);
      } catch {}
    }
    pagesContainerRef.current = null;
    pageNodesRef.current.clear();
    pageScaleCacheRef.current.clear();

    // Revoke all thumbnail URLs
    Array.from(thumbURLsRef.current.keys()).forEach(revokeThumbURL);
    thumbURLsRef.current.clear();

    // Reset LRU
    activeCanvasLRURef.current.clear();
  };

  // Create internal pages container within the provided scrollable container
  const ensurePagesContainer = () => {
    if (!containerRef.current) return null;
    if (!pagesContainerRef.current) {
      const el = document.createElement('div');
      el.className = 'pdf-pages flex flex-col items-center gap-8 py-8';
      containerRef.current.innerHTML = ''; // clear previous
      containerRef.current.appendChild(el);
      pagesContainerRef.current = el;
    }
    return pagesContainerRef.current;
  };

  // Create DOM nodes per page: wrapper -> img (thumb) + canvas (high-res)
  const preparePagesDOM = (count) => {
    const root = ensurePagesContainer();
    if (!root) return;

    const frag = document.createDocumentFragment();
    for (let p = 1; p <= count; p += 1) {
      const wrapper = document.createElement('div');
      wrapper.dataset.pageNumber = String(p);
      wrapper.className = 'pdf-page w-full flex justify-center relative px-4';

      const thumb = document.createElement('img');
      thumb.className = 'pdf-thumb shadow-lg border border-neutral-300 bg-white';
      thumb.style.maxWidth = '900px';
      thumb.style.width = '100%';
      thumb.style.height = 'auto';
      thumb.style.objectFit = 'contain';
      thumb.style.minHeight = '800px'; // placeholder height until thumb loads
      thumb.style.transition = 'opacity 180ms ease';
      thumb.style.opacity = '1';

      const canvas = document.createElement('canvas');
      canvas.className = 'pdf-canvas shadow-lg border border-neutral-300 bg-white';
      canvas.style.maxWidth = '900px';
      canvas.style.width = '100%';
      canvas.style.height = 'auto';
      canvas.style.display = 'none';
      canvas.style.opacity = '0';
      canvas.style.transition = 'opacity 180ms ease';

      wrapper.appendChild(thumb);
      wrapper.appendChild(canvas);
      frag.appendChild(wrapper);

      pageNodesRef.current.set(p, { wrapper, thumbImg: thumb, canvas });
    }
    root.appendChild(frag);
  };

  // Thumbnails: render low-scale to an offscreen canvas (main thread)
  const renderThumbnail = async (pageNum) => {
    if (!pdfRef.current) return;
    const page = await pdfRef.current.getPage(pageNum);
    const { thumbImg } = pageNodesRef.current.get(pageNum) || {};
    if (!thumbImg) return;

    // Render at a small scale; independent of zoom
    const viewport = page.getViewport({ scale: 0.2 });
    let offscreen;
    let ctx;

    if (typeof OffscreenCanvas !== 'undefined') {
      offscreen = new OffscreenCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
      ctx = offscreen.getContext('2d', { alpha: false });
    } else {
      // Fallback to in-page temporary canvas (very short-lived)
      const tmp = document.createElement('canvas');
      tmp.width = Math.ceil(viewport.width);
      tmp.height = Math.ceil(viewport.height);
      ctx = tmp.getContext('2d', { alpha: false });
      offscreen = tmp;
    }

    const task = page.render({ canvasContext: ctx, viewport });
    await task.promise;

    // Convert to Blob and set img.src
    const blob = typeof offscreen.convertToBlob === 'function'
      ? await offscreen.convertToBlob({ type: 'image/png' })
      : await new Promise((resolve) => offscreen.toBlob(resolve, 'image/png'));

    const url = URL.createObjectURL(blob);
    // Revoke previous if any
    revokeThumbURL(pageNum);
    thumbURLsRef.current.set(pageNum, url);

    thumbImg.onload = () => {
      thumbImg.style.minHeight = '0px';
    };
    thumbImg.src = url;
  };

  // LRU management: keep only a limited number of visible canvases
  const touchLRU = (pageNum) => {
    if (eagerAllPages || keepHighResOnRender) return;
    if (activeCanvasLRURef.current.has(pageNum)) {
      activeCanvasLRURef.current.delete(pageNum);
    }
    activeCanvasLRURef.current.set(pageNum, true);

    // Evict if over capacity
    while (activeCanvasLRURef.current.size > lruLimit) {
      const oldestKey = activeCanvasLRURef.current.keys().next().value;
      activeCanvasLRURef.current.delete(oldestKey);
      // Hide and free memory for the evicted canvas
      const node = pageNodesRef.current.get(oldestKey);
      if (node) {
        const { canvas, thumbImg } = node;
        try {
          // Free canvas memory
          canvas.width = 0;
          canvas.height = 0;
          canvas.style.display = 'none';
          canvas.style.opacity = '0';
        } catch {}
        if (thumbImg) {
          thumbImg.style.display = '';
          thumbImg.style.opacity = '1';
        }
      }
    }
  };

  // High-res render for a page respecting versioning & task cancellation
  const renderHighResPage = useCallback(async (pageNum) => {
    if (!pdfRef.current) return;
    const node = pageNodesRef.current.get(pageNum);
    if (!node) return;
    const { canvas, thumbImg } = node;

    const currentZoom = zoom;
    const cached = pageScaleCacheRef.current.get(pageNum);
    if (cached === currentZoom && canvas.style.display !== 'none') {
      // Already rendered at this zoom and visible
      touchLRU(pageNum);
      return;
    }

    // Cancel previous render
    cancelRenderTask(pageNum);

    // Render version guard
    const prevVersion = (renderVersionRef.current.get(pageNum) || 0) + 1;
    renderVersionRef.current.set(pageNum, prevVersion);

    try {
      const page = await pdfRef.current.getPage(pageNum);
      const scale = currentZoom / 100;
      const viewport = page.getViewport({ scale });

      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) return;

      const outputScale = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
      const targetWidth = Math.floor(viewport.width * outputScale);
      const targetHeight = Math.floor(viewport.height * outputScale);

      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
      }

      ctx.setTransform(outputScale, 0, 0, outputScale, 0, 0);
      ctx.imageSmoothingQuality = 'high';
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const renderTask = page.render({ canvasContext: ctx, viewport });
      renderTasksRef.current.set(pageNum, renderTask);
      await renderTask.promise;

      // If a newer render started, discard showing
      if (renderVersionRef.current.get(pageNum) !== prevVersion) return;

      // Swap in high-res
      canvas.style.display = '';
      // fade-in
      requestAnimationFrame(() => {
        canvas.style.opacity = '1';
        if (thumbImg) {
          thumbImg.style.opacity = '0';
          // Keep the thumb in DOM to prevent layout shift; it's fully transparent when canvas is visible.
        }
      });

      pageScaleCacheRef.current.set(pageNum, currentZoom);
      touchLRU(pageNum);
    } catch (err) {
      // Ignore cancellations; log others
      if (String(err?.name) !== 'RenderingCancelledException') {
        // eslint-disable-next-line no-console
        console.error(`Render failed for page ${pageNum}`, err);
      }
    } finally {
      renderTasksRef.current.delete(pageNum);
    }
  }, [zoom, lruLimit]); // eslint-disable-line react-hooks/exhaustive-deps

  // Render around a center page (center, +/- 1 neighbor)
  const renderAround = useCallback((centerPage) => {
    if (!pdfRef.current) return;
    const n = pdfRef.current.numPages;

    if (eagerAllPages) {
      for (let p = 1; p <= n; p += 1) {
        renderHighResPage(p);
      }
      return;
    }

    const targets = [centerPage];
    if (centerPage > 1) targets.push(centerPage - 1);
    if (centerPage < n) targets.push(centerPage + 1);

    // Hide far canvases but keep thumbs (unless we want to keep all rendered canvases)
    if (!keepHighResOnRender) {
      for (let p = 1; p <= n; p += 1) {
        if (!targets.includes(p)) {
          const node = pageNodesRef.current.get(p);
          if (node) {
            node.canvas.style.opacity = '0';
            node.canvas.style.display = 'none';
            if (node.thumbImg) {
              node.thumbImg.style.display = '';
              node.thumbImg.style.opacity = '1';
            }
          }
        }
      }
    }

    // Render targets
    targets.forEach((p) => {
      renderHighResPage(p);
    });
  }, [renderHighResPage, eagerAllPages, keepHighResOnRender]);

  // Detect closest page to container center
  const updateCurrentFromScroll = useCallback(() => {
    if (!containerRef.current || !pdfRef.current) return;
    const container = containerRef.current;
    const cRect = container.getBoundingClientRect();
    const viewCenter = cRect.top + container.clientHeight / 2;

    let closest = currentPage || 1;
    let minDist = Number.POSITIVE_INFINITY;

    for (let p = 1; p <= pdfRef.current.numPages; p += 1) {
      const node = pageNodesRef.current.get(p);
      if (!node) continue;
      const rect = node.wrapper.getBoundingClientRect();
      const pageCenter = rect.top + rect.height / 2;
      const dist = Math.abs(pageCenter - viewCenter);
      if (dist < minDist) {
        minDist = dist;
        closest = p;
      }
    }

    if (closest !== currentPage) {
      setCurrentPage(closest);
      // Persist progress (fingerprint -> page)
      const key = 'pdf_progress';
      try {
        const map = JSON.parse(localStorage.getItem(key) || '{}');
        if (pdfFingerprintRef.current) {
          map[pdfFingerprintRef.current] = closest;
          localStorage.setItem(key, JSON.stringify(map));
        }
      } catch {}
      // Callbacks
      if (typeof onPageChange === 'function') onPageChange(closest, totalPages);
      if (typeof onProgressUpdate === 'function') onProgressUpdate(closest, totalPages);
      // Render around
      renderAround(closest);
    }
  }, [currentPage, totalPages, onPageChange, onProgressUpdate, renderAround]);

  // Scroll + resize listeners
  useEffect(() => {
    if (!containerRef.current) return undefined;

    const onScroll = () => {
      if (rafScrollRef.current) cancelAnimationFrame(rafScrollRef.current);
      rafScrollRef.current = requestAnimationFrame(() => {
        updateCurrentFromScroll();
        rafScrollRef.current = null;
      });
    };

    const onResize = () => {
      if (rafScrollRef.current) cancelAnimationFrame(rafScrollRef.current);
      rafScrollRef.current = requestAnimationFrame(() => {
        updateCurrentFromScroll();
        rafScrollRef.current = null;
      });
    };

    const onWheel = (e) => {
      // Optional pinch-to-zoom on trackpads (Ctrl/Cmd + wheel)
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY;
        const step = delta > 0 ? -10 : 10;
        setZoomState((prev) => clamp(prev + step, 50, 200));
      }
    };

    containerRef.current.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    containerRef.current.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      containerRef.current?.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      containerRef.current?.removeEventListener('wheel', onWheel);
    };
  }, [updateCurrentFromScroll]);

  // On zoom change: only re-render visible targets (center +/- 1)
  useEffect(() => {
    if (!pdfRef.current || !totalPages) return;
    renderAround(currentPage || 1);
  }, [zoom]); // eslint-disable-line react-hooks/exhaustive-deps

  const navigateToPage = useCallback((page) => {
    if (!containerRef.current || !pdfRef.current) return;
    const target = pageNodesRef.current.get(page);
    if (!target) return;
    const container = containerRef.current;
    const top = target.wrapper.offsetTop - container.clientHeight * 0.1;
    container.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }, []);

  const setZoom = useCallback((v) => {
    setZoomState((prev) => clamp(typeof v === 'function' ? v(prev) : v, 50, 200));
  }, []);

  // Load a PDF from ArrayBuffer | Blob | URL string
  const loadPdf = useCallback(async (src) => {
    // Cleanup previous doc
    clearAllRenderTasks();
    resetDOM();
    setTotalPages(0);
    setCurrentPage(initialPage);

    // Normalize input for pdf.js getDocument
    let getDocArgs = null;
    if (typeof src === 'string') {
      // External URL
      getDocArgs = { url: src };
    } else if (src instanceof ArrayBuffer) {
      getDocArgs = { data: src };
    } else if (src && typeof src.arrayBuffer === 'function') {
      // Blob-like (e.g., Supabase download result)
      const bytes = await src.arrayBuffer();
      getDocArgs = { data: bytes };
    } else {
      throw new Error('Unsupported pdfSource. Provide URL string, ArrayBuffer, or Blob.');
    }

    const loadingTask = pdfjsLib.getDocument(getDocArgs);
    const pdf = await loadingTask.promise;
    pdfRef.current = pdf;
    pdfFingerprintRef.current = pdf?.fingerprint || '';

    setTotalPages(pdf.numPages);

    // Create all page DOM nodes
    preparePagesDOM(pdf.numPages);

    // If we want every page fully ready before the viewer is shown, render all
    // pages high-res sequentially. This is ideal for dedicated reader views
    // that hide the UI behind a loading state until everything is complete.
    if (eagerAllPages) {
      for (let p = 1; p <= pdf.numPages; p += 1) {
        try {
          // High-res render for each page; this will also populate the canvas
          // and keep it around (no LRU eviction when eagerAllPages is true).
          // eslint-disable-next-line no-await-in-loop
          await renderHighResPage(p);
        } catch (e) {
          // Ignore per-page render errors so other pages can still display
        }
      }

      navigateToPage(initialPage);
      updateCurrentFromScroll();

      return pdf.numPages;
    }

    // Default behavior: generate thumbnails progressively and render only the
    // initial page + neighbors in high-res for fast, incremental loading.
    const order = [];
    const start = Math.max(1, initialPage - 3);
    const end = Math.min(pdf.numPages, initialPage + 3);
    for (let p = start; p <= end; p += 1) order.push(p);
    for (let p = 1; p <= pdf.numPages; p += 1) {
      if (!order.includes(p)) order.push(p);
    }

    let delay = 0;
    order.forEach((p) => {
      setTimeout(() => {
        renderThumbnail(p).catch(() => {});
      }, delay);
      delay += 8; // tiny staggering
    });

    // Ensure the initial page is actually rendered before resolving
    try {
      await renderThumbnail(initialPage);
    } catch (e) {
      // ignore thumbnail errors for the initial page
    }
    try {
      await renderHighResPage(initialPage);
    } catch (e) {
      // ignore high-res errors for the initial page
    }

    navigateToPage(initialPage);
    renderAround(initialPage);
    updateCurrentFromScroll();

    return pdf.numPages;
  }, [initialPage, navigateToPage, renderAround, updateCurrentFromScroll, renderHighResPage]);

  // Unmount cleanup
  useEffect(() => {
    return () => {
      clearAllRenderTasks();
      resetDOM();
      pdfRef.current = null;
      pdfFingerprintRef.current = '';
    };
  }, []);

  return {
    loadPdf,
    currentPage,
    totalPages,
    zoom,
    setZoom,
    navigateToPage,
    containerRef,
  };
}
