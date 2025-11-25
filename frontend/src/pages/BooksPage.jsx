import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Search, X, TrendingUp } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { hasCompletedPersonalization } from '../lib/personalizationUtils'
import { transformBookCoverUrls } from '../lib/bookUtils'

function BooksPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [allBooks, setAllBooks] = useState([])
  const [filteredBooks, setFilteredBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedGenre = searchParams.get('genre')

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

  // Clean up hash from URL (OAuth callback)
  useEffect(() => {
    const removeHash = () => {
      if (window.location.hash) {
        // Remove hash from URL using replaceState
        const url = window.location.pathname + window.location.search
        window.history.replaceState(null, '', url)
        
        // Also try using replace as fallback
        if (window.location.hash) {
          window.location.replace(url)
        }
      }
    }
    
    // Run immediately
    removeHash()
    
    // Also run after a short delay to catch any late hash additions
    const timeout = setTimeout(removeHash, 50)
    
    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    loadBooks()
  }, [])


  useEffect(() => {
    let filtered = allBooks

    // Apply genre filter
    if (selectedGenre) {
      const normalizedSelected = selectedGenre.toLowerCase()

      filtered = filtered.filter((book) => {
        // `genres` is a Postgres text[] column -> Supabase returns it as a JS array
        // Fall back to `genre` if some records still use the old column
        const rawGenres = book.genres ?? book.genre ?? []

        const genres = Array.isArray(rawGenres)
          ? rawGenres
          : rawGenres
          ? [rawGenres]
          : []

        return genres.some((g) => {
          if (!g) return false
          const value = g.toString().toLowerCase()
          return value === normalizedSelected || value.includes(normalizedSelected)
        })
      })
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.subjects?.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    setFilteredBooks(filtered)
  }, [searchTerm, allBooks, selectedGenre])

  const loadBooks = async () => {
    setLoading(true)
    try {
      // Fetch books from Supabase
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('title', { ascending: true })
      
      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      // Transform cover_image paths to full URLs
      const booksWithUrls = transformBookCoverUrls(data || [])
      
      console.log('Fetched books from Supabase:', booksWithUrls?.length || 0)
      setAllBooks(booksWithUrls)
      setFilteredBooks(booksWithUrls)
    } catch (e) {
      console.error('Failed to load books from Supabase:', e)
      // Optionally fallback to local JSON
      try {
        const response = await fetch('/books-data.json')
        if (response.ok) {
          const booksData = await response.json()
          setAllBooks(booksData)
          setFilteredBooks(booksData)
          console.log('Loaded books from local JSON fallback')
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
  }

  const clearGenreFilter = () => {
    setSearchParams({})
  }

  return (
    <div className="min-h-screen bg-dark-gray dark:bg-white">
      <Header />
      
      {/* Hero Section - Swiss Style */}
      <section className="bg-dark-gray dark:bg-white py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-12 gap-8 md:gap-16 mb-16">
            <div className="col-span-12 md:col-span-6">
              <h1 className="text-5xl md:text-6xl lg:text-7xl text-white dark:text-dark-gray mb-8 leading-none">
                Discover Your
                <br />
                Next Adventure
              </h1>
            </div>
            <div className="col-span-12 md:col-span-6 border-t-2 border-white dark:border-dark-gray pt-8 md:pt-0 md:border-t-0 md:border-l-2 md:pl-12">
              <p className="text-lg text-white/70 dark:text-dark-gray/70 mb-8 font-light">
                Browse all available books from our vast library containing books from various genres
              </p>
              
              {/* Search Bar - Swiss Style */}
              <form onSubmit={handleSearch}>
                <div className="flex items-center border-2 border-white dark:border-dark-gray p-4">
                  <Search className="w-5 h-5 text-white dark:text-dark-gray mr-4" />
                  <input
                    type="text"
                    placeholder="Search books, authors, subjects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent border-none outline-none w-full text-white dark:text-dark-gray placeholder-white/40 dark:placeholder-dark-gray/40 text-sm font-light uppercase tracking-widest"
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Books Grid - Swiss Style */}
      <section className="bg-dark-gray dark:bg-white py-16">
        <div className="max-w-7xl mx-auto px-8">
          {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-coral"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading books...</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {allBooks.length === 0 
                ? 'No books found. Please check your Supabase connection and ensure the books table has data.'
                : 'No books match your search'}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <p className="text-white/60 dark:text-dark-gray/60 text-xs uppercase tracking-widest">
                  Showing <span className="font-medium text-coral">{filteredBooks.length}</span> books
                  {searchTerm && allBooks.length > filteredBooks.length && (
                    <span> (filtered from <span className="font-medium">{allBooks.length}</span> total)</span>
                  )}
                </p>
                {selectedGenre && (
                  <button
                    onClick={clearGenreFilter}
                    className="flex items-center gap-2 bg-white dark:bg-dark-gray text-dark-gray dark:text-white border-2 border-white dark:border-dark-gray px-3 py-1.5 text-xs uppercase tracking-widest hover:opacity-80 transition-opacity"
                  >
                    <span>{selectedGenre}</span>
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
             
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {filteredBooks.map((book) => (
                <Link
                  key={book.id}
                  to={`/book/${encodeURIComponent(book.id)}`}
                  className="group"
                >
                  <div className="relative overflow-hidden border-2 border-white dark:border-dark-gray group hover:bg-white dark:hover:bg-dark-gray transition-colors">
                    {book.cover_image ? (
                      <img
                        src={book.cover_image}
                        alt={book.title}
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
      <Footer />
    </div>
  )
}

export default BooksPage

