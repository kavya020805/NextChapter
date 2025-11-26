import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import usePdfRenderer from '../pdf/usePdfRenderer';

const Reader = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const viewerRef = useRef(null);
  const pdfUrlRef = useRef('');
  const messagesEndRef = useRef(null);

  const {
    loadPdf,
    currentPage: hookCurrentPage,
    totalPages: hookTotalPages,
    zoom: hookZoom,
    setZoom: hookSetZoom,
    navigateToPage: hookNavigateToPage,
    containerRef: pdfContainerRef,
  } = usePdfRenderer({
    initialPage: 1,
    onPageChange: (p, t) => {
      setCurrentPage(p);
      if (t) setTotalPages(t);
    },
    onProgressUpdate: (p, t) => {
      setCurrentPage(p);
      if (t) setTotalPages(t);
    },
    lruLimit: 4,
    eagerAllPages: true,
  });

  useEffect(() => {
    pdfContainerRef.current = viewerRef.current;
  });

  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'enabled') {
      setDarkMode(true);
      document.body.classList.add('dark-mode');
    }
    
    // Use environment variable as default, or fall back to saved key
    const envGroqKey = import.meta.env.VITE_GROQ_API_KEY;
    const savedKey = localStorage.getItem('ai_api_key');
    const savedProvider = localStorage.getItem('ai_api_provider');
    
    if (savedKey) {
      setApiKey(savedKey);
    } else if (envGroqKey) {
      setApiKey(envGroqKey);
      console.log('Using Groq API key from environment:', envGroqKey.substring(0, 10) + '...');
    }
    
    if (savedProvider) {
      setApiProvider(savedProvider);
    }
  }, []);

  useEffect(() => { 
    if (hookZoom && hookZoom !== zoomLevel) {
      setZoomLevel(hookZoom); 
    }
  }, [hookZoom, zoomLevel]);
  
  useEffect(() => { 
    if (hookCurrentPage && hookCurrentPage !== currentPage) {
      setCurrentPage(hookCurrentPage); 
    }
  }, [hookCurrentPage, currentPage]);
  
  useEffect(() => { 
    if (hookTotalPages && hookTotalPages !== totalPages) {
      setTotalPages(hookTotalPages); 
    }
  }, [hookTotalPages, totalPages]);

  

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
        if (!viewerRef.current) {
          throw new Error('Viewer container not available');
        }
        viewerRef.current.innerHTML = '';
        await loadPdf(pdfUrl);
        setTimeout(() => {
          hookNavigateToPage(1);
        }, 100);
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
      return;
    }
    setCurrentPage(page);
    hookNavigateToPage(page);
  }, [totalPages, hookNavigateToPage]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.body.classList.toggle('dark-mode', newMode);
    localStorage.setItem('darkMode', newMode ? 'enabled' : 'disabled');
  };

  const handleZoom = (delta) => {
    const newZoom = Math.max(50, Math.min(200, zoomLevel + delta));
    setZoomLevel(newZoom);
    hookSetZoom(newZoom);
  };

  const resetZoom = () => {
    setZoomLevel(100);
    hookSetZoom(100);
  };

  const sendMessage = async () => {
    console.log('Send button clicked', { 
      hasInput: !!chatbotInput.trim(), 
      hasApiKey: !!apiKey, 
      apiProvider: apiProvider,
      isSending: isSendingMessage 
    });
    
    if (!chatbotInput.trim() || !apiKey || isSendingMessage) {
      console.log('Message blocked - missing requirements');
      return;
    }
    
    const message = chatbotInput.trim();
    setMessages(prev => [...prev, { role: 'user', text: message }]);
    setChatbotInput('');
    setIsSendingMessage(true);
    
    // Add loading message
    setMessages(prev => [...prev, { role: 'loading', text: 'Thinking...' }]);
    
    try {
      // Use local backend proxy to avoid CORS issues
      const apiUrl = 'http://localhost:8001/api/chat';
      
      console.log('Making API call to backend:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message,
          book_title: bookTitle,
          current_page: currentPage,
          total_pages: totalPages
        })
      });
      
      // Remove loading message
      setMessages(prev => prev.filter(msg => msg.role !== 'loading'));
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || `API Error: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      const aiResponse = data.response || 'Sorry, I could not generate a response.';
      setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
    } catch (error) {
      // Remove loading message
      setMessages(prev => prev.filter(msg => msg.role !== 'loading'));
      
      let errorMessage = 'An error occurred. Please try again.';
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        errorMessage = 'Invalid API key. Please check your key and try again.';
      } else if (error.message.includes('429')) {
        errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setMessages(prev => [...prev, { role: 'ai', text: `❌ ${errorMessage}` }]);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const saveApiKey = () => {
    if (!apiKey.trim()) {
      alert('Please enter an API key');
      return;
    }
    
    localStorage.setItem('ai_api_key', apiKey);
    localStorage.setItem('ai_api_provider', apiProvider);
    alert('API key saved successfully!');
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
            <button onClick={() => navigate(-1)} className="back-btn" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>← Back</button>
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
            {!loading && !viewerRef.current && (
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
                hookSetZoom(newZoom);
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
              {apiKey && !localStorage.getItem('ai_api_key') ? '✓ Using API key from config' : 'Groq API key (optional - already configured):'}
            </div>
            <input 
              type="password"
              placeholder={apiKey ? '••••••••••••••••' : 'gsk_...'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px', alignItems: 'center' }}>
              <button onClick={saveApiKey}>Save API Key</button>
              <select 
                value={apiProvider} 
                onChange={(e) => {
                  setApiProvider(e.target.value);
                  localStorage.setItem('ai_api_provider', e.target.value);
                }}
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.15)', background: 'rgba(255,255,255,0.95)', fontSize: '12px' }}
              >
                <option value="groq">Groq (Free)</option>
                <option value="openai">OpenAI</option>
              </select>
              {apiKey && (
                <span style={{ fontSize: '11px', color: '#10b981' }}>✓ Ready</span>
              )}
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
            <div ref={messagesEndRef} />
          </div>
          <div className="chatbot-input-area">
            <input 
              type="text" 
              className="chatbot-input" 
              placeholder={apiKey ? "Ask about the book..." : "Enter API key first..."}
              value={chatbotInput}
              onChange={(e) => setChatbotInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isSendingMessage && apiKey && chatbotInput.trim()) {
                  sendMessage();
                }
              }}
              disabled={isSendingMessage || !apiKey}
            />
            <button 
              className="chatbot-send" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                sendMessage();
              }}
              disabled={isSendingMessage || !apiKey || !chatbotInput.trim()}
              style={{ 
                pointerEvents: (isSendingMessage || !apiKey || !chatbotInput.trim()) ? 'none' : 'auto'
              }}
            >
              {isSendingMessage ? '⏳' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reader;

