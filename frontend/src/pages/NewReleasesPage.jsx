import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { transformBookCoverUrls } from '../lib/bookUtils'
import Header from '../components/Header'
import { Calendar, TrendingUp, Sparkles } from 'lucide-react'

function NewReleasesPage() {
  const navigate = useNavigate()
  const [newBooks, setNewBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState('30') // days

  useEffect(() => {
    loadNewReleases()
  }, [timeFilter])

  const loadNewReleases = async () => {
    try {
      setLoading(true)
      
      // Calculate date threshold
      const daysAgo = parseInt(timeFilter)
      const dateThreshold = new Date()
      dateThreshold.setDate(dateThreshold.getDate() - daysAgo)
      const thresholdISO = dateThreshold.toISOString()

      console.log('Fetching books created after:', thresholdISO)

      // Fetch recently added books
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .gte('created_at', thresholdISO)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Error fetching new releases:', error)
        throw error
      }

      console.log('New releases found:', data?.length || 0)

      // Transform cover URLs
      const booksWithUrls = transformBookCoverUrls(data || [])
      setNewBooks(booksWithUrls)
    } catch (error) {
      console.error('Error loading new releases:', error)
      setNewBooks([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown'
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-dark-gray dark:bg-white">
      <Header />
      
      <section className="py-12 sm:py-16 md:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="mb-8 md:mb-12">
            <div className="mb-4">
              <span className="text-xs font-medium uppercase tracking-widest text-white dark:text-dark-gray border-b-2 border-white dark:border-dark-gray pb-2 inline-block">
                Fresh Arrivals
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-white dark:text-dark-gray mb-4 leading-none">
              New Releases
            </h1>
            
            <p className="text-base sm:text-lg text-white/70 dark:text-dark-gray/70 leading-relaxed font-light max-w-2xl mb-6">
              Discover the latest books added to our collection. Fresh stories, new adventures, and exciting reads await you.
            </p>

            {/* Time Filter */}
            <div className="flex flex-wrap gap-2">
              {[
                { value: '7', label: 'Last 7 Days' },
                { value: '30', label: 'Last 30 Days' },
                { value: '90', label: 'Last 3 Months' },
                { value: '365', label: 'This Year' }
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setTimeFilter(filter.value)}
                  className={`px-4 py-2 text-xs uppercase tracking-wider transition-all ${
                    timeFilter === filter.value
                      ? 'bg-white dark:bg-dark-gray text-dark-gray dark:text-white border-2 border-white dark:border-dark-gray'
                      : 'bg-transparent text-white/60 dark:text-dark-gray/60 border-2 border-white/30 dark:border-dark-gray/30 hover:border-white/60 dark:hover:border-dark-gray/60'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-coral mb-4"></div>
                <p className="text-white dark:text-dark-gray">Loading new releases...</p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && newBooks.length === 0 && (
            <div className="text-center py-20">
              <Calendar className="w-16 h-16 text-white/40 dark:text-dark-gray/40 mx-auto mb-4" />
              <h3 className="text-xl text-white dark:text-dark-gray mb-2">No New Releases</h3>
              <p className="text-white/60 dark:text-dark-gray/60">
                No books have been added in the selected time period.
              </p>
            </div>
          )}

          {/* Books Grid */}
          {!loading && newBooks.length > 0 && (
            <>
              <div className="mb-6">
                <p className="text-sm text-white/60 dark:text-dark-gray/60 uppercase tracking-wider">
                  Showing {newBooks.length} {newBooks.length === 1 ? 'book' : 'books'}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                {newBooks.map((book) => (
                  <div
                    key={book.id}
                    onClick={() => navigate(`/book/${book.id}`)}
                    className="group cursor-pointer"
                  >
                    {/* Book Cover */}
                    <div className="relative mb-3 overflow-hidden bg-white/5 dark:bg-dark-gray/5">
                      <div className="aspect-[2/3] relative">
                        {book.cover_image ? (
                          <img
                            src={book.cover_image}
                            alt={book.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.nextSibling.style.display = 'flex'
                            }}
                          />
                        ) : null}
                        <div
                          className="absolute inset-0 bg-white/10 dark:bg-dark-gray/10 flex items-center justify-center text-4xl"
                          style={{ display: book.cover_image ? 'none' : 'flex' }}
                        >
                          📚
                        </div>

                        {/* New Badge - Only show for books added within last 24 hours */}
                        {(() => {
                          const createdDate = new Date(book.created_at)
                          const now = new Date()
                          const diffTime = Math.abs(now - createdDate)
                          const diffDays = diffTime / (1000 * 60 * 60 * 24)
                          return diffDays <= 1
                        })() && (
                          <div className="absolute top-2 right-2 bg-coral text-white text-xs px-2 py-1 uppercase tracking-wider font-bold">
                            New
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Book Info */}
                    <div>
                      <h3 className="text-sm font-medium text-white dark:text-dark-gray mb-1 line-clamp-2 group-hover:text-coral dark:group-hover:text-coral transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-xs text-white/60 dark:text-dark-gray/60 mb-2 line-clamp-1">
                        {book.author || 'Unknown Author'}
                      </p>
                      
                      {/* Date Added */}
                      <div className="flex items-center gap-1 text-xs text-white/50 dark:text-dark-gray/50">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(book.created_at)}</span>
                      </div>

                      {/* Rating */}
                      {book.rating && book.rating > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-yellow-500">★</span>
                          <span className="text-xs text-white dark:text-dark-gray">
                            {typeof book.rating === 'number' 
                              ? book.rating.toFixed(1) 
                              : parseFloat(book.rating).toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}

export default NewReleasesPage
