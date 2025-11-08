import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { ArrowLeft, ArrowRight, Moon, Sun, ZoomIn, ZoomOut, RotateCcw, MessageSquare, Image as ImageIcon, X, Menu } from 'lucide-react';

const ReaderLocal = () => {
  const [searchParams] = useSearchParams();
  const bookId = searchParams.get('id');
  const { isDark, toggleTheme } = useTheme();
  
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
  const [apiKey, setApiKey] = useState('');
  const [apiProvider, setApiProvider] = useState('groq');
  const [messages, setMessages] = useState([]);
  const [chatbotInput, setChatbotInput] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageProvider, setImageProvider] = useState('pollinations');
  const [imageKey, setImageKey] = useState('');
  const [imageGenResult, setImageGenResult] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const pdfFrameRef = useRef(null);
  const viewerRef = useRef(null);
  const pageTrackingIntervalRef = useRef(null);
  const pdfUrlRef = useRef('');
  const viewerContainerRef = useRef(null);
  const lastTrackedPageRef = useRef(1);
  const isNavigatingRef = useRef(false);
  const headerRef = useRef(null);

  useEffect(() => {
    const savedKey = localStorage.getItem('ai_api_key');
    const savedProvider = localStorage.getItem('ai_api_provider');
    if (savedKey) setApiKey(savedKey);
    if (savedProvider) setApiProvider(savedProvider);
    
    const savedImageKey = localStorage.getItem('dalle_api_key');
    const savedImageProvider = localStorage.getItem('image_provider');
    if (savedImageKey) setImageKey(savedImageKey);
    if (savedImageProvider) setImageProvider(savedImageProvider);
    
    return () => {
      if (pageTrackingIntervalRef.current) {
        clearInterval(pageTrackingIntervalRef.current);
      }
    };
  }, []);

  const estimateTotalPages = async (url) => {
    try {
      // Wait for pdfjsLib to be available
      if (typeof window.pdfjsLib === 'undefined') {
        // Try again after a short delay
        setTimeout(() => estimateTotalPages(url), 500);
        return;
      }
      
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      const loadingTask = window.pdfjsLib.getDocument(url);
      const pdf = await loadingTask.promise;
      console.log('Total pages detected:', pdf.numPages);
      setTotalPages(pdf.numPages);
    } catch (e) {
      console.error('Could not determine page count:', e);
      // Try alternative method: fetch and count pages
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        if (typeof window.pdfjsLib !== 'undefined') {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
          const pdf = await loadingTask.promise;
          console.log('Total pages detected (alternative method):', pdf.numPages);
          setTotalPages(pdf.numPages);
        }
      } catch (err) {
        console.error('Failed to get page count:', err);
      }
    }
  };

  const setupPageTracking = (frame) => {
    if (pageTrackingIntervalRef.current) {
      clearInterval(pageTrackingIntervalRef.current);
    }
    
    lastTrackedPageRef.current = currentPage;
    
    // Track page changes from iframe - try multiple methods
    pageTrackingIntervalRef.current = setInterval(() => {
      // Don't track if we're in the middle of navigation
      if (isNavigatingRef.current) {
        return;
      }
      
      let detectedPage = null;
      
      // Method 1: Try to access iframe's contentWindow.location.hash (works for same-origin)
      try {
        if (frame.contentWindow && frame.contentWindow.location) {
          const hash = frame.contentWindow.location.hash;
          const pageMatch = hash.match(/[#&]page=(\d+)/);
          if (pageMatch) {
            detectedPage = parseInt(pageMatch[1]);
            console.log('Hash tracking found page:', detectedPage);
          }
        }
      } catch (e) {
        // CORS - can't access iframe contentWindow
      }
      
      // Method 2: Try to read iframe src attribute
      if (!detectedPage) {
        try {
          const srcMatch = frame.src.match(/[#&]page=(\d+)/);
          if (srcMatch) {
            detectedPage = parseInt(srcMatch[1]);
            console.log('Src tracking found page:', detectedPage);
          }
        } catch (e) {
          // CORS
        }
      }
      
      // Method 3: Try to access iframe's document (for same-origin PDFs)
      if (!detectedPage) {
        try {
          if (frame.contentDocument && frame.contentDocument.location) {
            const hash = frame.contentDocument.location.hash;
            const pageMatch = hash.match(/[#&]page=(\d+)/);
            if (pageMatch) {
              detectedPage = parseInt(pageMatch[1]);
              console.log('Document tracking found page:', detectedPage);
            }
          }
        } catch (e) {
          // CORS
        }
      }
      
      // Update page if detected
      if (detectedPage && detectedPage !== lastTrackedPageRef.current && detectedPage > 0) {
        console.log('Page tracking: updating from', lastTrackedPageRef.current, 'to', detectedPage);
        lastTrackedPageRef.current = detectedPage;
        setCurrentPage(prevPage => {
          if (detectedPage !== prevPage && detectedPage > 0) {
            return detectedPage;
          }
          return prevPage;
        });
      }
    }, 300); // Check every 300ms for better responsiveness
    
    // Also listen for hashchange events in the iframe (if accessible)
    const handleHashChange = () => {
      if (isNavigatingRef.current) return;
      
      try {
        if (frame.contentWindow && frame.contentWindow.location) {
          const hash = frame.contentWindow.location.hash;
          const pageMatch = hash.match(/[#&]page=(\d+)/);
          if (pageMatch) {
            const page = parseInt(pageMatch[1]);
            if (page !== lastTrackedPageRef.current && page > 0) {
              lastTrackedPageRef.current = page;
              setCurrentPage(page);
              console.log('Hashchange detected page change:', page);
            }
          }
        }
      } catch (e) {
        // CORS
      }
    };
    
    try {
      if (frame.contentWindow) {
        frame.contentWindow.addEventListener('hashchange', handleHashChange);
      }
    } catch (e) {
      // CORS - can't access iframe contentWindow
    }
    
    // Store cleanup
    frame._trackingCleanup = () => {
      if (pageTrackingIntervalRef.current) {
        clearInterval(pageTrackingIntervalRef.current);
      }
      try {
        if (frame.contentWindow) {
          frame.contentWindow.removeEventListener('hashchange', handleHashChange);
        }
      } catch (e) {
        // CORS
      }
    };
  };

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
      setCurrentPage(1); // Reset to page 1 when loading new book
      
      try {
        console.log('Loading local book with ID:', bookId);
        
        // Load from local books-data.json
        const response = await fetch('/books-data.json');
        if (!response.ok) {
          throw new Error('Failed to load books data');
        }
        
        const books = await response.json();
        const book = books.find(b => b.id === bookId);
        
        if (!book) {
          throw new Error('Book not found in local data');
        }
        
        console.log('Book found:', book);
        setBookTitle(book.title || 'Untitled');
        setBookDescription(book.description || book.subtitle || '');
        setBookCover(book.coverUrl || book.thumbnail || '');
        
        const pdfUrl = book.pdfUrl;
        if (!pdfUrl) {
          throw new Error('No PDF URL found for this book');
        }
        
        // Convert relative URL to absolute if needed
        const fullPdfUrl = pdfUrl.startsWith('http') ? pdfUrl : pdfUrl.startsWith('/') ? pdfUrl : `/${pdfUrl}`;
        pdfUrlRef.current = fullPdfUrl;
        
        console.log('PDF URL:', fullPdfUrl);
        
        // Wait for viewerRef to be available
        const setupFrame = () => {
          if (viewerRef.current) {
            console.log('Setting up PDF frame in viewer');
            viewerRef.current.innerHTML = '';
            
            const frame = document.createElement('iframe');
            const pdfSrc = fullPdfUrl + '#page=1&toolbar=0&navpanes=0&scrollbar=0';
            console.log('PDF iframe src:', pdfSrc);
            frame.src = pdfSrc;
            frame.style.width = '100%';
            frame.style.height = '100%';
            frame.style.border = 'none';
            frame.style.minHeight = '500px';
            frame.style.overflowX = 'hidden';
            frame.id = 'pdfViewer';
            frame.title = 'PDF Viewer';
            frame.allow = 'fullscreen';
            
            frame.onerror = (e) => {
              console.error('Iframe load error:', e);
              setError('Error loading PDF. Please check if the file exists.');
            };
            
            viewerRef.current.appendChild(frame);
            pdfFrameRef.current = frame;
            
            frame.onload = () => {
              console.log('PDF iframe loaded successfully');
              estimateTotalPages(fullPdfUrl);
              
              // Wait a bit for iframe to fully initialize
              setTimeout(() => {
                setupPageTracking(frame);
                // Ensure initial page is set
                setCurrentPage(1);
                lastTrackedPageRef.current = 1;
                isNavigatingRef.current = false;
                
                // Test if we can access iframe content
                try {
                  if (frame.contentWindow && frame.contentWindow.location) {
                    console.log('✓ Can access iframe contentWindow - scroll tracking should work!');
                    console.log('Initial hash:', frame.contentWindow.location.hash);
                  }
                } catch (e) {
                  console.warn('✗ Cannot access iframe contentWindow (CORS):', e.message);
                  console.warn('Scroll tracking may be limited');
                }
              }, 1000);
            };
            
            return true;
          }
          return false;
        };
        
        if (!setupFrame()) {
          setTimeout(() => {
            if (!setupFrame()) {
              setError('Could not initialize PDF viewer');
            }
          }, 100);
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
    
    if (currentPage === page) {
      console.log('Already on page', page);
      return;
    }
    
    console.log('Navigating to page:', page, 'from', currentPage);
    
    // Mark that we're navigating to prevent page tracking from interfering
    isNavigatingRef.current = true;
    lastTrackedPageRef.current = page;
    
    // Update page state immediately
    setCurrentPage(page);
    
    if (pdfFrameRef.current && pdfUrlRef.current && viewerRef.current) {
      const baseUrl = pdfUrlRef.current.split('#')[0];
      const zoomParam = zoomLevel !== 100 ? `&zoom=${zoomLevel}` : '';
      const newSrc = baseUrl + `#page=${page}&toolbar=0&navpanes=0&scrollbar=0${zoomParam}`;
      
      console.log('Recreating iframe to navigate to page:', page);
      
      // Clear tracking interval before removing iframe
      if (pageTrackingIntervalRef.current) {
        clearInterval(pageTrackingIntervalRef.current);
        pageTrackingIntervalRef.current = null;
      }
      
      // Store iframe properties
      const frameStyle = pdfFrameRef.current.style.cssText;
      const frameId = pdfFrameRef.current.id;
      const frameTitle = pdfFrameRef.current.title;
      const frameAllow = pdfFrameRef.current.allow;
      
      // Remove old iframe
      try {
        if (pdfFrameRef.current.parentNode) {
          pdfFrameRef.current.parentNode.removeChild(pdfFrameRef.current);
        }
      } catch (e) {
        console.error('Error removing iframe:', e);
      }
      
      // Create new iframe with new page
      const newFrame = document.createElement('iframe');
      newFrame.src = newSrc;
      newFrame.style.cssText = frameStyle;
      newFrame.id = frameId;
      newFrame.title = frameTitle;
      newFrame.allow = frameAllow;
      newFrame.style.width = '100%';
      newFrame.style.height = '100%';
      newFrame.style.border = 'none';
      newFrame.style.minHeight = '500px';
      newFrame.style.transition = 'opacity 0.2s ease';
      newFrame.style.opacity = '0.5';
      
      // Append to viewer
      viewerRef.current.appendChild(newFrame);
      pdfFrameRef.current = newFrame;
      
      // Re-setup tracking after iframe loads
      newFrame.onload = () => {
        console.log('PDF iframe reloaded to page:', page);
        newFrame.style.opacity = '1';
        estimateTotalPages(pdfUrlRef.current);
        setupPageTracking(newFrame);
        // Allow page tracking to resume
        setTimeout(() => {
          isNavigatingRef.current = false;
        }, 500);
      };
      
      newFrame.onerror = (e) => {
        console.error('Iframe load error:', e);
        isNavigatingRef.current = false;
      };
    } else {
      console.warn('PDF frame, URL ref, or viewer ref not available', {
        hasFrame: !!pdfFrameRef.current,
        hasUrl: !!pdfUrlRef.current,
        hasViewer: !!viewerRef.current
      });
      isNavigatingRef.current = false;
    }
  }, [totalPages, zoomLevel, currentPage]);


  const handleZoom = (delta) => {
    const newZoom = Math.max(100, Math.min(200, zoomLevel + delta));
    setZoomLevel(newZoom);
    updateZoomInPDF(newZoom);
  };

  const resetZoom = () => {
    setZoomLevel(100);
    updateZoomInPDF(100);
  };

  const updateZoomInPDF = (zoom) => {
    if (pdfFrameRef.current && pdfUrlRef.current && currentPage > 0) {
      const baseUrl = pdfUrlRef.current.split('#')[0];
      // Try using zoom parameter first
      const zoomParam = zoom !== 100 ? `&zoom=${zoom}` : '';
      const newSrc = baseUrl + `#page=${currentPage}&toolbar=0&navpanes=0&scrollbar=0${zoomParam}`;
      
      // Update iframe src with zoom parameter
      pdfFrameRef.current.src = newSrc;
      
      // Also apply CSS transform as fallback, centered
      const scale = zoom / 100;
      pdfFrameRef.current.style.transform = `scale(${scale})`;
      pdfFrameRef.current.style.transformOrigin = 'center center';
      
      // Adjust container to keep it centered
      const container = viewerRef.current;
      if (container) {
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
      }
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
      const apiUrl = apiProvider === 'groq' 
        ? 'https://api.groq.com/openai/v1/chat/completions'
        : 'https://api.openai.com/v1/chat/completions';
      const model = apiProvider === 'groq' ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text })),
            { role: 'user', content: userMessage }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
      
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { role: 'ai', text: aiResponse };
        return newMessages;
      });
    } catch (error) {
      let errorMsg = 'Sorry, I encountered an error. ';
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        errorMsg += `Invalid API key. Please check your ${apiProvider} API key.`;
      } else if (error.message.includes('429')) {
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
    if (!imagePrompt.trim() || (imageProvider === 'dalle' && !imageKey)) return;
    
    const prompt = imagePrompt.trim();
    setImageGenResult(null);
    
    try {
      if (imageProvider === 'pollinations') {
        const enhancedPrompt = `${prompt}, book: ${bookTitle}, high quality, detailed, artistic`;
        const encodedPrompt = encodeURIComponent(enhancedPrompt);
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true`;
        
        setImageGenResult({
          url: imageUrl,
          prompt: enhancedPrompt
        });
      } else {
        const enhancedPrompt = `${prompt}. Book context: "${bookTitle}", page ${currentPage}. Create a high-quality, artistic visualization.`;
        
        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${imageKey}`
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: enhancedPrompt,
            n: 1,
            size: '1024x1024',
            quality: 'standard',
            style: 'vivid'
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
          throw new Error(errorData.error?.message || `HTTP ${response.status}`);
        }
        
        const data = await response.json();
        setImageGenResult({
          url: data.data[0].url,
          prompt: data.data[0].revised_prompt || enhancedPrompt
        });
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
    <div className="min-h-screen bg-dark-gray dark:bg-white">
      <div className="flex h-screen">
        {/* Main Reader Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Reader Header */}
          <div ref={headerRef} className="bg-white dark:bg-dark-gray border-b-2 border-dark-gray dark:border-white px-8 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              <Link 
                to="/books" 
                className="text-[10px] font-medium uppercase tracking-widest text-dark-gray/60 dark:text-white/60 hover:text-dark-gray dark:hover:text-white transition-colors flex-shrink-0"
              >
                ← Back
              </Link>
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
                className="w-8 h-8 bg-transparent border border-dark-gray/30 dark:border-white/30 text-dark-gray dark:text-white flex items-center justify-center hover:bg-dark-gray/5 dark:hover:bg-white/5 transition-colors flex-shrink-0"
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
          <div className="flex-1 relative bg-white/5 dark:bg-dark-gray/5 overflow-hidden">
            <button 
              className="absolute left-8 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-transparent border-2 border-dark-gray dark:border-white text-dark-gray dark:text-white flex items-center justify-center hover:opacity-80 transition-opacity disabled:opacity-20 disabled:cursor-not-allowed"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (currentPage > 1) {
                  navigateToPage(currentPage - 1);
                }
              }}
              disabled={currentPage <= 1}
              title="Previous Page"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div 
              id="viewer" 
              ref={viewerRef} 
              className="w-full h-full flex items-center justify-center relative overflow-y-auto overflow-x-hidden"
            ></div>
            <button 
              className="absolute right-8 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-transparent border-2 border-dark-gray dark:border-white text-dark-gray dark:text-white flex items-center justify-center hover:opacity-80 transition-opacity disabled:opacity-20 disabled:cursor-not-allowed"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (totalPages === 0 || currentPage < totalPages) {
                  navigateToPage(currentPage + 1);
                }
              }}
              disabled={totalPages > 0 && currentPage >= totalPages}
              title="Next Page"
            >
              <ArrowRight className="w-4 h-4" />
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
        <div className={`fixed right-0 w-80 bg-white dark:bg-dark-gray border-l-2 border-dark-gray dark:border-white overflow-y-auto transform transition-transform duration-300 z-50 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`} style={{ top: 'var(--header-height, 73px)', height: 'calc(100vh - var(--header-height, 73px))' }}>
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
            
            {/* Book Cover & Description */}
            {(bookCover || bookDescription) && (
              <div className="space-y-3 pt-4">
                <div className="text-[10px] font-medium uppercase tracking-widest text-dark-gray/60 dark:text-white/60">
                  About This Book
                </div>
                {bookCover && (
                  <div className="w-full aspect-[2/3] bg-dark-gray/5 dark:bg-white/5 border border-dark-gray/20 dark:border-white/20 overflow-hidden">
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
          <div className="p-4 border-b border-dark-gray/10 dark:border-white/10">
            <div className="text-[10px] font-medium uppercase tracking-widest text-dark-gray/60 dark:text-white/60 mb-2">
              API Key
            </div>
            <input 
              type="password" 
              value={apiKey.startsWith('••••') ? apiKey : '••••••••' + apiKey.slice(-4)}
              onChange={(e) => {
                const key = e.target.value;
                if (key.startsWith('gsk_')) setApiProvider('groq');
                else if (key.startsWith('sk-')) setApiProvider('openai');
                setApiKey(key);
              }}
              onFocus={(e) => {
                if (e.target.value.startsWith('••••')) {
                  e.target.value = apiKey;
                  e.target.type = 'text';
                }
              }}
              placeholder="sk-... or gsk_..." 
              className="w-full bg-transparent border border-dark-gray/30 dark:border-white/30 px-3 py-2 text-xs text-dark-gray dark:text-white placeholder-dark-gray/40 dark:placeholder-white/40 focus:outline-none focus:border-dark-gray dark:focus:border-white transition-colors mb-2"
            />
            <select 
              value={apiProvider}
              onChange={(e) => setApiProvider(e.target.value)}
              className="w-full bg-transparent border border-dark-gray/30 dark:border-white/30 px-3 py-2 text-xs text-dark-gray dark:text-white focus:outline-none focus:border-dark-gray dark:focus:border-white transition-colors mb-2"
            >
              <option value="groq">Groq (FREE, fast) ⭐</option>
              <option value="openai">OpenAI GPT-4o-mini</option>
            </select>
            <button 
              onClick={() => {
                localStorage.setItem('ai_api_key', apiKey);
                localStorage.setItem('ai_api_provider', apiProvider);
                alert('API key saved!');
              }}
              className="w-full bg-dark-gray dark:bg-white text-white dark:text-dark-gray border border-dark-gray dark:border-white px-3 py-2 text-[10px] font-medium uppercase tracking-widest hover:opacity-80 transition-opacity"
            >
              Save API Key
            </button>
          </div>
          <div className="p-3 bg-dark-gray/5 dark:bg-white/5 border-b border-dark-gray/10 dark:border-white/10">
            <div className="text-[10px] text-dark-gray/70 dark:text-white/70">
              📖 {bookTitle} - Page {currentPage}{totalPages > 0 ? ` of ${totalPages}` : ''}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="bg-dark-gray/5 dark:bg-white/5 border border-dark-gray/30 dark:border-white/30 p-3 rounded text-xs text-dark-gray dark:text-white">
                {apiKey ? `Hello! I'm your AI assistant for "${bookTitle}". How can I help you?` : 'Please enter your API key to use the AI assistant.'}
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
                  Image Provider
                </label>
                <select 
                  value={imageProvider}
                  onChange={(e) => {
                    setImageProvider(e.target.value);
                    localStorage.setItem('image_provider', e.target.value);
                  }}
                  className="w-full bg-transparent border border-dark-gray/30 dark:border-white/30 px-3 py-2 text-xs text-dark-gray dark:text-white focus:outline-none focus:border-dark-gray dark:focus:border-white transition-colors"
                >
                  <option value="pollinations">Pollinations.ai (FREE, no key needed) ⭐</option>
                  <option value="dalle">OpenAI DALL-E 3 (Premium, requires API key)</option>
                </select>
              </div>
              
              {imageProvider === 'dalle' && (
                <div className="space-y-2">
                  <label className="block text-[10px] font-medium uppercase tracking-widest text-dark-gray/60 dark:text-white/60 mb-2">
                    OpenAI API Key
                  </label>
                  <input 
                    type="password" 
                    value={imageKey.startsWith('••••') ? imageKey : '••••••••' + imageKey.slice(-4)}
                    onChange={(e) => setImageKey(e.target.value)}
                    onFocus={(e) => {
                      if (e.target.value.startsWith('••••')) {
                        e.target.value = imageKey;
                        e.target.type = 'text';
                      }
                    }}
                    placeholder="sk-..." 
                    className="w-full bg-transparent border border-dark-gray/30 dark:border-white/30 px-3 py-2 text-xs text-dark-gray dark:text-white placeholder-dark-gray/40 dark:placeholder-white/40 focus:outline-none focus:border-dark-gray dark:focus:border-white transition-colors mb-2"
                  />
                  <button 
                    onClick={() => {
                      localStorage.setItem('dalle_api_key', imageKey);
                      alert('API key saved!');
                    }}
                    className="w-full bg-dark-gray dark:bg-white text-white dark:text-dark-gray border border-dark-gray dark:border-white px-3 py-2 text-[10px] font-medium uppercase tracking-widest hover:opacity-80 transition-opacity"
                  >
                    Save API Key
                  </button>
                </div>
              )}
              
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
              disabled={!imagePrompt.trim() || (imageProvider === 'dalle' && !imageKey)}
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
    </div>
  );
};

export default ReaderLocal;

