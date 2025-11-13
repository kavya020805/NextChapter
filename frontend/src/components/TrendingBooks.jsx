import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, BookOpen } from 'lucide-react'
import { getTrendingBooks } from '../lib/trendingUtils'

function TrendingBooks() {
  const [trendingBooks, setTrendingBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
      <section className="bg-white dark:bg-dark-gray py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-dark-gray dark:text-white text-sm uppercase tracking-widest">
              Loading trending books...
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="bg-white dark:bg-dark-gray py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-red-500 text-sm">{error}</div>
          </div>
        </div>
      </section>
    )
  }

  if (trendingBooks.length === 0) {
    return (
      <section className="bg-white dark:bg-dark-gray py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-12 gap-8 mb-16">
            <div className="col-span-12 md:col-span-4">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-8 h-8 text-dark-gray dark:text-white" />
                <h2 className="text-5xl md:text-6xl text-dark-gray dark:text-white leading-none">
                  Trending
                  <br />
                  Now
                </h2>
              </div>
            </div>
            <div className="col-span-12 md:col-span-8 border-t-2 border-dark-gray dark:border-white pt-8 md:pt-0 md:border-t-0 md:border-l-2 md:pl-12">
              <p className="text-lg text-dark-gray/70 dark:text-white/70 font-light">
                No trending books available yet. Check back soon!
              </p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-white dark:bg-dark-gray py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-12 gap-8 mb-16">
          <div className="col-span-12 md:col-span-4">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-8 h-8 text-dark-gray dark:text-white" />
              <h2 className="text-5xl md:text-6xl text-dark-gray dark:text-white leading-none">
                Trending
                <br />
                Now
              </h2>
            </div>
          </div>
          <div className="col-span-12 md:col-span-8 border-t-2 border-dark-gray dark:border-white pt-8 md:pt-0 md:border-t-0 md:border-l-2 md:pl-12">
            <p className="text-lg text-dark-gray/70 dark:text-white/70 font-light">
              Discover the most popular books based on recent reads, wishlist adds, ratings, and discussions
            </p>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6 md:gap-8">
          {trendingBooks.map((book, index) => (
            <Link
              key={book.id}
              to={`/book/${book.id}`}
              className="col-span-6 md:col-span-4 lg:col-span-3 group"
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
                  
                  {/* Trending Score (optional - can be hidden) */}
                  <div className="flex items-center gap-2 text-xs text-dark-gray/40 dark:text-white/40">
                    <TrendingUp className="w-3 h-3" />
                    <span>Score: {book.trendingScore?.toFixed(1) || '0.0'}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Link */}
        <div className="mt-12 text-center">
          <Link
            to="/books"
            className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-dark-gray dark:text-white hover:opacity-60 transition-opacity"
          >
            View All Books
            <span className="text-lg">→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default TrendingBooks

