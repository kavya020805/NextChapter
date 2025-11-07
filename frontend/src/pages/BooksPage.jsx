import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import { Search } from 'lucide-react'

function BooksPage() {
  const [allBooks, setAllBooks] = useState([])
  const [filteredBooks, setFilteredBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadBooks()
  }, [])

  useEffect(() => {
    if (!searchTerm) {
      setFilteredBooks(allBooks)
    } else {
      const filtered = allBooks.filter(book => 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.subjects?.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredBooks(filtered)
    }
  }, [searchTerm, allBooks])

  const loadBooks = async () => {
    setLoading(true)
    try {
      const response = await fetch('/books-data.json')
      if (!response.ok) {
        throw new Error('books-data.json not found')
      }
      
      const booksData = await response.json()
      setAllBooks(booksData)
      setFilteredBooks(booksData)
    } catch (e) {
      console.error('Failed to load books:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-black dark:via-purple-950 dark:to-black py-16 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Discover Your Next
              <span className="text-transparent bg-clip-text bg-linear-to-r from-coral to-pink-400"> Adventure</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Explore thousands of free books from Project Gutenberg
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="flex items-center bg-white dark:bg-gray-800 rounded-full px-6 py-4 shadow-lg">
                <Search className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <input
                  type="text"
                  placeholder="Search books, authors, subjects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent border-none outline-none ml-3 w-full text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Books Grid */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-coral"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading books...</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {allBooks.length === 0 ? 'No books found. Please add books to books-data.json' : 'No books match your search'}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                Showing <span className="font-semibold text-coral">{filteredBooks.length}</span> books
                {searchTerm && allBooks.length > filteredBooks.length && (
                  <span> (filtered from <span className="font-semibold">{allBooks.length}</span> total)</span>
                )}
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {filteredBooks.map((book) => (
                <Link
                  key={book.id}
                  to={`/reader-local?id=${encodeURIComponent(book.id)}`}
                  className="group"
                >
                  <div className="relative overflow-hidden rounded-lg shadow-md group-hover:shadow-xl transition-all duration-300">
                    {book.coverUrl ? (
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-full aspect-2/3 object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full aspect-2/3 bg-gradient-to-br from-coral to-pink-500 flex items-center justify-center text-white text-6xl">
                        📚
                      </div>
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                      <h3 className="text-white font-semibold text-sm line-clamp-2 mb-1">
                        {book.title}
                      </h3>
                      <p className="text-gray-300 text-xs line-clamp-1">
                        {book.author || 'Unknown Author'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 px-1">
                    <h3 className="text-gray-900 dark:text-white font-medium text-sm line-clamp-2 mb-1">
                      {book.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs line-clamp-1">
                      {book.author || 'Unknown Author'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-12 mt-20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="text-2xl font-bold mb-4">
            Next<span className="text-coral">Chapter</span>
          </div>
          <p className="text-gray-400 dark:text-gray-500 mb-6">
            Redefining digital reading with AI-powered intelligence
          </p>
          <div className="flex justify-center space-x-6 text-sm text-gray-400 dark:text-gray-500">
            <Link to="/" className="hover:text-coral transition-colors">Home</Link>
            <a href="#" className="hover:text-coral transition-colors">About</a>
            <a href="#" className="hover:text-coral transition-colors">Contact</a>
            <a href="#" className="hover:text-coral transition-colors">Privacy</a>
          </div>
          <div className="mt-8 text-sm text-gray-500 dark:text-gray-600">
            Powered by Project Gutenberg • © 2025 NextChapter. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default BooksPage

