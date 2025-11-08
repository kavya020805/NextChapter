import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'

function OngoingBooks() {
  const [ongoingBooks, setOngoingBooks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOngoingBooks()
  }, [])

  const loadOngoingBooks = async () => {
    try {
      // Get all books from localStorage that have progress but aren't complete
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
      const read = JSON.parse(localStorage.getItem('read') || '[]')
      
      // Get books with progress > 0 and < 100, and not in read list
      const booksWithProgress = []
      const allBookIds = new Set([...wishlist])
      
      // Check localStorage for progress
      for (const bookId of allBookIds) {
        if (read.includes(bookId)) continue
        
        const progress = parseInt(localStorage.getItem(`book_progress_${bookId}`) || '0')
        if (progress > 0 && progress < 100) {
          booksWithProgress.push({ id: bookId, progress })
        }
      }

      if (booksWithProgress.length === 0) {
        setOngoingBooks([])
        setLoading(false)
        return
      }

      // Fetch book details
      const bookIds = booksWithProgress.map(b => b.id)
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .in('id', bookIds)
      
      if (error) throw error

      // Combine with progress
      const books = (data || []).map(book => {
        const progressData = booksWithProgress.find(b => b.id === book.id)
        return {
          ...book,
          progress: progressData?.progress || 0
        }
      }).slice(0, 5) // Limit to 5 books

      setOngoingBooks(books)
    } catch (error) {
      console.error('Error loading ongoing books:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-dark-gray border border-dark-gray/10 dark:border-white/10 p-4">
        <p className="text-xs text-dark-gray dark:text-white">Loading...</p>
      </div>
    )
  }

  if (ongoingBooks.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-gray border border-dark-gray/10 dark:border-white/10 p-4">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-dark-gray dark:text-white" />
          <h3 className="text-sm text-dark-gray dark:text-white font-medium uppercase tracking-wider">
            Reading
          </h3>
        </div>
        <p className="text-xs text-dark-gray/60 dark:text-white/60">
          No books in progress
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-dark-gray border border-dark-gray/10 dark:border-white/10 p-4">
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="w-4 h-4 text-dark-gray dark:text-white" />
        <h3 className="text-sm text-dark-gray dark:text-white font-medium uppercase tracking-wider">
          Reading
        </h3>
      </div>

      <div className="space-y-2">
        {ongoingBooks.map((book) => (
          <Link
            key={book.id}
            to={`/book/${book.id}`}
            className="flex items-center gap-3 p-2 border border-dark-gray/10 dark:border-white/10 hover:bg-dark-gray/5 dark:hover:bg-white/5 transition-colors"
          >
            <img
              src={book.cover_image || '/placeholder-book.png'}
              alt={book.title}
              className="w-12 h-16 object-cover border border-dark-gray/10 dark:border-white/10"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/128x192?text=No+Cover'
              }}
            />
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm text-dark-gray dark:text-white font-medium mb-0.5 truncate">
                {book.title}
              </h4>
              <p className="text-xs text-dark-gray/60 dark:text-white/60 mb-2 truncate">
                {book.author || 'Unknown Author'}
              </p>
              
              <div className="w-full bg-dark-gray/10 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-green-600 dark:bg-green-400 h-full transition-all"
                  style={{ width: `${book.progress}%` }}
                />
              </div>
              <p className="text-[10px] text-dark-gray/60 dark:text-white/60 mt-0.5">
                {book.progress}%
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default OngoingBooks

