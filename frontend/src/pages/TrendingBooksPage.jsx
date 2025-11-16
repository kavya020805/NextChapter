import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { TrendingUp, BookOpen, ArrowLeft } from 'lucide-react'
import { getTrendingBooks } from '../lib/trendingUtils'
import { useAuth } from '../contexts/AuthContext'
import { hasCompletedPersonalization } from '../lib/personalizationUtils'

function TrendingBooksPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [trendingBooks, setTrendingBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Check personalization on mount
  useEffect(() => {
    const checkPersonalization = async () => {
      if (user) {
        const completed = await hasCompletedPersonalization(user.id)
        if (!completed) {
          navigate('/personalization', { replace: true })
        }
      }
    }
    checkPersonalization()
  }, [user, navigate])

  useEffect(() => {
    loadTrendingBooks()
  }, [])

  const loadTrendingBooks = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('Loading trending books...')
      const books = await getTrendingBooks(10, 30)
      console.log('Trending books loaded:', books.length)
      setTrendingBooks(books)
    } catch (err) {
      console.error('Error loading trending books:', err)
      setError('Failed to load trending books. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-gray dark:bg-white">
        <Header />
        <section className="bg-dark-gray dark:bg-white py-24 md:py-32">
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-white dark:text-dark-gray text-sm uppercase tracking-widest">
                Loading trending books...
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-gray dark:bg-white">
        <Header />
        <section className="bg-dark-gray dark:bg-white py-24 md:py-32">
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-red-500 text-sm">{error}</div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-gray dark:bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-dark-gray dark:bg-white py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-12 gap-8 md:gap-16 mb-12">
            <div className="col-span-12 md:col-span-6">
              <div className="mb-6">
                <h1 className="text-5xl md:text-6xl lg:text-7xl text-white dark:text-dark-gray leading-none">
                  Trending
                  <br />
                  Books
                </h1>
              </div>
            </div>
            <div className="col-span-12 md:col-span-6 border-t-2 border-white dark:border-dark-gray pt-8 md:pt-0 md:border-t-0 md:border-l-2 md:pl-12">
              <p className="text-lg text-white/70 dark:text-dark-gray/70 font-light mb-8">
                A live snapshot of what readers are gravitating towards right now—ranked using recent reads,
                wishlist adds, ratings, and conversations across NextChapter.
              </p>
              <Link
                to="/books"
                className="group inline-flex items-center gap-3 bg-white dark:bg-dark-gray text-dark-gray dark:text-white px-6 py-3 text-xs font-medium uppercase tracking-wider border border-white dark:border-dark-gray transition-all duration-300 hover:bg-dark-gray dark:hover:bg-white hover:text-white dark:hover:text-dark-gray overflow-hidden relative"
              >
                <ArrowLeft
                  className="w-3 h-3 relative z-10 transition-all duration-300 -translate-x-5 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                />
                <span className="relative z-10 transition-colors duration-300">Back to All Books</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Books Grid - styled similar to Books page */}
      <section className="bg-dark-gray dark:bg-white py-16">
        <div className="max-w-7xl mx-auto px-8">
          {trendingBooks.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-white/70 dark:text-dark-gray/70">
                No trending books available yet. Check back soon!
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-6">
                {trendingBooks.map((book, index) => (
                  <Link
                    key={book.id}
                    to={`/book/${encodeURIComponent(book.id)}`}
                    className="group"
                  >
                    <div className="relative overflow-hidden border-2 border-white dark:border-dark-gray group hover:bg-white dark:hover:bg-dark-gray transition-colors">
                      {/* Rank Badge - bookmark style (high contrast) */}
                      <div className="absolute -top-1 right-3 z-10 flex flex-col items-center text-white">
                        <div className="px-2 pt-3 pb-1 bg-coral shadow-lg shadow-black/40 border border-dark-gray/30 dark:border-white/40 rounded-t-sm">
                          <span className="text-[10px] font-semibold uppercase tracking-[0.25em]">
                            #{index + 1}
                          </span>
                        </div>
                        <div className="w-0 h-0 border-t-4 border-t-coral border-l-4 border-l-transparent border-r-4 border-r-transparent"></div>
                      </div>

                      {book.cover_image ? (
                        <img
                          src={book.cover_image}
                          alt={book.title || 'Book cover'}
                          className="w-full aspect-2/3 object-cover group-hover:opacity-20 transition-opacity duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full aspect-2/3 bg-white dark:bg-dark-gray flex items-center justify-center text-dark-gray dark:text-white text-6xl">
                          📚
                        </div>
                      )}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                        <h3 className="text-dark-gray dark:text-white font-medium text-sm line-clamp-2 mb-2 uppercase tracking-widest">
                          {book.title || 'Untitled'}
                        </h3>
                        <p className="text-dark-gray/70 dark:text-white/70 text-xs line-clamp-1 font-light uppercase tracking-widest">
                          {book.author || 'Unknown Author'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-white dark:text-dark-gray font-medium text-xs line-clamp-2 mb-2 uppercase tracking-widest">
                        {book.title || 'Untitled'}
                      </h3>
                      <p className="text-white/60 dark:text-dark-gray/60 text-xs mb-2 font-light uppercase tracking-widest">
                        {book.author || 'Unknown Author'}
                      </p>
                      {book.description && (
                        <p className="text-white/50 dark:text-dark-gray/50 text-xs line-clamp-2 font-light leading-relaxed">
                          {book.description}
                        </p>
                      )}
                      <div className="mt-2 flex items-center gap-2 text-xs text-white/60 dark:text-dark-gray/60">
                        <TrendingUp className="w-3 h-3" />
                        <span>Score: {book.trendingScore?.toFixed(1) || '0.0'}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-gray dark:bg-white border-t-2 border-white dark:border-dark-gray py-16 mt-24">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-6">
              <div className="text-4xl text-white dark:text-dark-gray mb-8 leading-none">
                NextChapter
              </div>
              <p className="text-sm text-white/60 dark:text-dark-gray/60 font-light uppercase tracking-widest max-w-md">
                Redefining digital reading with AI-powered intelligence
              </p>
            </div>
            <div className="col-span-12 md:col-span-6 border-t-2 border-white dark:border-dark-gray pt-8 md:pt-0 md:border-t-0 md:border-l-2 md:pl-12">
              <div className="grid grid-cols-2 gap-8 mb-8">
                <Link to="/" className="text-xs text-white dark:text-dark-gray font-medium uppercase tracking-widest hover:opacity-60 transition-opacity">Home</Link>
                <Link to="/books" className="text-xs text-white dark:text-dark-gray font-medium uppercase tracking-widest hover:opacity-60 transition-opacity">All Books</Link>
                <a href="#" className="text-xs text-white dark:text-dark-gray font-medium uppercase tracking-widest hover:opacity-60 transition-opacity">Contact</a>
                <a href="#" className="text-xs text-white dark:text-dark-gray font-medium uppercase tracking-widest hover:opacity-60 transition-opacity">Privacy</a>
              </div>
              <div className="text-xs text-white/40 dark:text-dark-gray/40 font-light uppercase tracking-widest">
                © 2025 NextChapter. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default TrendingBooksPage

