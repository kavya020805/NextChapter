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

  // Split books into two rows: first 5 and next 5
  const firstRow = trendingBooks.slice(0, 5)
  const secondRow = trendingBooks.slice(5, 10)

  return (
    <div className="min-h-screen bg-dark-gray dark:bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-dark-gray dark:bg-white py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-12 gap-8 md:gap-16 mb-12">
            <div className="col-span-12 md:col-span-6">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-8 h-8 text-white dark:text-dark-gray" />
                <h1 className="text-5xl md:text-6xl lg:text-7xl text-white dark:text-dark-gray leading-none">
                  Trending
                  <br />
                  Books
                </h1>
              </div>
            </div>
            <div className="col-span-12 md:col-span-6 border-t-2 border-white dark:border-dark-gray pt-8 md:pt-0 md:border-t-0 md:border-l-2 md:pl-12">
              <p className="text-lg text-white/70 dark:text-dark-gray/70 font-light mb-8">
                Discover the most popular books based on recent reads, wishlist adds, ratings, and discussions
              </p>
              <Link
                to="/books"
                className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-white dark:text-dark-gray hover:opacity-60 transition-opacity"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to All Books
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Books - First Row (5 books) */}
      {trendingBooks.length > 0 && (
        <section className="bg-white dark:bg-dark-gray py-16">
          <div className="max-w-7xl mx-auto px-8">
            {firstRow.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8 mb-12">
                {firstRow.map((book, index) => (
                  <Link
                    key={book.id}
                    to={`/book/${book.id}`}
                    className="group"
                  >
                    <div className="relative overflow-hidden border-2 border-dark-gray dark:border-white hover:bg-dark-gray/5 dark:hover:bg-white/5 transition-all duration-300">
                      {/* Trending Badge */}
                      {index < 3 && (
                        <div className="absolute top-4 right-4 z-10 bg-dark-gray dark:bg-white text-white dark:text-dark-gray text-xs font-bold px-3 py-1 uppercase tracking-widest">
                          #{index + 1}
                        </div>
                      )}

                      {/* Book Cover */}
                      <div className="relative aspect-2/3 overflow-hidden bg-dark-gray/10 dark:bg-white/10">
                        {book.cover_image ? (
                          <img
                            src={book.cover_image}
                            alt={book.title || 'Book cover'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-16 h-16 text-dark-gray/20 dark:text-white/20" />
                          </div>
                        )}
                      </div>

                      {/* Book Info */}
                      <div className="p-6">
                        <h3 className="text-lg font-medium text-dark-gray dark:text-white mb-2 line-clamp-2 group-hover:opacity-80 transition-opacity">
                          {book.title || 'Untitled'}
                        </h3>
                        {book.author && (
                          <p className="text-sm text-dark-gray/60 dark:text-white/60 mb-3 line-clamp-1">
                            {book.author}
                          </p>
                        )}
                        
                        {/* Trending Score */}
                        <div className="flex items-center gap-2 text-xs text-dark-gray/40 dark:text-white/40">
                          <TrendingUp className="w-3 h-3" />
                          <span>Score: {book.trendingScore?.toFixed(1) || '0.0'}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Trending Books - Second Row (5 books) */}
            {secondRow.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
                {secondRow.map((book, index) => (
                  <Link
                    key={book.id}
                    to={`/book/${book.id}`}
                    className="group"
                  >
                    <div className="relative overflow-hidden border-2 border-dark-gray dark:border-white hover:bg-dark-gray/5 dark:hover:bg-white/5 transition-all duration-300">
                      {/* Trending Badge */}
                      <div className="absolute top-4 right-4 z-10 bg-dark-gray dark:bg-white text-white dark:text-dark-gray text-xs font-bold px-3 py-1 uppercase tracking-widest">
                        #{index + 6}
                      </div>

                      {/* Book Cover */}
                      <div className="relative aspect-2/3 overflow-hidden bg-dark-gray/10 dark:bg-white/10">
                        {book.cover_image ? (
                          <img
                            src={book.cover_image}
                            alt={book.title || 'Book cover'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-16 h-16 text-dark-gray/20 dark:text-white/20" />
                          </div>
                        )}
                      </div>

                      {/* Book Info */}
                      <div className="p-6">
                        <h3 className="text-lg font-medium text-dark-gray dark:text-white mb-2 line-clamp-2 group-hover:opacity-80 transition-opacity">
                          {book.title || 'Untitled'}
                        </h3>
                        {book.author && (
                          <p className="text-sm text-dark-gray/60 dark:text-white/60 mb-3 line-clamp-1">
                            {book.author}
                          </p>
                        )}
                        
                        {/* Trending Score */}
                        <div className="flex items-center gap-2 text-xs text-dark-gray/40 dark:text-white/40">
                          <TrendingUp className="w-3 h-3" />
                          <span>Score: {book.trendingScore?.toFixed(1) || '0.0'}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {trendingBooks.length === 0 && (
              <div className="text-center py-20">
                <p className="text-lg text-dark-gray/70 dark:text-white/70 font-light">
                  No trending books available yet. Check back soon!
                </p>
              </div>
            )}
          </div>
        </section>
      )}

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

