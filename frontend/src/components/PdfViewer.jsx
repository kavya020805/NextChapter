// PdfViewer.jsx
// A minimal, production-ready PDF viewer component built on usePdfRenderer.
// It renders thumbnails immediately and high-res canvases on-demand with smooth scrolling,
// accurate page detection, zooming, and progress callbacks.

import React, { useEffect } from 'react';
import usePdfRenderer from '../pdf/usePdfRenderer';

export default function PdfViewer({
  pdfSource,                 // ArrayBuffer | URL string | Blob
  initialPage = 1,
  onPageChange = () => {},
  onProgressUpdate = () => {},
  className = '',
  style = {},
}) {
  const {
    loadPdf,
    currentPage,
    totalPages,
    zoom,
    setZoom,
    navigateToPage,
    containerRef,
  } = usePdfRenderer({
    initialPage,
    onPageChange,
    onProgressUpdate,
    lruLimit: 4, // keep 3–6 canvases in memory
  });

  useEffect(() => {
    if (!pdfSource) return;
    loadPdf(pdfSource).catch((err) => {
      // eslint-disable-next-line no-console
      console.error('Failed to load PDF:', err);
    });
  }, [pdfSource, loadPdf]);

  const zoomOut = () => setZoom((z) => Math.max(50, z - 10));
  const zoomIn = () => setZoom((z) => Math.min(200, z + 10));
  const resetZoom = () => setZoom(100);

  return (
    <div className={`pdf-viewer-root ${className}`} style={{ display: 'flex', flexDirection: 'column', ...style }}>
      {/* Optional minimal controls (can be removed if you provide external UI) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px' }}>
        <span style={{ fontSize: 12, color: '#666' }}>
          Page {currentPage || 1} of {totalPages || '?'}
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={() => navigateToPage(Math.max(1, (currentPage || 1) - 1))} disabled={!totalPages || (currentPage || 1) <= 1}>
            Prev
          </button>
          <button onClick={() => navigateToPage(Math.min(totalPages || 1, (currentPage || 1) + 1))} disabled={!totalPages || (currentPage || 1) >= (totalPages || 1)}>
            Next
          </button>
          <button onClick={zoomOut}>-</button>
          <span style={{ fontSize: 12 }}>{zoom}%</span>
          <button onClick={zoomIn}>+</button>
          <button onClick={resetZoom} title="Reset zoom">Reset</button>
        </div>
      </div>

      {/* Scrollable container that the hook manages */}
      <div
        ref={containerRef}
        className="pdf-scroll-container"
        style={{
          position: 'relative',
          overflowY: 'auto',
          overflowX: 'hidden',
          height: 'calc(100vh - 56px)',
          background: 'transparent',
        }}
      />
    </div>
  );
}
