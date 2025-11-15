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
  
  const viewerRef = useRef(null);
  const headerRef = useRef(null);
  const lastScrollPageRef = useRef(1);
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

    // Ensure we have a wrapper div and canvas inside the viewer
    let wrapper = container.querySelector('#pdf-wrapper');
    let canvas;
    
    if (!wrapper) {
      container.innerHTML = '';
      wrapper = document.createElement('div');
      wrapper.id = 'pdf-wrapper';
      wrapper.style.width = '100%';
      wrapper.style.display = 'flex';
      wrapper.style.flexDirection = 'column';
      wrapper.style.alignItems = 'center';
      
      canvas = document.createElement('canvas');
      canvas.id = 'pdfCanvas';
      canvas.style.maxWidth = '900px';
      canvas.style.width = '100%';
      canvas.style.height = 'auto';
      canvas.style.display = 'block';
      
      wrapper.appendChild(canvas);
      container.appendChild(wrapper);
    } else {
      canvas = wrapper.querySelector('canvas');
    }

    // Add device-specific top margin to the canvas for better visibility below header
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    canvas.style.marginTop = isMobile ? '120px' : '80px';

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
    } catch (e) {
      console.error('Error rendering PDF page', e);
    }
  }, [totalPages, zoomLevel, readerTheme]);

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

    // Calculate progress: page 1 = 0%, last page = 100%
    if (normalizedCurrentPage >= totalPages) {
      progress = 100;
    } else if (normalizedCurrentPage === 1) {
      // First page = 0% progress (not started yet)
      progress = 0;
    } else {
      // For pages 2 to (totalPages-1), calculate based on completed pages
      const completedPages = normalizedCurrentPage - 1;
      progress = Math.max(0, Math.min(100, Math.round((completedPages / totalPages) * 100)));
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
            const { error: upsertError } = await supabase
              .from('user_books')
              .upsert({
                user_id: user.id,
                book_id: bookId,
                current_page: normalizedCurrentPage, // Always save the current page
                progress_percentage: progress,
                status: status,
                updated_at: new Date().toISOString()
              }, {
                onConflict: 'user_id,book_id'
              });

            if (upsertError) {
              console.error('Error saving reading progress:', upsertError);
            } else {
              console.log('Reading progress saved:', { currentPage: normalizedCurrentPage, progress });
              
              // Sync dashboard data to update user profile statistics
              // Only sync when progress is significant (completed book or every 10% progress)
              const shouldSync = progress >= 100 || (progress % 10 === 0 && progress > 0);
              
              if (shouldSync) {
                try {
                  const { syncDashboardData } = await import('../lib/dashboardUtils');
                  // Fetch current reading sessions and books read to sync
                  const { data: readingSessions } = await supabase
                    .from('reading_sessions')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('date', { ascending: false });
                  
                  const { data: booksRead } = await supabase
                    .from('user_books')
                    .select('*, books(*)')
                    .eq('user_id', user.id)
                    .eq('status', 'read');
                  
                  await syncDashboardData(
                    user.id,
                    readingSessions?.data || [],
                    booksRead?.data || []
                  );
                  console.log('Dashboard data synced successfully');
                } catch (syncError) {
                  console.warn('Could not sync dashboard data:', syncError);
                  // Don't fail the save if sync fails
                }
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
        // Assuming the book has a pdf_file field with the filename
        const pdfFileName = book.pdf_file || book.pdf_filename;
        
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
          if (/^Book-storage\//i.test(normalizedPdfPath)) {
            normalizedPdfPath = normalizedPdfPath.replace(/^Book-storage\//i, '');
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
            <button 
              className={`absolute left-8 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-transparent border-2 border-dark-gray dark:border-white text-dark-gray dark:text-white flex items-center justify-center hover:opacity-80 transition-opacity disabled:opacity-20 disabled:cursor-not-allowed ${loading ? 'opacity-0 pointer-events-none' : ''}`}
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
              className={`w-full h-full relative overflow-y-auto overflow-x-hidden pt-4 md:pt-6 ${loading ? 'invisible' : ''}`}
            ></div>
            <button 
              className={`absolute right-8 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-transparent border-2 border-dark-gray dark:border-white text-dark-gray dark:text-white flex items-center justify-center hover:opacity-80 transition-opacity disabled:opacity-20 disabled:cursor-not-allowed ${readerTheme === 'reader' ? 'border-white text-white' : ''} ${loading ? 'opacity-0 pointer-events-none' : ''}`}
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
    </div>
    </div>
  );
};

export default ReaderLocal;

