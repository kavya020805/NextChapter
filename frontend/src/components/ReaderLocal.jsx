import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const ReaderLocal = () => {
  const [searchParams] = useSearchParams();
  const bookId = searchParams.get('id');
  
  const [bookTitle, setBookTitle] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
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
  
  const pdfFrameRef = useRef(null);
  const viewerRef = useRef(null);
  const pageTrackingIntervalRef = useRef(null);
  const pdfUrlRef = useRef('');
  const viewerContainerRef = useRef(null);
  const lastTrackedPageRef = useRef(1);
  const isNavigatingRef = useRef(false);

  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'enabled') {
      setDarkMode(true);
      document.body.classList.add('dark-mode');
    }
    
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
      if (typeof pdfjsLib === 'undefined') return;
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      const loadingTask = pdfjsLib.getDocument(url);
      const pdf = await loadingTask.promise;
      setTotalPages(pdf.numPages);
    } catch (e) {
      console.log('Could not determine page count');
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

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.body.classList.toggle('dark-mode', newMode);
    localStorage.setItem('darkMode', newMode ? 'enabled' : 'disabled');
  };

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

  return (
    <div className="reader-container">
      <div className="reader-main">
        <div className="reader-header">
          <div className="reader-header-left">
            <Link to="/books" className="back-btn">← Back to Library</Link>
            <h1 className="book-title">{bookTitle || 'Loading…'}</h1>
          </div>
          <button className="dark-mode-toggle" onClick={toggleDarkMode}>
            <span>{darkMode ? '☀️' : '🌙'}</span>
            <span>{darkMode ? 'Light' : 'Dark'}</span>
          </button>
        </div>
        <div className="reader-content">
          <div className="pdf-viewer-container">
            <button 
              className="page-nav prev" 
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
              ‹
            </button>
            <div 
              id="viewer" 
              ref={viewerRef} 
              style={{ 
                width: '100%', 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                position: 'relative',
                overflow: 'auto'
              }}
            ></div>
            <button 
              className="page-nav next" 
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
              ›
            </button>
            {loading && (
              <div className="empty" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                Loading PDF…
              </div>
            )}
            {error && (
              <div className="empty" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#c00' }}>
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="reader-sidebar">
        <div className="sidebar-section">
          <h3>Page Counter</h3>
          <div className="page-counter">
            <div className="page-display">
              <span>{currentPage}</span>
              <span style={{ fontSize: '16px', color: '#999', display: 'block', marginTop: '4px' }}>
                of {totalPages || '?'}
              </span>
            </div>
            <div className="page-controls">
              <button 
                className="page-btn" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (currentPage > 1) {
                    navigateToPage(currentPage - 1);
                  }
                }} 
                disabled={currentPage <= 1}
              >
                Previous
              </button>
              <input 
                type="number" 
                className="page-input" 
                value={currentPage}
                min="1"
                max={totalPages || undefined}
                onChange={(e) => {
                  const page = parseInt(e.target.value) || 1;
                  navigateToPage(page);
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const page = parseInt(e.target.value) || 1;
                    navigateToPage(page);
                  }
                }}
              />
              <button 
                className="page-btn" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (totalPages === 0 || currentPage < totalPages) {
                    navigateToPage(currentPage + 1);
                  }
                }}
                disabled={totalPages > 0 && currentPage >= totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>
        
        <div className="sidebar-section">
          <h3>Zoom</h3>
          <div className="zoom-controls" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button className="page-btn" onClick={() => handleZoom(-10)}>−</button>
              <span style={{ minWidth: '60px', textAlign: 'center', fontWeight: 600 }}>{zoomLevel}%</span>
              <button className="page-btn" onClick={() => handleZoom(10)}>+</button>
            </div>
            <input 
              type="range" 
              min="100" 
              max="200" 
              value={zoomLevel}
              step="10"
              onChange={(e) => {
                const newZoom = parseInt(e.target.value);
                setZoomLevel(newZoom);
                updateZoomInPDF(newZoom);
              }}
            />
            <button className="page-btn" onClick={resetZoom} style={{ width: '100%' }}>
              Reset Zoom
            </button>
          </div>
        </div>
        
        <div className="sidebar-section">
          <h3>AI Features</h3>
          <div className="ai-actions">
            <button 
              className="ai-btn" 
              onClick={() => setChatbotOpen(!chatbotOpen)}
              title="Open AI Chat"
            >
              <span>💬</span>
              <span>Chat</span>
            </button>
            <button 
              className="ai-btn" 
              onClick={() => setImageGenOpen(!imageGenOpen)}
              title="Generate AI Image"
            >
              <span>🎨</span>
              <span>Image</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Chatbot Panel */}
      {chatbotOpen && (
        <div className="chatbot-panel open">
          <div className="chatbot-header">
            <h3>AI Book Assistant</h3>
            <button className="chatbot-close" onClick={() => setChatbotOpen(false)}>×</button>
          </div>
          <div className="chatbot-settings">
            <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>
              Enter your API key (OpenAI: sk-... or Groq: gsk_...):
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
              style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
            />
            <select 
              value={apiProvider}
              onChange={(e) => setApiProvider(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
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
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd', background: '#f5f5f5', cursor: 'pointer' }}
            >
              Save API Key
            </button>
          </div>
          <div className="chatbot-context">
            📖 {bookTitle} - Page {currentPage}{totalPages > 0 ? ` of ${totalPages}` : ''}
          </div>
          <div className="chatbot-messages">
            {messages.length === 0 && (
              <div className="chatbot-message ai">
                {apiKey ? `Hello! I'm your AI assistant for "${bookTitle}". How can I help you?` : 'Please enter your API key to use the AI assistant.'}
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={`chatbot-message ${msg.role}`}>
                {msg.text}
              </div>
            ))}
          </div>
          <div className="chatbot-input-area">
            <input 
              type="text" 
              className="chatbot-input" 
              value={chatbotInput}
              onChange={(e) => setChatbotInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleChatSend();
                }
              }}
              placeholder="Ask about the book..."
            />
            <button 
              className="chatbot-send" 
              onClick={handleChatSend}
              disabled={!chatbotInput.trim() || !apiKey}
            >
              Send
            </button>
          </div>
        </div>
      )}
      
      {/* Image Generation Panel */}
      {imageGenOpen && (
        <div className="image-gen-panel open">
          <div className="image-gen-header">
            <h3>🎨 AI Image Generator</h3>
            <button className="chatbot-close" onClick={() => setImageGenOpen(false)}>×</button>
          </div>
          <div className="image-gen-content">
            <div className="image-gen-settings">
              <label>Image Provider:</label>
              <select 
                value={imageProvider}
                onChange={(e) => {
                  setImageProvider(e.target.value);
                  localStorage.setItem('image_provider', e.target.value);
                }}
              >
                <option value="pollinations">Pollinations.ai (FREE, no key needed) ⭐</option>
                <option value="dalle">OpenAI DALL-E 3 (Premium, requires API key)</option>
              </select>
              
              {imageProvider === 'dalle' && (
                <div>
                  <label>OpenAI API Key:</label>
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
                  />
                  <button 
                    onClick={() => {
                      localStorage.setItem('dalle_api_key', imageKey);
                      alert('API key saved!');
                    }}
                  >
                    Save API Key
                  </button>
                </div>
              )}
              
              <label>What would you like to visualize?</label>
              <textarea 
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder="Describe the scene, character, or concept from the book..."
                rows={3}
              />
              
              <label>Image Size:</label>
              <select>
                <option value="1024x1024">Square (1024x1024)</option>
                <option value="1792x1024">Landscape (1792x1024)</option>
                <option value="1024x1792">Portrait (1024x1792)</option>
              </select>
            </div>
            
            <button 
              className="image-gen-button"
              onClick={handleGenerateImage}
              disabled={!imagePrompt.trim() || (imageProvider === 'dalle' && !imageKey)}
            >
              ✨ Generate Image
            </button>
            
            {imageGenResult && (
              <div className="image-gen-result">
                <img src={imageGenResult.url} alt="Generated" />
                <div className="image-gen-actions">
                  <button onClick={() => window.open(imageGenResult.url, '_blank')}>🔍 View Full Size</button>
                  <button onClick={() => downloadImage(imageGenResult.url, `${bookTitle}-${Date.now()}.png`)}>💾 Download</button>
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

