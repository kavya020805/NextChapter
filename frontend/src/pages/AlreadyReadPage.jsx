import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import { Search } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

function AlreadyReadPage() {
  const [allBooks, setAllBooks] = useState([])
  const [filteredBooks, setFilteredBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadBooks()
  }, [])

  // Get user's read books from localStorage
  const getReadBooks = () => {
    try {
      const read = JSON.parse(localStorage.getItem('read') || '[]')
      return read
    } catch {
      return []
    }
  }

  useEffect(() => {
    const readBooks = getReadBooks()
    
    let filtered = allBooks.filter(book => readBooks.includes(book.id))

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.subjects?.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    setFilteredBooks(filtered)
  }, [searchTerm, allBooks])

  const loadBooks = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
      
      if (error) throw error
      
      setAllBooks(data || [])
    } catch (e) {
      console.error('Failed to load books from Supabase:', e)
      // Fallback to local JSON
      try {
        const response = await fetch('/books-data.json')
        if (response.ok) {
          const booksData = await response.json()
          setAllBooks(booksData)
        }
      } catch (fallbackError) {
        console.error('Fallback failed:', fallbackError)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
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
                Already
                <br />
                Read
              </h1>
            </div>
            <div className="col-span-12 md:col-span-6 border-t-2 border-white dark:border-dark-gray pt-8 md:pt-0 md:border-t-0 md:border-l-2 md:pl-12">
              <p className="text-lg text-white/70 dark:text-dark-gray/70 mb-8 font-light">
                Books you've completed reading
              </p>
              
              {/* Search Bar - Swiss Style */}
              <form onSubmit={handleSearch}>
                <div className="flex items-center border-2 border-white dark:border-dark-gray p-4">
                  <Search className="w-5 h-5 text-white dark:text-dark-gray mr-4" />
                  <input
                    type="text"
                    placeholder="Search your completed books..."
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
                ? 'No books found. Please check your Supabase connection.'
                : "You haven't marked any books as read yet. Start reading to build your collection!"}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-white/60 dark:text-dark-gray/60 text-xs uppercase tracking-widest">
                Showing <span className="font-medium text-coral">{filteredBooks.length}</span> books you've already read
              </p>
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

      {/* Footer - Swiss Style */}
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
                <a href="#" className="text-xs text-white dark:text-dark-gray font-medium uppercase tracking-widest hover:opacity-60 transition-opacity">About</a>
                <a href="#" className="text-xs text-white dark:text-dark-gray font-medium uppercase tracking-widest hover:opacity-60 transition-opacity">Contact</a>
                <a href="#" className="text-xs text-white dark:text-dark-gray font-medium uppercase tracking-widest hover:opacity-60 transition-opacity">Privacy</a>
              </div>
              <div className="text-xs text-white/40 dark:text-dark-gray/40 font-light uppercase tracking-widest">
                Powered by Project Gutenberg • © 2025 NextChapter. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default AlreadyReadPage

