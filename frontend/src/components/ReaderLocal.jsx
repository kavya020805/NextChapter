import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, ArrowRight, Moon, Sun, ZoomIn, ZoomOut, RotateCcw, MessageSquare, Image as ImageIcon, X, Menu } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?url';

if (pdfjsLib?.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

const ReaderLocal = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookId = searchParams.get('id');
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  
  const [bookTitle, setBookTitle] = useState('');
  const [bookDescription, setBookDescription] = useState('');
  const [bookCover, setBookCover] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [imageGenOpen, setImageGenOpen] = useState(false);
  const apiKey = import.meta.env.VITE_AI_API_KEY || ''; // Gemini API key from environment
  const apiProvider = 'gemini'; // Using Google Gemini
  const [messages, setMessages] = useState([]);
  const [chatbotInput, setChatbotInput] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageGenResult, setImageGenResult] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [readerTheme, setReaderTheme] = useState('light');
  // Dictionary states
  const [word, setWord] = useState('');
  const [definition, setDefinition] = useState('');
  const [dictLoading, setDictLoading] = useState(false);
  const [dictError, setDictError] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioTime, setAudioTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  
  const viewerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const headerRef = useRef(null);
  const lastScrollPageRef = useRef(1);
  // Track last page and timestamp used for reading session logging
  const lastSessionPageRef = useRef(1);
  const lastSessionTimestampRef = useRef(null);
  const navigationResetTimeoutRef = useRef(null);
  const pdfDocRef = useRef(null);        // pdf.js PDFDocumentProxy
  const renderTaskRef = useRef(null);    // current page render task

  useEffect(() => {
    return () => {
      if (navigationResetTimeoutRef.current) {
        clearTimeout(navigationResetTimeoutRef.current);
      }
    };
  }, []);





  const audioRef = useRef(null);

  // Highlighting states
  const [highlights, setHighlights] = useState([]);
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [highlightMenuPosition, setHighlightMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');
  const [selectedRange, setSelectedRange] = useState(null);
  const [highlightsVisible, setHighlightsVisible] = useState(true);

  // Bookmark states
  const [bookmarks, setBookmarks] = useState([]);
  const [showBookmarksDropdown, setShowBookmarksDropdown] = useState(false);
  const [isCurrentPageBookmarked, setIsCurrentPageBookmarked] = useState(false);

  // Load highlights for current book
  useEffect(() => {
    if (user && bookId) {
      loadHighlights();
      loadBookmarks();
    }
  }, [user, bookId]);

  // Check if current page is bookmarked
  useEffect(() => {
    if (bookmarks.length > 0 && currentPage) {
      const isBookmarked = bookmarks.some(b => b.page_number === currentPage);
      setIsCurrentPageBookmarked(isBookmarked);
    } else {
      setIsCurrentPageBookmarked(false);
    }
  }, [bookmarks, currentPage]);

  // Auto-hide controls after 3 seconds of inactivity
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      
      // Clear existing timeout
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      // Set new timeout to hide controls after 3 seconds
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    // Show controls initially
    setShowControls(true);
    
    // Add event listener
    window.addEventListener('mousemove', handleMouseMove);
    
    // Set initial timeout
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  const loadHighlights = async () => {
    if (!bookId) return;
    
    let loadedHighlights = [];

    // Try to load from database if user is logged in
    if (user) {
      try {
        const { data, error } = await supabase
          .from('book_highlights')
          .select('*')
          .eq('user_id', user.id)
          .eq('book_id', bookId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          loadedHighlights = data;
          console.log('Loaded highlights from database:', data.length);
        } else {
          console.log('Database load failed or table missing:', error);
        }
      } catch (err) {
        console.log('Error loading from database:', err);
      }
    }

    // Fallback to localStorage
    if (loadedHighlights.length === 0) {
      try {
        const storageKey = `highlights_${bookId}`;
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          loadedHighlights = JSON.parse(stored);
          console.log('Loaded highlights from localStorage:', loadedHighlights.length);
        }
      } catch (err) {
        console.error('Error loading from localStorage:', err);
      }
    }

    setHighlights(loadedHighlights);
  };

  // Toggle highlights visibility
  const toggleHighlights = () => {
    const textLayer = viewerRef.current?.querySelector('#text-layer');
    if (!textLayer) return;
    
    const newVisibility = !highlightsVisible;
    setHighlightsVisible(newVisibility);
    
    // Show/hide all highlights
    const highlightedSpans = textLayer.querySelectorAll('.book-highlight');
    highlightedSpans.forEach(span => {
      span.style.display = newVisibility ? '' : 'none';
    });
  };

  // Restore highlights for current page
  const restoreHighlightsForPage = useCallback((pageNum) => {
    if (!highlights.length || !highlightsVisible) return;
    
    // Wait for text layer to render
    setTimeout(() => {
      const textLayer = viewerRef.current?.querySelector('#text-layer');
      if (!textLayer) return;
      
      // Get all text from the page
      const spans = Array.from(textLayer.querySelectorAll('span'));
      const pageText = spans.map(s => s.textContent).join('');
      
      // Filter highlights for current page
      const pageHighlights = highlights.filter(h => {
        const page = h.page_number || h.location?.page;
        return page === pageNum;
      });
      
      console.log(`Restoring ${pageHighlights.length} highlights for page ${pageNum}`);
      
      pageHighlights.forEach(highlight => {
        try {
          const text = highlight.content || highlight.highlighted_text;
          if (!text) return;
          
          // Find the text in the page
          const textIndex = pageText.indexOf(text);
          if (textIndex === -1) {
            console.log('Text not found on page:', text.substring(0, 50));
            return;
          }
          
          // Calculate which spans contain this text
          let charCount = 0;
          let startSpanIndex = -1;
          let endSpanIndex = -1;
          
          for (let i = 0; i < spans.length; i++) {
            const spanText = spans[i].textContent;
            const spanStart = charCount;
            const spanEnd = charCount + spanText.length;
            
            if (startSpanIndex === -1 && spanEnd > textIndex) {
              startSpanIndex = i;
            }
            
            if (spanEnd >= textIndex + text.length) {
              endSpanIndex = i;
              break;
            }
            
            charCount += spanText.length;
          }
          
          // Apply highlight to the spans
          if (startSpanIndex !== -1 && endSpanIndex !== -1) {
            for (let i = startSpanIndex; i <= endSpanIndex; i++) {
              const span = spans[i];
              span.style.backgroundColor = highlight.color || '#ffeb3b';
              span.style.color = 'transparent';
              span.style.opacity = '0.6';
              span.classList.add('book-highlight');
              span.setAttribute('data-highlight-id', highlight.id);
            }
            console.log('Restored highlight:', text.substring(0, 50));
          }
        } catch (err) {
          console.error('Error restoring highlight:', err);
        }
      });
    }, 300);
  }, [highlights, highlightsVisible]);

  const saveHighlight = async (color = '#ffeb3b') => {
    if (!selectedText) {
      console.log('No text selected');
      return;
    }

    console.log('Saving highlight:', { selectedText, color, currentPage });

    // Create highlight object for local state
    const tempId = Date.now().toString();
    const highlightData = {
      id: tempId,
      user_id: user?.id || 'local',
      book_id: bookId,
      page_number: currentPage,
      content: selectedText,
      color: color,
      created_at: new Date().toISOString()
    };

    // Apply the visual highlight with temp ID
    applyHighlightToSelection(color, tempId);

    // Try to save to database if user is logged in
    if (user && bookId) {
      try {
        const { data, error } = await supabase
          .from('book_highlights')
          .insert([{
            user_id: user.id,
            book_id: bookId,
            content: selectedText,
            color: color,
            location: {
              page: currentPage,
              startOffset: selectedRange?.startOffset,
              endOffset: selectedRange?.endOffset,
              startContainer: selectedRange?.startContainer?.textContent,
              endContainer: selectedRange?.endContainer?.textContent
            }
          }])
          .select()
          .single();

        if (error) {
          console.error('Database error:', error);
          // Continue with local storage even if DB fails
        } else if (data) {
          highlightData.id = data.id;
          highlightData.location = data.location;
          console.log('Highlight saved to database:', data);
        }
      } catch (err) {
        console.error('Error saving to database:', err);
        // Continue with local storage
      }
    }

    // Add to local state
    setHighlights(prev => [highlightData, ...prev]);
    
    // Save to localStorage as backup
    try {
      const storageKey = `highlights_${bookId}`;
      const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
      existing.push(highlightData);
      localStorage.setItem(storageKey, JSON.stringify(existing));
    } catch (err) {
      console.error('Error saving to localStorage:', err);
    }

    setShowHighlightMenu(false);
    setSelectedText('');
    setSelectedRange(null);
  };

  const deleteHighlight = async (highlightId) => {
    // Try to delete from database if user is logged in
    if (user) {
      try {
        const { error } = await supabase
          .from('book_highlights')
          .delete()
          .eq('id', highlightId)
          .eq('user_id', user.id);

        if (error) {
          console.error('Database delete error:', error);
        }
      } catch (err) {
        console.error('Error deleting from database:', err);
      }
    }

    // Remove from local state
    setHighlights(prev => prev.filter(h => h.id !== highlightId));

    // Remove from localStorage
    try {
      const storageKey = `highlights_${bookId}`;
      const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const updated = existing.filter(h => h.id !== highlightId);
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (err) {
      console.error('Error deleting from localStorage:', err);
    }

    // Remove visual highlight from page
    const textLayer = viewerRef.current?.querySelector('#text-layer');
    if (textLayer) {
      const highlightedSpans = textLayer.querySelectorAll(`[data-highlight-id="${highlightId}"]`);
      highlightedSpans.forEach(span => {
        span.style.backgroundColor = '';
        span.style.opacity = '';
        span.classList.remove('book-highlight');
        span.removeAttribute('data-highlight-id');
      });
    }
  };

  // Bookmark functions
  const loadBookmarks = async () => {
    if (!user || !bookId) return;

    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .eq('book_id', bookId)
        .order('page_number', { ascending: true });

      if (error) {
        console.error('Error loading bookmarks:', error);
        return;
      }

      setBookmarks(data || []);
      console.log('Loaded bookmarks:', data?.length || 0);
    } catch (err) {
      console.error('Error loading bookmarks:', err);
    }
  };

  const toggleBookmark = async () => {
    if (!user || !bookId || !currentPage) return;

    try {
      if (isCurrentPageBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('book_id', bookId)
          .eq('page_number', currentPage);

        if (error) throw error;

        setBookmarks(prev => prev.filter(b => b.page_number !== currentPage));
        console.log('Bookmark removed from page', currentPage);
      } else {
        // Add bookmark
        const { data, error } = await supabase
          .from('bookmarks')
          .insert([{
            user_id: user.id,
            book_id: bookId,
            page_number: currentPage
          }])
          .select()
          .single();

        if (error) throw error;

        setBookmarks(prev => [...prev, data].sort((a, b) => a.page_number - b.page_number));
        console.log('Bookmark added to page', currentPage);
      }
    } catch (err) {
      console.error('Error toggling bookmark:', err);
    }
  };

  const goToBookmark = (pageNumber) => {
    setCurrentPage(pageNumber);
    navigateToPage(pageNumber);
    setShowBookmarksDropdown(false);
  };

  const applyHighlightToSelection = (color, highlightId = null) => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    try {
      const range = selection.getRangeAt(0);
      const textLayer = viewerRef.current?.querySelector('#text-layer');
      
      if (!textLayer) return;
      
      // Get all text spans in the selection
      const spans = Array.from(textLayer.querySelectorAll('span'));
      const selectedSpans = spans.filter(span => {
        const spanRange = document.createRange();
        spanRange.selectNodeContents(span);
        return range.intersectsNode(span);
      });
      
      // Apply highlight color to selected spans
      selectedSpans.forEach(span => {
        span.style.backgroundColor = color;
        span.style.color = 'transparent';
        span.style.opacity = '0.6';
        span.classList.add('book-highlight');
        span.setAttribute('data-highlight-color', color);
        if (highlightId) {
          span.setAttribute('data-highlight-id', highlightId);
        }
      });
      
      selection.removeAllRanges();
    } catch (e) {
      console.error('Error applying highlight:', e);
    }
  };

  // Handle text selection
  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    
    if (text.length > 0) {
      // Check if selection is within the text layer
      const textLayer = viewerRef.current?.querySelector('#text-layer');
      if (textLayer && (textLayer.contains(selection.anchorNode) || textLayer.contains(selection.focusNode))) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        setSelectedText(text);
        setSelectedRange({
          startOffset: range.startOffset,
          endOffset: range.endOffset,
          startContainer: range.startContainer,
          endContainer: range.endContainer
        });
        
        setHighlightMenuPosition({
          x: rect.left + rect.width / 2,
          y: rect.top - 10
        });
        setShowHighlightMenu(true);
        return;
      }
    }
    
    setShowHighlightMenu(false);
  };

  // Add mouseup listener for text selection
  useEffect(() => {
    const handleMouseUp = () => {
      setTimeout(handleTextSelection, 10);
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [currentPage]);

  // Render a single page into a canvas inside the viewer
  const renderPage = useCallback(async (pageNumber, zoomOverride) => {
    if (!pdfDocRef.current || !viewerRef.current) return;

    const total = pdfDocRef.current.numPages || totalPages || 1;
    const safePage = Math.max(1, Math.min(pageNumber, total));
    const zoomToUse = zoomOverride ?? zoomLevel;

    // Cancel any in-flight render
    if (renderTaskRef.current && typeof renderTaskRef.current.cancel === 'function') {
      try {
        renderTaskRef.current.cancel();
      } catch (e) {
        // ignore
      }
    }

    const container = viewerRef.current;
    const headerHeight = headerRef.current?.offsetHeight || 0;

    // Ensure we have a wrapper div, canvas, and text layer inside the viewer
    let wrapper = container.querySelector('#pdf-wrapper');
    let pageContainer;
    let canvas;
    let textLayer;
    
    if (!wrapper) {
      container.innerHTML = '';
      wrapper = document.createElement('div');
      wrapper.id = 'pdf-wrapper';
      wrapper.style.width = '100%';
      wrapper.style.display = 'flex';
      wrapper.style.flexDirection = 'column';
      wrapper.style.alignItems = 'center';
      
      // Create page container to hold canvas and text layer
      pageContainer = document.createElement('div');
      pageContainer.id = 'page-container';
      pageContainer.style.position = 'relative';
      pageContainer.style.maxWidth = '900px';
      pageContainer.style.width = '100%';
      
      canvas = document.createElement('canvas');
      canvas.id = 'pdfCanvas';
      canvas.style.width = '100%';
      canvas.style.height = 'auto';
      canvas.style.display = 'block';
      
      // Create text layer for text selection
      textLayer = document.createElement('div');
      textLayer.id = 'text-layer';
      textLayer.className = 'textLayer';
      textLayer.style.position = 'absolute';
      textLayer.style.left = '0';
      textLayer.style.top = '0';
      textLayer.style.right = '0';
      textLayer.style.bottom = '0';
      textLayer.style.overflow = 'hidden';
      textLayer.style.opacity = '1';
      textLayer.style.lineHeight = '1.0';
      textLayer.style.pointerEvents = 'auto';
      
      pageContainer.appendChild(canvas);
      pageContainer.appendChild(textLayer);
      wrapper.appendChild(pageContainer);
      container.appendChild(wrapper);
    } else {
      pageContainer = wrapper.querySelector('#page-container');
      canvas = wrapper.querySelector('canvas');
      textLayer = wrapper.querySelector('#text-layer');
      
      if (!pageContainer) {
        // Upgrade old structure
        canvas = wrapper.querySelector('canvas');
        pageContainer = document.createElement('div');
        pageContainer.id = 'page-container';
        pageContainer.style.position = 'relative';
        pageContainer.style.maxWidth = '900px';
        pageContainer.style.width = '100%';
        
        if (canvas) {
          wrapper.removeChild(canvas);
          pageContainer.appendChild(canvas);
        }
        
        textLayer = document.createElement('div');
        textLayer.id = 'text-layer';
        textLayer.className = 'textLayer';
        textLayer.style.position = 'absolute';
        textLayer.style.left = '0';
        textLayer.style.top = '0';
        textLayer.style.right = '0';
        textLayer.style.bottom = '0';
        textLayer.style.overflow = 'hidden';
        textLayer.style.opacity = '1';
        textLayer.style.lineHeight = '1.0';
        textLayer.style.pointerEvents = 'auto';
        
        pageContainer.appendChild(textLayer);
        wrapper.appendChild(pageContainer);
      }
    }

    // Add device-specific top margin to the canvas for better visibility below header
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const canvasMarginTop = isMobile ? '120px' : '80px';
    canvas.style.marginTop = canvasMarginTop;

    // Apply invert filter in reader mode
    canvas.style.filter = readerTheme === 'reader' ? 'invert(1)' : 'none';

    // Set wrapper padding so the PDF has space above and below
    // Increase top padding significantly with zoom so content stays accessible
    const zoomFactor = zoomToUse / 100;
    const topPadding = headerHeight + (400 * zoomFactor); // More space at higher zoom
    wrapper.style.paddingTop = `${topPadding}px`;
    wrapper.style.paddingBottom = '100px';

    try {
      const page = await pdfDocRef.current.getPage(safePage);
      const scale = zoomToUse / 100;
      const viewport = page.getViewport({ scale });

      const context = canvas.getContext('2d', { alpha: false });
      if (!context) return;

      const outputScale = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
      const targetWidth = Math.floor(viewport.width * outputScale);
      const targetHeight = Math.floor(viewport.height * outputScale);

      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
      }

      context.setTransform(outputScale, 0, 0, outputScale, 0, 0);
      context.imageSmoothingQuality = 'high';
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);

      const renderTask = page.render({ canvasContext: context, viewport });
      renderTaskRef.current = renderTask;
      await renderTask.promise;

      // Apply invert filter in reader mode after rendering
      canvas.style.filter = readerTheme === 'reader' ? 'invert(1)' : 'none';

      // Render text layer for text selection
      if (textLayer) {
        textLayer.innerHTML = '';
        textLayer.style.width = `${viewport.width}px`;
        textLayer.style.height = `${viewport.height}px`;
        // Use same margin as canvas and shift up one line
        textLayer.style.marginTop = canvasMarginTop;
        textLayer.style.top = '-7px';
        
        try {
          const textContent = await page.getTextContent();
          
          // Create text layer items
          textContent.items.forEach((item) => {
            const tx = pdfjsLib.Util.transform(
              pdfjsLib.Util.transform(viewport.transform, item.transform),
              [1, 0, 0, -1, 0, 0]
            );
            
            const style = textContent.styles?.[item.fontName];
            const angle = Math.atan2(tx[1], tx[0]);
            
            const span = document.createElement('span');
            span.textContent = item.str;
            span.style.position = 'absolute';
            span.style.left = `${tx[4]}px`;
            span.style.top = `${tx[5]}px`;
            span.style.fontSize = `${Math.sqrt(tx[2] * tx[2] + tx[3] * tx[3])}px`;
            span.style.fontFamily = style?.fontFamily || 'sans-serif';
            span.style.transform = `rotate(${angle}rad)`;
            span.style.transformOrigin = 'left bottom';
            span.style.whiteSpace = 'pre';
            span.style.color = 'transparent';
            span.style.userSelect = 'text';
            span.style.cursor = 'text';
            
            textLayer.appendChild(span);
          });
          
          // Restore highlights for this page
          restoreHighlightsForPage(safePage);
        } catch (textError) {
          console.error('Error rendering text layer:', textError);
        }
      }
    } catch (e) {
      console.error('Error rendering PDF page', e);
    }
  }, [totalPages, zoomLevel, readerTheme, restoreHighlightsForPage]);

  // Re-render when readerTheme changes to apply invert filter
  useEffect(() => {
    if (pdfDocRef.current && currentPage > 0) {
      renderPage(currentPage);
    }
  }, [readerTheme, renderPage]);

  // Save reading progress to database and localStorage
  useEffect(() => {
    if (!bookId || !totalPages || totalPages <= 0) return;
    if (!currentPage || currentPage <= 0) return;

    const normalizedCurrentPage = Math.min(currentPage, totalPages);
    let progress = 0;

    if (totalPages > 0) {
      if (normalizedCurrentPage <= 1) {
        // Page 1 is treated as 0% progress
        progress = 0;
      } else {
        // Reading progress = (current page / total pages) * 100 for pages > 1
        const rawProgress = (normalizedCurrentPage / totalPages) * 100;
        progress = Math.max(0, Math.min(100, Math.round(rawProgress)));
      }
    }
    
    // Save to localStorage for backward compatibility
    localStorage.setItem(`book_progress_${bookId}`, progress.toString());

    // Save to database if user is logged in
    // Always save current_page when progress > 0 (user has started reading)
    // For progress = 0, we only save if it's not a new book (to handle edge cases)
    if (user && user.id) {
      const saveProgress = async () => {
        try {
          const status = progress >= 100 ? 'read' : 'reading';
          
          // Always save current_page when progress > 0
          // This ensures we can resume from the exact page the user left off
          if (progress > 0) {
            // Upsert reading progress in user_books table
            const nowIso = new Date().toISOString();
            const { error: upsertError } = await supabase
              .from('user_books')
              .upsert({
                user_id: user.id,
                book_id: bookId,
                current_page: normalizedCurrentPage, // Always save the current page
                progress_percentage: progress,
                status: status,
                // When a book is finished, record a completion timestamp
                completed_at: progress >= 100 ? nowIso : null,
                updated_at: nowIso
              }, {
                onConflict: 'user_id,book_id'
              });

            if (upsertError) {
              console.error('Error saving reading progress:', upsertError);
            } else {
              console.log('Reading progress saved:', { currentPage: normalizedCurrentPage, progress });

              // Log reading session for activity dashboard
              try {
                const pagesDelta = Math.max(
                  0,
                  normalizedCurrentPage - (lastSessionPageRef.current || 1)
                );

                if (pagesDelta > 0) {
                  const now = new Date();
                  const todayStr = now.toISOString().split('T')[0];

                  // Approximate minutes spent since last logged session
                  let minutesDelta = 0;
                  if (lastSessionTimestampRef.current) {
                    minutesDelta = Math.round(
                      (now.getTime() - lastSessionTimestampRef.current.getTime()) / 60000
                    );
                    if (!Number.isFinite(minutesDelta) || minutesDelta <= 0) {
                      minutesDelta = 1;
                    }
                  } else {
                    minutesDelta = 1;
                  }

                  const { error: sessionError } = await supabase
                    .from('reading_sessions')
                    .insert({
                      user_id: user.id,
                      book_id: bookId,
                      date: todayStr,
                      minutes_read: minutesDelta,
                      pages_read: pagesDelta,
                    });

                  if (sessionError) {
                    console.error('Error logging reading session:', sessionError);
                  } else {
                    lastSessionPageRef.current = normalizedCurrentPage;
                    lastSessionTimestampRef.current = now;
                  }
                }
              } catch (sessionErr) {
                console.error('Unexpected error logging reading session:', sessionErr);
              }
            }
          } else {
            // Progress is 0 - don't save to database for new books
            // This keeps the database clean
            console.log('Progress is 0%, not saving to database (new book)');
          }
        } catch (err) {
          console.error('Error saving progress to database:', err);
        }
      };

      // Debounce database saves to avoid too many writes
      const timeoutId = setTimeout(saveProgress, 1000);
      return () => clearTimeout(timeoutId);
    } else if (user && user.id && progress === 0 && normalizedCurrentPage === 1) {
      // For new books (page 1, 0% progress), ensure we don't have stale data
      // Delete any existing record with 0% progress to keep database clean
      const cleanupProgress = async () => {
        try {
          const { data: existing } = await supabase
            .from('user_books')
            .select('progress_percentage')
            .eq('user_id', user.id)
            .eq('book_id', bookId)
            .single();
          
          // Only delete if there's a record with 0% progress (stale data)
          if (existing && existing.progress_percentage === 0) {
            await supabase
              .from('user_books')
              .delete()
              .eq('user_id', user.id)
              .eq('book_id', bookId);
          }
        } catch (err) {
          // Ignore errors - this is just cleanup
        }
      };
      
      // Run cleanup after a delay to avoid race conditions
      const cleanupTimeout = setTimeout(cleanupProgress, 2000);
      return () => clearTimeout(cleanupTimeout);
    }

    // Update localStorage read list for backward compatibility
    const readList = JSON.parse(localStorage.getItem('read') || '[]');
    if (progress >= 100) {
      if (!readList.includes(bookId)) {
        const updated = [...readList, bookId];
        localStorage.setItem('read', JSON.stringify(updated));
      }
    } else if (readList.includes(bookId)) {
      const updated = readList.filter((existingId) => existingId !== bookId);
      localStorage.setItem('read', JSON.stringify(updated));
    }
  }, [bookId, currentPage, totalPages, user]);

  useEffect(() => {
    if (!bookId) {
      setBookTitle('No book selected');
      setLoading(false);
      setError('No book ID provided');
      return;
    }
    
    const loadBook = async () => {
      setLoading(true);
      setError('');
      
      try {
        console.log('Loading book with ID:', bookId);
        
        // Fetch book from Supabase
        const { data: book, error } = await supabase
          .from('books')
          .select('*')
          .eq('id', bookId)
          .single();
        
        if (error) {
          console.error('Supabase error:', error);
          throw new Error('Failed to load book from database');
        }
        
        if (!book) {
          throw new Error('Book not found');
        }
        
        console.log('Book found:', book);
        setBookTitle(book.title || 'Untitled');
        setBookDescription(book.description || '');
        setBookCover(book.cover_image || '');
        
        // Get PDF file from Supabase Storage
        // Prefer full URL in pdf_file, then explicit path/filename fields
        const pdfFileName = book.pdf_file || book.pdf_path || book.pdf_filename;
        
        if (!pdfFileName) {
          throw new Error('No PDF file found for this book');
        }
        
        console.log('Loading PDF file:', pdfFileName);

        // Load saved reading progress from database
        let savedPage = 1;
        let savedProgress = 0;
        if (user && bookId) {
          try {
            const { data: userBook, error: progressError } = await supabase
              .from('user_books')
              .select('current_page, progress_percentage')
              .eq('user_id', user.id)
              .eq('book_id', bookId)
              .single();

            // Load saved progress if it exists and progress > 0
            if (!progressError && userBook) {
              const progress = userBook.progress_percentage || 0;
              const page = userBook.current_page || 1;
              
              if (progress > 0 && page >= 1) {
                // User has reading progress - resume from saved page
                savedPage = Math.max(1, page);
                savedProgress = progress;
                console.log('Loaded saved reading progress - Page:', savedPage, 'Progress:', savedProgress + '%');
              } else {
                // No valid progress - start fresh from page 1
                savedPage = 1;
                savedProgress = 0;
                console.log('No valid reading progress found, starting from page 1');
              }
            } else {
              // No record found - start fresh from page 1
              savedPage = 1;
              savedProgress = 0;
              console.log('No reading progress record found, starting fresh from page 1');
            }
          } catch (err) {
            // No record found or error - start fresh
            savedPage = 1;
            savedProgress = 0;
            console.log('Error loading reading progress, starting fresh from page 1:', err);
          }
        } else {
          // No user logged in - start from page 1
          savedPage = 1;
          savedProgress = 0;
        }

        // Normalize storage path (handle absolute URLs or bucket-prefixed paths)
        let normalizedPdfPath = pdfFileName.trim();
        const isExternalPdf = /^https?:\/\//i.test(normalizedPdfPath);

        if (!isExternalPdf) {
          if (/^book-storage\//i.test(normalizedPdfPath)) {
            normalizedPdfPath = normalizedPdfPath.replace(/^book-storage\//i, '');
          }
          if (/^public\//i.test(normalizedPdfPath)) {
            normalizedPdfPath = normalizedPdfPath.replace(/^public\//i, '');
          }
          if (normalizedPdfPath.startsWith('/')) {
            normalizedPdfPath = normalizedPdfPath.slice(1);
          }
        }

        // Set initial page from saved progress
        lastScrollPageRef.current = savedPage;
        lastSessionPageRef.current = savedPage;
        setCurrentPage(savedPage);
        
        const initializePdfViewer = async () => {
          if (!viewerRef.current) {
            throw new Error('Viewer container not available');
          }

          try {
            setLoading(true);

            if (viewerRef.current) {
              viewerRef.current.innerHTML = '';
            }

            let fullPdfUrl = '';

            if (isExternalPdf) {
              fullPdfUrl = normalizedPdfPath;
            } else {
              const { data: urlData } = supabase
                .storage
                .from('Book-storage')
                .getPublicUrl(normalizedPdfPath);

              fullPdfUrl = urlData?.publicUrl || '';
            }

            if (!fullPdfUrl) {
              throw new Error('Could not resolve PDF URL');
            }

            // Load PDF document via pdf.js
            const loadingTask = pdfjsLib.getDocument(fullPdfUrl);
            const pdf = await loadingTask.promise;
            pdfDocRef.current = pdf;
            setTotalPages(pdf.numPages || 0);

            const initialPage = Math.max(1, savedPage);
            setCurrentPage(initialPage);
            lastScrollPageRef.current = initialPage;

            // Render the initial page
            await renderPage(initialPage, zoomLevel);
          } catch (viewerError) {
            console.error('Error initializing PDF.js viewer:', viewerError);
            setError('Error loading PDF. Please check if the file exists.');
          } finally {
            setLoading(false);
          }
        };

        await initializePdfViewer();

        const resolveAudio = async (title) => {
          const bucket = supabase.storage.from('audiobook_mp3');
          const makeSlug = (t) => t.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
          const trimmed = title.trim();
          const candidates = [
            `${trimmed}.mp3`,
            `${makeSlug(trimmed)}.mp3`,
            `${trimmed.replace(/\s+/g, ' ')}.mp3`,
          ];
          const headOk = async (url) => {
            try {
              const resp = await fetch(url, { method: 'HEAD' });
              return resp.ok;
            } catch { return false; }
          };
          try {
            setAudioLoading(true);
            setAudioError('');
            for (const key of candidates) {
              const pub = bucket.getPublicUrl(key)?.data?.publicUrl;
              if (pub && await headOk(pub)) { setAudioUrl(pub); return; }
            }
            setAudioError('Audiobook not available');
          } catch (e) {
            setAudioError('Audiobook not available');
          } finally {
            setAudioLoading(false);
          }
        };

        if (book.title) {
          await resolveAudio(book.title);
        }
      } catch (e) {
        console.error('Failed to load book:', e);
        setError(e.message);
        setBookTitle('Failed to load book');
        if (viewerRef.current) {
          viewerRef.current.innerHTML = `<div class="empty" style="padding: 40px; text-align: center;">
            <h3>Error Loading Book</h3>
            <p>${e.message}</p>
            <p style="font-size: 12px; color: #666; margin-top: 10px;">Book ID: ${bookId}</p>
          </div>`;
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadBook();
  }, [bookId]);

  const navigateToPage = useCallback((page) => {
    if (page < 1 || (totalPages > 0 && page > totalPages)) {
      console.log('Navigation blocked:', page, 'totalPages:', totalPages);
      return;
    }

    setCurrentPage(page);
    lastScrollPageRef.current = page;

    if (!pdfDocRef.current) {
      console.warn('PDF document not loaded yet for navigation');
      return;
    }

    renderPage(page);
  }, [totalPages, renderPage]);


  const handleZoom = (delta) => {
    const next = Math.max(50, Math.min(150, zoomLevel + delta));
    setZoomLevel(next);
    updateZoomInPDF(next);
  };

  const resetZoom = () => {
    setZoomLevel(100);
    updateZoomInPDF(100);
  };

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onTime = () => setAudioTime(el.currentTime || 0);
    const onMeta = () => setAudioDuration(el.duration || 0);
    const onEnd = () => setIsPlaying(false);
    el.addEventListener('timeupdate', onTime);
    el.addEventListener('loadedmetadata', onMeta);
    el.addEventListener('ended', onEnd);
    return () => {
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('loadedmetadata', onMeta);
      el.removeEventListener('ended', onEnd);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    if (isPlaying) {
      el.pause();
      setIsPlaying(false);
    } else {
      el.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const onSeek = (e) => {
    const el = audioRef.current;
    if (!el) return;
    const v = Number(e.target.value) || 0;
    el.currentTime = v;
    setAudioTime(v);
  };

  // Dictionary: fetch meaning for a word
  const fetchMeaning = async (w) => {
    const query = (w || '').trim();
    if (!query) return;
    setDictLoading(true);
    setDictError('');
    setDefinition('');
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('No definition found');
      const def = data[0]?.meanings?.[0]?.definitions?.[0]?.definition;
      setDefinition(def || 'Meaning not available');
    } catch (e) {
      setDictError('Could not fetch meaning. Try another word.');
    } finally {
      setDictLoading(false);
    }
  };

  const handleChatSend = async () => {
    if (!chatbotInput.trim() || !apiKey) return;
    
    const userMessage = chatbotInput.trim();
    setChatbotInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    
    const systemPrompt = `You are an AI assistant helping a reader with the book "${bookTitle}". The reader is currently on page ${currentPage}${totalPages > 0 ? ` of ${totalPages}` : ''}.

Book: ${bookTitle}
Current Page: ${currentPage}

Provide helpful, concise responses about the book considering the context of the current page they're reading.`;
    
    setMessages(prev => [...prev, { role: 'ai', text: 'Thinking...' }]);
    
    try {
      // Build conversation history for Gemini
      const conversationHistory = messages.map(m => ({
        role: m.role === 'ai' ? 'model' : 'user',
        parts: [{ text: m.text }]
      }));
      
      // Add system prompt as first user message and model response
      const geminiMessages = [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'I understand. I will help you with questions about this book.' }] },
        ...conversationHistory,
        { role: 'user', parts: [{ text: userMessage }] }
      ];
      
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: geminiMessages,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';
      
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { role: 'ai', text: aiResponse };
        return newMessages;
      });
    } catch (error) {
      let errorMsg = 'Sorry, I encountered an error. ';
      if (error.message.includes('401') || error.message.includes('Unauthorized') || error.message.includes('API_KEY_INVALID')) {
        errorMsg += 'Invalid API key. Please check your Gemini API key.';
      } else if (error.message.includes('429') || error.message.includes('RESOURCE_EXHAUSTED')) {
        errorMsg += 'Rate limit exceeded. Please try again later.';
      } else {
        errorMsg += error.message;
      }
      
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { role: 'ai', text: errorMsg };
        return newMessages;
      });
    }
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim() || !apiKey) return;
    
    const prompt = imagePrompt.trim();
    setImageGenResult(null);
    
    try {
      const enhancedPrompt = `${prompt}. Book context: "${bookTitle}", page ${currentPage}. Create a high-quality, detailed, artistic visualization.`;
      
      // Use Gemini Imagen 4.0 API
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          instances: [{
            prompt: enhancedPrompt
          }],
          parameters: {
            sampleCount: 1,
            aspectRatio: "1:1",
            safetyFilterLevel: "block_some",
            personGeneration: "allow_adult"
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      const imageData = data.predictions?.[0]?.bytesBase64Encoded;
      
      if (imageData) {
        const imageUrl = `data:image/png;base64,${imageData}`;
        setImageGenResult({
          url: imageUrl,
          prompt: enhancedPrompt
        });
      } else {
        throw new Error('No image data received');
      }
    } catch (error) {
      alert(`Failed to generate image: ${error.message}`);
    }
  };

  const downloadImage = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      alert('Failed to download image: ' + error.message);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't interfere with input fields
      if (e.target.matches('input, textarea') || e.target.closest('.chatbot-panel')) {
        return;
      }
      
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || (e.key === ' ' && !e.target.matches('input, textarea'))) {
        e.preventDefault();
        e.stopPropagation();
        if (totalPages === 0 || currentPage < totalPages) {
          navigateToPage(currentPage + 1);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        e.stopPropagation();
        if (currentPage > 1) {
          navigateToPage(currentPage - 1);
        }
      } else if (e.key === 'Home') {
        e.preventDefault();
        e.stopPropagation();
        navigateToPage(1);
      } else if (e.key === 'End' && totalPages > 0) {
        e.preventDefault();
        e.stopPropagation();
        navigateToPage(totalPages);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages, navigateToPage]);

  // Update header height CSS variable for sidebar positioning
  useEffect(() => {
    if (headerRef.current) {
      const height = headerRef.current.offsetHeight;
      document.documentElement.style.setProperty('--header-height', `${height}px`);
    }
    
    // Update on window resize
    const handleResize = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight;
        document.documentElement.style.setProperty('--header-height', `${height}px`);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [bookTitle]);

  return (
    <div className={readerTheme === 'dark' ? 'dark' : ''}>
      <div className={`min-h-screen ${readerTheme === 'dark' ? 'bg-dark-gray' : 'bg-white'} ${readerTheme === 'reader' ? 'bg-black reader-mode' : ''}`}>
        {readerTheme === 'reader' && (
          <style>{`
            .reader-mode .pdf-canvas, .reader-mode .pdf-thumb { filter: invert(1) hue-rotate(180deg); }
          `}</style>
        )}
        <div className="flex h-screen">
        {/* Main Reader Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Reader Header */}
          <div ref={headerRef} className={`border-b-2 px-8 py-3 bg-white dark:bg-dark-gray border-dark-gray dark:border-white ${readerTheme === 'reader' ? 'bg-black border-gray-800 text-white' : ''}`}>
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              <button 
                onClick={() => navigate(-1)}
                className="text-[10px] font-medium uppercase tracking-widest text-dark-gray/60 dark:text-white/60 hover:text-dark-gray dark:hover:text-white transition-colors shrink-0 bg-transparent border-0 cursor-pointer"
              >
                ← Back
              </button>
              <h1 className="text-sm md:text-base text-dark-gray dark:text-white font-light leading-tight truncate flex-1 text-center px-4">
                {bookTitle || 'Loading…'}
              </h1>
              <button
                onClick={() => {
                  if (chatbotOpen) {
                    setChatbotOpen(false);
                  } else if (imageGenOpen) {
                    setImageGenOpen(false);
                  } else {
                    setSidebarOpen(!sidebarOpen);
                  }
                }}
                className="w-8 h-8 bg-transparent border border-dark-gray/30 dark:border-white/30 text-dark-gray dark:text-white flex items-center justify-center hover:bg-dark-gray/5 dark:hover:bg-white/5 transition-colors shrink-0"
                title={chatbotOpen || imageGenOpen ? "Close" : (sidebarOpen ? "Close Controls" : "Open Controls")}
              >
                {(sidebarOpen || chatbotOpen || imageGenOpen) ? (
                  <X className="w-4 h-4" />
                ) : (
                  <Menu className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          
          {/* PDF Viewer */}
          <div className={`flex-1 relative overflow-hidden ${readerTheme === 'reader' ? 'bg-black' : 'bg-white/5 dark:bg-dark-gray/5'}`}>
            {/* Previous Page Button */}
            <button 
              className={`
                absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-10 
                w-12 h-12
                bg-white/90 dark:bg-dark-gray/90
                ${readerTheme === 'reader' ? 'bg-dark-gray/90 text-white' : 'text-dark-gray dark:text-white'}
                flex items-center justify-center
                hover:bg-white dark:hover:bg-dark-gray hover:scale-105
                transition-all duration-300
                disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100
                shadow-lg
                ${loading || !showControls ? 'opacity-0 pointer-events-none' : 'opacity-100'}
              `}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (currentPage > 1) {
                  navigateToPage(currentPage - 1);
                }
              }}
              disabled={currentPage <= 1}
              title="Previous Page"
              aria-label="Previous Page"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* PDF Container */}
            <div 
              id="viewer" 
              ref={viewerRef} 
              className={`w-full h-full relative overflow-y-auto overflow-x-hidden pt-4 md:pt-6 ${loading ? 'invisible' : ''}`}
            ></div>

            {/* Next Page Button */}
            <button 
              className={`
                absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-10 
                w-12 h-12
                bg-white/90 dark:bg-dark-gray/90
                ${readerTheme === 'reader' ? 'bg-dark-gray/90 text-white' : 'text-dark-gray dark:text-white'}
                flex items-center justify-center
                hover:bg-white dark:hover:bg-dark-gray hover:scale-105
                transition-all duration-300
                disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100
                shadow-lg
                ${loading || !showControls ? 'opacity-0 pointer-events-none' : 'opacity-100'}
              `}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (totalPages === 0 || currentPage < totalPages) {
                  navigateToPage(currentPage + 1);
                }
              }}
              disabled={totalPages > 0 && currentPage >= totalPages}
              title="Next Page"
              aria-label="Next Page"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            {loading && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-dark-gray dark:text-white text-sm uppercase tracking-widest">
                Loading PDF…
              </div>
            )}
            {error && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500 text-sm uppercase tracking-widest">
                {error}
              </div>
            )}
          </div>
        </div>
        
        {/* Sidebar */}
        <div className={`fixed right-0 w-80 bg-white dark:bg-dark-gray border-l-2 border-dark-gray dark:border-white overflow-y-auto transform transition-transform duration-300 z-50 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} ${readerTheme === 'reader' ? 'bg-black border-gray-800 text-white' : ''}`} style={{ top: 'var(--header-height, 73px)', height: 'calc(100vh - var(--header-height, 73px))' }}>
          <div className="p-4 space-y-4">
            {/* Page Counter */}
            <div className="space-y-2 pb-4 border-b border-dark-gray/10 dark:border-white/10">
              <div className="text-[10px] font-medium uppercase tracking-widest text-dark-gray/60 dark:text-white/60">
                Page
              </div>
              <div className="flex items-center gap-2">
                <button 
                  className="w-7 h-7 bg-transparent border border-dark-gray/30 dark:border-white/30 text-dark-gray dark:text-white flex items-center justify-center hover:bg-dark-gray/5 dark:hover:bg-white/5 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) {
                      navigateToPage(currentPage - 1);
                    }
                  }} 
                  disabled={currentPage <= 1}
                >
                  <ArrowLeft className="w-3 h-3" />
                </button>
                <div className="flex-1 text-center">
                  <div className="text-lg text-dark-gray dark:text-white leading-none">
                    {currentPage}
                  </div>
                  <div className="text-[9px] font-medium uppercase tracking-widest text-dark-gray/50 dark:text-white/50">
                    of {totalPages || '?'}
                  </div>
                </div>
                <button 
                  className="w-7 h-7 bg-transparent border border-dark-gray/30 dark:border-white/30 text-dark-gray dark:text-white flex items-center justify-center hover:bg-dark-gray/5 dark:hover:bg-white/5 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                  onClick={(e) => {
                    e.preventDefault();
                    if (totalPages === 0 || currentPage < totalPages) {
                      navigateToPage(currentPage + 1);
                    }
                  }}
                  disabled={totalPages > 0 && currentPage >= totalPages}
                >
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <input 
                  type="number"
                  min="1"
                  max={totalPages > 0 ? totalPages : undefined}
                  placeholder="Go to page..."
                  className="flex-1 bg-transparent border border-dark-gray/30 dark:border-white/30 px-2 py-1.5 text-xs text-dark-gray dark:text-white placeholder-dark-gray/40 dark:placeholder-white/40 focus:outline-none focus:border-dark-gray dark:focus:border-white transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const pageNum = parseInt(e.target.value);
                      if (pageNum && pageNum >= 1 && (totalPages === 0 || pageNum <= totalPages)) {
                        navigateToPage(pageNum);
                        e.target.value = '';
                      }
                    }
                  }}
                />
                <button 
                  className="px-3 py-1.5 bg-dark-gray dark:bg-white text-white dark:text-dark-gray border border-dark-gray dark:border-white text-[10px] font-medium uppercase tracking-widest hover:opacity-80 transition-opacity"
                  onClick={(e) => {
                    const input = e.target.previousElementSibling;
                    const pageNum = parseInt(input.value);
                    if (pageNum && pageNum >= 1 && (totalPages === 0 || pageNum <= totalPages)) {
                      navigateToPage(pageNum);
                      input.value = '';
                    }
                  }}
                >
                  Go
                </button>
              </div>
            </div>
            
            {/* Audiobook */}
            <div className="space-y-2 pt-4 pb-4 border-b border-dark-gray/10 dark:border-white/10">
              <div className="text-[10px] font-medium uppercase tracking-widest text-dark-gray/60 dark:text-white/60">
                Audiobook
              </div>
              {audioLoading && (
                <div className="text-xs text-dark-gray/60 dark:text-white/60">Loading audiobook…</div>
              )}
              {audioError && (
                <div className="text-xs text-red-500">{audioError}</div>
              )}
              {!audioLoading && !audioError && audioUrl && (
                <div className="space-y-2">
                  <audio ref={audioRef} src={audioUrl} preload="metadata" />
                  <div className="flex items-center gap-2">
                    <button 
                      className="px-3 py-1.5 bg-dark-gray dark:bg-white text-white dark:text-dark-gray border border-dark-gray dark:border-white text-[10px] font-medium uppercase tracking-widest hover:opacity-80 transition-opacity"
                      onClick={togglePlay}
                    >
                      {isPlaying ? 'Pause' : 'Play'}
                    </button>
                    <div className="text-[10px] text-dark-gray/60 dark:text-white/60 min-w-[70px] text-right">
                      {Math.floor(audioTime / 60)}:{String(Math.floor(audioTime % 60)).padStart(2, '0')}
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={audioDuration || 0}
                      step="1"
                      value={Math.min(audioTime, audioDuration || 0)}
                      onChange={onSeek}
                      className="flex-1"
                    />
                    <div className="text-[10px] text-dark-gray/60 dark:text-white/60 min-w-[70px]">
                      {Math.floor(audioDuration / 60)}:{String(Math.floor((audioDuration % 60) || 0)).padStart(2, '0')}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Zoom */}
            <div className="space-y-2 pt-4 pb-4 border-b border-dark-gray/10 dark:border-white/10">
              <div className="text-[10px] font-medium uppercase tracking-widest text-dark-gray/60 dark:text-white/60">
                Zoom
              </div>
              <div className="flex items-center gap-2">
                <button 
                  className="w-7 h-7 bg-transparent border border-dark-gray/30 dark:border-white/30 text-dark-gray dark:text-white flex items-center justify-center hover:bg-dark-gray/5 dark:hover:bg-white/5 transition-colors"
                  onClick={() => handleZoom(-10)}
                >
                  <ZoomOut className="w-3 h-3" />
                </button>
                <span className="text-xs font-medium text-dark-gray dark:text-white min-w-[40px] text-center">
                  {zoomLevel}%
                </span>
                <button 
                  className="w-7 h-7 bg-transparent border border-dark-gray/30 dark:border-white/30 text-dark-gray dark:text-white flex items-center justify-center hover:bg-dark-gray/5 dark:hover:bg-white/5 transition-colors"
                  onClick={() => handleZoom(10)}
                >
                  <ZoomIn className="w-3 h-3" />
                </button>
                <button 
                  className="w-7 h-7 bg-transparent border border-dark-gray/30 dark:border-white/30 text-dark-gray dark:text-white flex items-center justify-center hover:bg-dark-gray/5 dark:hover:bg-white/5 transition-colors"
                  onClick={resetZoom}
                  title="Reset"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Highlights Toggle */}
            <div className="space-y-2 pt-4 pb-4 border-b border-dark-gray/10 dark:border-white/10">
              <div className="text-[10px] font-medium uppercase tracking-widest text-dark-gray/60 dark:text-white/60">
                Highlights
              </div>
              <button
                className={`w-full px-3 py-2 text-[10px] uppercase tracking-widest border transition-colors ${
                  highlightsVisible 
                    ? 'bg-dark-gray text-white border-dark-gray dark:bg-white dark:text-dark-gray dark:border-white' 
                    : 'bg-transparent text-dark-gray dark:text-white border-dark-gray/30 dark:border-white/30'
                }`}
                onClick={toggleHighlights}
              >
                {highlightsVisible ? 'Hide Highlights' : 'Show Highlights'}
              </button>
              {highlights.length > 0 && (
                <div className="text-[9px] text-dark-gray/60 dark:text-white/60 text-center">
                  {highlights.length} highlight{highlights.length !== 1 ? 's' : ''} saved
                </div>
              )}
            </div>

            {/* Bookmarks */}
            <div className="space-y-2 pt-4 pb-4 border-b border-dark-gray/10 dark:border-white/10">
              <div className="text-[10px] font-medium uppercase tracking-widest text-dark-gray/60 dark:text-white/60">
                Bookmarks
              </div>
              <button
                className={`w-full px-3 py-2 text-[10px] uppercase tracking-widest border transition-colors ${
                  isCurrentPageBookmarked
                    ? 'bg-dark-gray text-white border-dark-gray dark:bg-white dark:text-dark-gray dark:border-white' 
                    : 'bg-transparent text-dark-gray dark:text-white border-dark-gray/30 dark:border-white/30'
                }`}
                onClick={toggleBookmark}
              >
                {isCurrentPageBookmarked ? '★ Bookmarked' : '☆ Bookmark Page'}
              </button>
              {bookmarks.length > 0 && (
                <div className="relative">
                  <button
                    className="w-full px-3 py-2 text-[10px] uppercase tracking-widest border border-dark-gray/30 dark:border-white/30 text-dark-gray dark:text-white hover:bg-dark-gray/5 dark:hover:bg-white/5 transition-colors flex items-center justify-between"
                    onClick={() => setShowBookmarksDropdown(!showBookmarksDropdown)}
                  >
                    <span>View Bookmarks ({bookmarks.length})</span>
                    <span>{showBookmarksDropdown ? '▲' : '▼'}</span>
                  </button>
                  {showBookmarksDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-dark-gray border-2 border-dark-gray dark:border-white max-h-48 overflow-y-auto z-50">
                      {bookmarks.map((bookmark) => (
                        <button
                          key={bookmark.bookmark_id}
                          className={`w-full px-3 py-2 text-left text-[10px] border-b border-dark-gray/10 dark:border-white/10 hover:bg-dark-gray/10 dark:hover:bg-white/10 transition-colors ${
                            bookmark.page_number === currentPage ? 'bg-dark-gray/5 dark:bg-white/5' : ''
                          }`}
                          onClick={() => goToBookmark(bookmark.page_number)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-dark-gray dark:text-white">Page {bookmark.page_number}</span>
                            {bookmark.page_number === currentPage && (
                              <span className="text-dark-gray dark:text-white">●</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Theme */}
            <div className="space-y-2 pt-4 pb-4 border-b border-dark-gray/10 dark:border-white/10">
              <div className="text-[10px] font-medium uppercase tracking-widest text-dark-gray/60 dark:text-white/60">
                Theme
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  className={`px-2 py-1.5 text-[10px] uppercase tracking-widest border ${readerTheme === 'light' ? 'bg-dark-gray text-white border-dark-gray' : 'bg-transparent text-dark-gray dark:text-white border-dark-gray/30 dark:border-white/30'}`}
                  onClick={() => setReaderTheme('light')}
                >
                  Light
                </button>
                <button
                  className={`px-2 py-1.5 text-[10px] uppercase tracking-widest border ${readerTheme === 'dark' ? 'bg-white text-dark-gray border-white' : 'bg-transparent text-dark-gray dark:text-white border-dark-gray/30 dark:border-white/30'}`}
                  onClick={() => setReaderTheme('dark')}
                >
                  Dark
                </button>
                <button
                  className={`px-2 py-1.5 text-[10px] uppercase tracking-widest border ${readerTheme === 'reader' ? 'bg-amber-600 text-white border-amber-600' : 'bg-transparent text-dark-gray dark:text-white border-dark-gray/30 dark:border-white/30'}`}
                  onClick={() => setReaderTheme('reader')}
                >
                  Reader
                </button>
              </div>
            </div>
            
            {/* AI Features */}
            <div className="space-y-2 pt-4 pb-4 border-b border-dark-gray/10 dark:border-white/10">
              <div className="text-[10px] font-medium uppercase tracking-widest text-dark-gray/60 dark:text-white/60">
                AI Features
              </div>
              <div className="flex gap-2">
                <button 
                  className="flex-1 bg-transparent border border-dark-gray/30 dark:border-white/30 text-dark-gray dark:text-white px-3 py-2 flex items-center justify-center gap-2 hover:bg-dark-gray/5 dark:hover:bg-white/5 transition-colors"
                  onClick={() => {
                    setChatbotOpen(!chatbotOpen);
                    setSidebarOpen(false);
                  }}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-medium uppercase tracking-widest">Chat</span>
                </button>
                <button 
                  className="flex-1 bg-transparent border border-dark-gray/30 dark:border-white/30 text-dark-gray dark:text-white px-3 py-2 flex items-center justify-center gap-2 hover:bg-dark-gray/5 dark:hover:bg-white/5 transition-colors"
                  onClick={() => {
                    setImageGenOpen(!imageGenOpen);
                    setSidebarOpen(false);
                  }}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-medium uppercase tracking-widest">Image</span>
                </button>
              </div>
            </div>

            {/* Dictionary */}
            <div className="space-y-2 pt-4 pb-1 border-b border-dark-gray/10 dark:border-white/10">
              <div className="text-[10px] font-medium uppercase tracking-widest text-dark-gray/60 dark:text-white/60">
                Dictionary
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 bg-transparent border border-dark-gray/30 dark:border-white/30 px-3 py-2 text-xs text-dark-gray dark:text-white placeholder-dark-gray/40 dark:placeholder-white/40 focus:outline-none focus:border-dark-gray dark:focus:border-white transition-colors"
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      fetchMeaning(word);
                    }
                  }}
                  placeholder="Enter a word to look up…"
                />
                <button
                  className="bg-dark-gray dark:bg-white text-white dark:text-dark-gray border border-dark-gray dark:border-white px-3 py-2 text-[10px] font-medium uppercase tracking-widest hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                  onClick={() => fetchMeaning(word)}
                  disabled={!word.trim()}
                >
                  Search
                </button>
              </div>
              <div className="text-xs text-dark-gray/80 dark:text-white/80">
                {dictLoading && <div>Loading…</div>}
                {dictError && <div className="text-red-500">{dictError}</div>}
                {!dictLoading && !dictError && definition && (
                  <div className="bg-dark-gray/5 dark:bg-white/5 border border-dark-gray/20 dark:border-white/20 p-2 rounded">
                    {definition}
                  </div>
                )}
              </div>
              <div className="text-[10px] text-dark-gray/60 dark:text-white/60">
                Note: Selecting text inside the PDF may not be accessible due to browser security. Type the word here to look it up.
              </div>
            </div>
            
            {/* Book Cover & Description */}
            {(bookCover || bookDescription) && (
              <div className="space-y-3 pt-4">
                <div className="text-[10px] font-medium uppercase tracking-widest text-dark-gray/60 dark:text-white/60">
                  About This Book
                </div>
                {bookCover && (
                  <div className="w-full aspect-2/3 bg-dark-gray/5 dark:bg-white/5 border border-dark-gray/20 dark:border-white/20 overflow-hidden">
                    <img 
                      src={bookCover} 
                      alt={bookTitle}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                {bookDescription && (
                  <p className="text-xs text-dark-gray/70 dark:text-white/70 leading-relaxed font-light line-clamp-4">
                    {bookDescription}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Chatbot Panel */}
      {chatbotOpen && (
        <div className="fixed right-0 w-96 bg-white dark:bg-dark-gray border-l-2 border-dark-gray dark:border-white shadow-lg z-50 flex flex-col transform transition-transform duration-300" style={{ top: 'var(--header-height, 73px)', height: 'calc(100vh - var(--header-height, 73px))' }}>
          <div className="p-4 border-b border-dark-gray/10 dark:border-white/10">
            <h3 className="text-xs font-medium uppercase tracking-widest text-dark-gray dark:text-white">AI Book Assistant</h3>
          </div>
          <div className="p-3 bg-dark-gray/5 dark:bg-white/5 border-b border-dark-gray/10 dark:border-white/10">
            <div className="text-[10px] text-dark-gray/70 dark:text-white/70">
              📖 {bookTitle} - Page {currentPage}{totalPages > 0 ? ` of ${totalPages}` : ''}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="bg-dark-gray/5 dark:bg-white/5 border border-dark-gray/30 dark:border-white/30 p-3 rounded text-sm text-dark-gray dark:text-white">
                Hey there! I'm here to chat about "{bookTitle}" with you. Ask me anything about the book, characters, plot, or just share your thoughts!
              </div>
            )}
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`p-3 rounded text-xs ${
                  msg.role === 'user' 
                    ? 'bg-dark-gray dark:bg-white text-white dark:text-dark-gray ml-auto max-w-[85%]' 
                    : 'bg-dark-gray/5 dark:bg-white/5 border border-dark-gray/30 dark:border-white/30 text-dark-gray dark:text-white max-w-[85%]'
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-dark-gray/10 dark:border-white/10">
            <div className="flex gap-2">
              <input 
                type="text" 
                className="flex-1 bg-transparent border border-dark-gray/30 dark:border-white/30 px-3 py-2 text-xs text-dark-gray dark:text-white placeholder-dark-gray/40 dark:placeholder-white/40 focus:outline-none focus:border-dark-gray dark:focus:border-white transition-colors"
                value={chatbotInput}
                onChange={(e) => setChatbotInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleChatSend();
                  }
                }}
                placeholder="Ask about the book..."
              />
              <button 
                className="bg-dark-gray dark:bg-white text-white dark:text-dark-gray border border-dark-gray dark:border-white px-4 py-2 text-[10px] font-medium uppercase tracking-widest hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={handleChatSend}
                disabled={!chatbotInput.trim() || !apiKey}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Image Generation Panel */}
      {imageGenOpen && (
        <div className="fixed right-0 w-96 bg-white dark:bg-dark-gray border-l-2 border-dark-gray dark:border-white shadow-lg z-50 flex flex-col transform transition-transform duration-300" style={{ top: 'var(--header-height, 73px)', height: 'calc(100vh - var(--header-height, 73px))' }}>
          <div className="p-4 border-b border-dark-gray/10 dark:border-white/10">
            <h3 className="text-xs font-medium uppercase tracking-widest text-dark-gray dark:text-white">Image Generator</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-medium uppercase tracking-widest text-dark-gray/60 dark:text-white/60 mb-2">
                  Image Prompt
                </label>
                <textarea 
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder="Describe the scene, character, or concept from the book..."
                  rows={4}
                  className="w-full bg-transparent border border-dark-gray/30 dark:border-white/30 px-3 py-2 text-xs text-dark-gray dark:text-white placeholder-dark-gray/40 dark:placeholder-white/40 focus:outline-none focus:border-dark-gray dark:focus:border-white transition-colors resize-none"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-medium uppercase tracking-widest text-dark-gray/60 dark:text-white/60 mb-2">
                  Image Size
                </label>
                <select className="w-full bg-transparent border border-dark-gray/30 dark:border-white/30 px-3 py-2 text-xs text-dark-gray dark:text-white focus:outline-none focus:border-dark-gray dark:focus:border-white transition-colors">
                  <option value="1024x1024">Square (1024x1024)</option>
                  <option value="1792x1024">Landscape (1792x1024)</option>
                  <option value="1024x1792">Portrait (1024x1792)</option>
                </select>
              </div>
            </div>
            
            <button 
              className="w-full bg-dark-gray dark:bg-white text-white dark:text-dark-gray border border-dark-gray dark:border-white px-3 py-2 text-[10px] font-medium uppercase tracking-widest hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={handleGenerateImage}
              disabled={!imagePrompt.trim() || !apiKey}
            >
              Generate Image
            </button>
            
            {imageGenResult && (
              <div className="space-y-3 pt-3 border-t border-dark-gray/10 dark:border-white/10">
                <img src={imageGenResult.url} alt="Generated" className="w-full rounded border border-dark-gray/30 dark:border-white/30" />
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => window.open(imageGenResult.url, '_blank')}
                    className="bg-transparent border border-dark-gray/30 dark:border-white/30 text-dark-gray dark:text-white px-3 py-2 text-[10px] font-medium uppercase tracking-widest hover:bg-dark-gray/5 dark:hover:bg-white/5 transition-colors"
                  >
                    View Full Size
                  </button>
                  <button 
                    onClick={() => downloadImage(imageGenResult.url, `${bookTitle}-${Date.now()}.png`)}
                    className="bg-transparent border border-dark-gray/30 dark:border-white/30 text-dark-gray dark:text-white px-3 py-2 text-[10px] font-medium uppercase tracking-widest hover:bg-dark-gray/5 dark:hover:bg-white/5 transition-colors"
                  >
                    Download
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Highlight Menu */}
      {showHighlightMenu && (
        <div 
          className="fixed z-50 bg-white dark:bg-dark-gray border-2 border-dark-gray dark:border-white shadow-lg"
          style={{
            left: `${highlightMenuPosition.x}px`,
            top: `${highlightMenuPosition.y}px`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="flex gap-1 p-2">
            <button
              onClick={() => saveHighlight('#ffeb3b')}
              className="w-8 h-8 rounded-full border-2 border-dark-gray dark:border-white hover:scale-110 transition-transform"
              style={{ backgroundColor: '#ffeb3b' }}
              title="Yellow"
            />
            <button
              onClick={() => saveHighlight('#4caf50')}
              className="w-8 h-8 rounded-full border-2 border-dark-gray dark:border-white hover:scale-110 transition-transform"
              style={{ backgroundColor: '#4caf50' }}
              title="Green"
            />
            <button
              onClick={() => saveHighlight('#2196f3')}
              className="w-8 h-8 rounded-full border-2 border-dark-gray dark:border-white hover:scale-110 transition-transform"
              style={{ backgroundColor: '#2196f3' }}
              title="Blue"
            />
            <button
              onClick={() => saveHighlight('#ff9800')}
              className="w-8 h-8 rounded-full border-2 border-dark-gray dark:border-white hover:scale-110 transition-transform"
              style={{ backgroundColor: '#ff9800' }}
              title="Orange"
            />
            <button
              onClick={() => saveHighlight('#e91e63')}
              className="w-8 h-8 rounded-full border-2 border-dark-gray dark:border-white hover:scale-110 transition-transform"
              style={{ backgroundColor: '#e91e63' }}
              title="Pink"
            />
            <button
              onClick={() => setShowHighlightMenu(false)}
              className="w-8 h-8 flex items-center justify-center border-2 border-dark-gray dark:border-white hover:bg-dark-gray/10 dark:hover:bg-white/10 transition-colors"
              title="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}


    </div>
    </div>
  );
};

export default ReaderLocal;

