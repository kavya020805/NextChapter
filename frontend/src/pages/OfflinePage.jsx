import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Wifi, WifiOff } from 'lucide-react';
import { getCachedBooks } from '../lib/pdfCache';

function OfflinePage() {
  const [cachedBooks, setCachedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    loadCachedBooks();
    
    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadCachedBooks = async () => {
    setLoading(true);
    try {
      const books = await getCachedBooks();
      console.log('Cached books for offline reading:', books);
      setCachedBooks(books);
    } catch (error) {
      console.error('Error loading cached books:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-gray dark:bg-white">
      {/* Navbar with Logo - matching landing page style */}
      <nav className="border-b-2 border-white dark:border-dark-gray" style={{ backgroundColor: '#2a2a2a' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-center">
            <Link to="/" className="flex items-center">
              <img
                src="/LOGO.svg"
                alt="NextChapter logo"
                className="h-7 sm:h-8 md:h-10 w-auto"
              />
            </Link>
          </div>
        </div>
      </nav>

      {/* Offline Status Banner - Swiss style */}
      <div className={`py-3 sm:py-4 text-center border-b-2 ${isOnline ? 'bg-dark-gray dark:bg-white border-green-600' : 'bg-dark-gray dark:bg-white border-orange-600'}`}>
        <div className="flex items-center justify-center gap-2">
          {isOnline ? (
            <>
              <Wifi className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium uppercase tracking-widest text-green-600">Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-medium uppercase tracking-widest text-orange-600">Offline Mode</span>
            </>
          )}
        </div>
      </div>

      {/* Cached Books Section - Swiss style */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="mb-12 border-b-2 border-white dark:border-dark-gray pb-8">
            <h1 className="text-5xl md:text-6xl lg:text-7xl text-white dark:text-dark-gray mb-6 leading-none font-light">
              Offline Library
            </h1>
            <p className="text-lg text-white/70 dark:text-dark-gray/70 font-light max-w-2xl">
              {isOnline 
                ? 'Your cached books are ready for offline reading. No internet connection required.' 
                : 'You\'re offline, but your reading continues. All cached books are available below.'}
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white dark:border-dark-gray"></div>
              <p className="mt-4 text-white/60 dark:text-dark-gray/60 text-xs uppercase tracking-[0.3em]">
                Loading...
              </p>
            </div>
          ) : cachedBooks.length === 0 ? (
            <div className="text-center py-20 max-w-2xl mx-auto">
              <WifiOff className="w-20 h-20 text-white/20 dark:text-dark-gray/20 mx-auto mb-8" />
              <h2 className="text-3xl md:text-4xl text-white dark:text-dark-gray mb-6 font-light leading-tight">
                No Books Cached Yet
              </h2>
              <p className="text-white/60 dark:text-dark-gray/60 text-base mb-8 leading-relaxed font-light">
                Open and read books while online to automatically cache them for offline access. 
                Your cached books will appear here, ready to read anytime, anywhere.
              </p>
              {isOnline && (
                <Link
                  to="/books"
                  className="inline-block bg-white dark:bg-dark-gray text-dark-gray dark:text-white border-2 border-white dark:border-dark-gray px-8 py-3 text-xs font-medium uppercase tracking-widest hover:opacity-80 transition-opacity"
                >
                  Browse Books
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="mb-8 flex items-center justify-between border-b-2 border-white/10 dark:border-dark-gray/10 pb-6">
                <p className="text-white/60 dark:text-dark-gray/60 text-xs uppercase tracking-[0.3em]">
                  {cachedBooks.length} {cachedBooks.length === 1 ? 'book' : 'books'} cached
                </p>
                <span className="text-white/40 dark:text-dark-gray/40 text-xs uppercase tracking-[0.3em]">
                  Ready for offline reading
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {cachedBooks.map((book) => (
                  <Link
                    key={book.bookId}
                    to={`/reader-local?id=${encodeURIComponent(book.bookId)}`}
                    className="group"
                  >
                    <div className="relative overflow-hidden border-2 border-white dark:border-dark-gray group hover:bg-white dark:hover:bg-dark-gray transition-colors">
                      {book.cover_image ? (
                        <img
                          src={book.cover_image}
                          alt={book.title}
                          className="w-full aspect-2/3 object-cover group-hover:opacity-20 transition-opacity duration-300"
                          loading="lazy"
                          onError={(e) => {
                            // Fallback if cover image fails to load
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className="w-full aspect-2/3 bg-white dark:bg-dark-gray items-center justify-center text-dark-gray dark:text-white text-6xl"
                        style={{ display: book.cover_image ? 'none' : 'flex' }}
                      >
                        📚
                      </div>
                      <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 text-xs uppercase tracking-widest">
                        Cached
                      </div>
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                        <h3 className="text-dark-gray dark:text-white font-medium text-sm line-clamp-2 mb-2 uppercase tracking-widest">
                          {book.title}
                        </h3>
                        <p className="text-dark-gray/70 dark:text-white/70 text-xs line-clamp-1 font-light uppercase tracking-widest">
                          {book.author || 'Unknown Author'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-white dark:text-dark-gray font-medium text-xs line-clamp-2 mb-2 uppercase tracking-widest">
                        {book.title}
                      </h3>
                      <p className="text-white/60 dark:text-dark-gray/60 text-xs mb-2 font-light uppercase tracking-widest">
                        {book.author || 'Unknown Author'}
                      </p>
                      {book.description && (
                        <p className="text-white/50 dark:text-dark-gray/50 text-xs line-clamp-2 font-light leading-relaxed">
                          {book.description}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Info Section - Swiss style */}
      {!isOnline && cachedBooks.length > 0 && (
        <section className="py-16 border-t-2 border-white dark:border-dark-gray">
          <div className="max-w-4xl mx-auto px-8">
            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-12 md:col-span-4">
                <h3 className="text-xl text-white dark:text-dark-gray font-light uppercase tracking-widest mb-4">
                  Offline Mode
                </h3>
              </div>
              <div className="col-span-12 md:col-span-8 border-t-2 md:border-t-0 md:border-l-2 border-white dark:border-dark-gray pt-6 md:pt-0 md:pl-8">
                <p className="text-white/70 dark:text-dark-gray/70 text-base leading-relaxed font-light">
                  You're currently offline, but your reading experience continues seamlessly. 
                  All your cached books are available, and your reading progress is saved locally. 
                  Everything will sync automatically when you reconnect.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default OfflinePage;
