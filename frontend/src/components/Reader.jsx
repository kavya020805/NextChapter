import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const Reader = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  
  const [bookTitle, setBookTitle] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiProvider, setApiProvider] = useState('groq');
  const [messages, setMessages] = useState([]);
  const [chatbotInput, setChatbotInput] = useState('');
  const [loading, setLoading] = useState(true);
  
  const pdfFrameRef = useRef(null);
  const viewerRef = useRef(null);
  const pageTrackingIntervalRef = useRef(null);
  const pdfUrlRef = useRef('');

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
    
    pageTrackingIntervalRef.current = setInterval(() => {
      try {
        const srcMatch = frame.src.match(/[#&]page=(\d+)/);
        if (srcMatch) {
          const page = parseInt(srcMatch[1]);
          setCurrentPage(prevPage => {
            if (page !== prevPage && page > 0) {
              return page;
            }
            return prevPage;
          });
        }
      } catch (e) {
        // CORS - expected
      }
    }, 50);
  };

  useEffect(() => {
    if (!id) {
      setBookTitle('No book selected');
      setLoading(false);
      return;
    }
    
    const loadBook = async () => {
      setLoading(true);
      try {
        console.log('Loading book with ID:', id);
        const res = await fetch(`https://gutendex.com/books/${id}`);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error('API Error:', res.status, errorText);
          throw new Error(`Failed to fetch book: ${res.status} ${res.statusText}`);
        }
        
        const book = await res.json();
        console.log('Book data received:', book);
        
        if (!book || !book.title) {
          throw new Error('Invalid book data received');
        }
        
        setBookTitle(book.title || 'Untitled');
        const pdfUrl = book.formats?.['application/pdf'] || book.formats?.['application/pdf; charset=utf-8'];
        
        console.log('PDF URL:', pdfUrl);
        
        if (!pdfUrl) {
          console.warn('No PDF URL found. Available formats:', Object.keys(book.formats || {}));
          throw new Error('No PDF available for this book');
        }
        
        pdfUrlRef.current = pdfUrl;
        
        // Wait for viewerRef to be available
        const setupFrame = () => {
          if (viewerRef.current) {
            console.log('Setting up PDF frame in viewer');
            // Clear any existing content
            viewerRef.current.innerHTML = '';
            
            // Create iframe
            const frame = document.createElement('iframe');
            const pdfSrc = pdfUrl + '#page=1&toolbar=0&navpanes=0&scrollbar=0';
            console.log('PDF iframe src:', pdfSrc);
            frame.src = pdfSrc;
            frame.style.width = '100%';
            frame.style.height = '100%';
            frame.style.border = 'none';
            frame.style.minHeight = '500px';
            frame.id = 'pdfViewer';
            frame.title = 'PDF Viewer';
            frame.allow = 'fullscreen';
            
            // Handle iframe load errors
            frame.onerror = (e) => {
              console.error('Iframe load error:', e);
              if (viewerRef.current) {
                viewerRef.current.innerHTML = `<div class="empty">Error loading PDF. Please try again.</div>`;
              }
            };
            
            // Append to viewer
            viewerRef.current.appendChild(frame);
            pdfFrameRef.current = frame;
            
            // Wait for iframe to load before setting up tracking
            frame.onload = () => {
              console.log('PDF iframe loaded successfully');
              estimateTotalPages(pdfUrl);
              setupPageTracking(frame);
            };
            
            return true;
          }
          console.warn('viewerRef.current is null');
          return false;
        };
        
        if (!setupFrame()) {
          // If viewerRef is not ready, try again after a short delay
          console.log('Viewer ref not ready, retrying in 100ms');
          setTimeout(() => {
            if (!setupFrame()) {
              console.error('Failed to setup frame after retry');
              if (viewerRef.current) {
                viewerRef.current.innerHTML = `<div class="empty">Error: Could not initialize PDF viewer</div>`;
              }
            }
          }, 100);
        }
      } catch (e) {
        console.error('Failed to load book:', e);
        setBookTitle(`Failed to load book: ${e.message}`);
        if (viewerRef.current) {
          viewerRef.current.innerHTML = `<div class="empty" style="padding: 40px; text-align: center;">
            <h3>Error Loading Book</h3>
            <p>${e.message}</p>
            <p style="font-size: 12px; color: #666; margin-top: 10px;">Book ID: ${id}</p>
          </div>`;
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadBook();
  }, [id]);

  const navigateToPage = useCallback((page) => {
    if (page < 1 || (totalPages > 0 && page > totalPages)) {
      console.log('Navigation blocked:', page, 'totalPages:', totalPages);
      return;
    }
    
    console.log('Navigating to page:', page);
    setCurrentPage(page);
    
    if (pdfFrameRef.current && pdfUrlRef.current) {
      const baseUrl = pdfUrlRef.current.split('#')[0];
      const newSrc = baseUrl + `#page=${page}&toolbar=0&navpanes=0&scrollbar=0`;
      
      // Force navigation by recreating iframe if src doesn't change
      const currentSrc = pdfFrameRef.current.src;
      const currentPageMatch = currentSrc.match(/[#&]page=(\d+)/);
      const currentPageNum = currentPageMatch ? parseInt(currentPageMatch[1]) : null;
      
      if (currentPageNum === page) {
        console.log('Already on page', page);
        return;
      }
      
      // Remove old iframe and create new one to force page change
      const viewer = viewerRef.current;
      if (viewer && pdfFrameRef.current.parentNode) {
        const frameStyle = pdfFrameRef.current.style.cssText;
        const frameId = pdfFrameRef.current.id;
        const frameTitle = pdfFrameRef.current.title;
        
        // Clear tracking interval
        if (pageTrackingIntervalRef.current) {
          clearInterval(pageTrackingIntervalRef.current);
          pageTrackingIntervalRef.current = null;
        }
        
        // Remove old frame
        try {
          pdfFrameRef.current.parentNode.removeChild(pdfFrameRef.current);
        } catch (e) {
          console.error('Error removing iframe:', e);
        }
        
        // Create new frame with new page
        const newFrame = document.createElement('iframe');
        newFrame.src = newSrc;
        newFrame.style.cssText = frameStyle;
        newFrame.id = frameId;
        newFrame.title = frameTitle;
        newFrame.style.width = '100%';
        newFrame.style.height = '100%';
        newFrame.style.border = 'none';
        newFrame.style.minHeight = '500px';
        newFrame.allow = 'fullscreen';
        
        viewer.appendChild(newFrame);
        pdfFrameRef.current = newFrame;
        
        // Re-setup tracking
        newFrame.onload = () => {
          console.log('PDF iframe reloaded to page:', page);
          estimateTotalPages(pdfUrlRef.current);
          setupPageTracking(newFrame);
        };
      } else {
        // Fallback: just update src
        pdfFrameRef.current.src = newSrc;
      }
    }
  }, [totalPages]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.body.classList.toggle('dark-mode', newMode);
    localStorage.setItem('darkMode', newMode ? 'enabled' : 'disabled');
  };

  const handleZoom = (delta) => {
    const newZoom = Math.max(50, Math.min(200, zoomLevel + delta));
    setZoomLevel(newZoom);
    if (pdfFrameRef.current) {
      pdfFrameRef.current.style.transform = `scale(${newZoom / 100})`;
      pdfFrameRef.current.style.transformOrigin = 'top left';
    }
  };

  const resetZoom = () => {
    setZoomLevel(100);
    if (pdfFrameRef.current) {
      pdfFrameRef.current.style.transform = 'scale(1)';
    }
  };

  const sendMessage = async () => {
    if (!chatbotInput.trim() || !apiKey) return;
    
    const message = chatbotInput.trim();
    setMessages(prev => [...prev, { role: 'user', text: message }]);
    setChatbotInput('');
    
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
          model,
          messages: [
            { role: 'system', content: `You are helping with "${bookTitle}" on page ${currentPage}.` },
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
      setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: `Error: ${error.message}` }]);
    }
  };

  const saveApiKey = () => {
    localStorage.setItem('ai_api_key', apiKey);
    localStorage.setItem('ai_api_provider', apiProvider);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
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
            <Link to="/gallery" className="back-btn">← Back to Library</Link>
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
            <div id="viewer" ref={viewerRef} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}></div>
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
            {!loading && !pdfFrameRef.current && (
              <div className="empty" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                No PDF loaded
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
              min="50" 
              max="200" 
              value={zoomLevel}
              step="10"
              onChange={(e) => {
                const newZoom = parseInt(e.target.value);
                setZoomLevel(newZoom);
                if (pdfFrameRef.current) {
                  pdfFrameRef.current.style.transform = `scale(${newZoom / 100})`;
                  pdfFrameRef.current.style.transformOrigin = 'top left';
                }
              }}
            />
            <button className="page-btn" onClick={resetZoom} style={{ width: '100%' }}>
              Reset Zoom
            </button>
          </div>
        </div>
      </div>

      {/* Chatbot */}
      <button 
        className="chatbot-btn" 
        onClick={() => setChatbotOpen(!chatbotOpen)}
        title="Open AI Chat"
      >
        💬
      </button>
      
      {chatbotOpen && (
        <div className="chatbot-panel open">
          <div className="chatbot-header">
            <h3>AI Book Assistant</h3>
            <button className="chatbot-close" onClick={() => setChatbotOpen(false)}>×</button>
          </div>
          <div className="chatbot-settings">
            <div style={{ fontSize: '11px', color: 'rgba(0,0,0,0.6)', marginBottom: '4px' }}>
              Enter your API key (OpenAI: sk-... or Groq: gsk-...):
            </div>
            <input 
              type="password"
              placeholder="sk-... or gsk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button onClick={saveApiKey}>Save API Key</button>
              <select 
                value={apiProvider} 
                onChange={(e) => setApiProvider(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.15)', background: 'rgba(255,255,255,0.95)', fontSize: '12px' }}
              >
                <option value="openai">OpenAI</option>
                <option value="groq">Groq</option>
              </select>
            </div>
          </div>
          <div className="chatbot-context">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span>📖 {bookTitle || 'Loading...'}</span>
              <span>•</span>
              <span>Page: {currentPage}</span>
            </div>
          </div>
          <div className="chatbot-messages">
            {messages.length === 0 && (
              <div className="chatbot-message ai">
                {apiKey ? `Hello! I'm your AI assistant for "${bookTitle}". How can I help you?` : 'Please enter your API key to use the AI assistant.'}
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`chatbot-message ${msg.role}`}>
                {msg.text}
              </div>
            ))}
          </div>
          <div className="chatbot-input-area">
            <input 
              type="text" 
              className="chatbot-input" 
              placeholder="Ask about the book..."
              value={chatbotInput}
              onChange={(e) => setChatbotInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  sendMessage();
                }
              }}
            />
            <button className="chatbot-send" onClick={sendMessage}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reader;

