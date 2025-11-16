import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

function CurrentlyReadingCard({ currentlyReading: propCurrentlyReading = [] }) {
  const [readingBooks, setReadingBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (propCurrentlyReading && propCurrentlyReading.length > 0) {
      // Use provided data
      const booksWithProgress = propCurrentlyReading
        .map(book => ({
          ...book,
          progress: book.progress || 0
        }))
        .filter(book => book.progress > 0 && book.progress < 100)
        .sort((a, b) => (b.progress || 0) - (a.progress || 0))
        .slice(0, 3)
      setReadingBooks(booksWithProgress)
      setLoading(false)
    } else {
      // Fallback to loading from localStorage
      loadCurrentlyReading()
    }
  }, [propCurrentlyReading])

  const loadCurrentlyReading = async () => {
    try {
      // Get books with progress > 0 and < 100 from localStorage
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
      const readingList = []
      
      for (const bookId of wishlist) {
        const progress = localStorage.getItem(`book_progress_${bookId}`)
        if (progress && parseInt(progress) > 0 && parseInt(progress) < 100) {
          readingList.push(bookId)
        }
      }
      
      if (readingList.length === 0) {
        setReadingBooks([])
        setLoading(false)
        return
      }

      // Fetch book details from Supabase
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .in('id', readingList)
      
      if (error) throw error

      // Add progress to books
      const booksWithProgress = (data || [])
        .map(book => {
          const progress = localStorage.getItem(`book_progress_${book.id}`) || '0'
          return {
            ...book,
            progress: parseInt(progress)
          }
        })
        .filter(book => book.progress > 0 && book.progress < 100)
        .sort((a, b) => (b.progress || 0) - (a.progress || 0))
        .slice(0, 3)

      setReadingBooks(booksWithProgress)
    } catch (error) {
      console.error('Error loading currently reading books:', error)
      setReadingBooks([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-dark-gray dark:bg-white border-2 border-white/30 dark:border-dark-gray/30 p-4 flex flex-col h-full">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-base text-white dark:text-dark-gray font-medium mb-1 uppercase tracking-wider">
          Currently Reading
        </h3>
      </div>

      {/* Book List */}
      {loading ? (
        <p className="text-xs text-white/60 dark:text-dark-gray/60">Loading...</p>
      ) : readingBooks.length === 0 ? (
        <p className="text-xs text-white/60 dark:text-dark-gray/60">No books in progress</p>
      ) : (
        <div className="space-y-4">
          {readingBooks.map((book, index) => (
            <div key={book.id}>
              <div
                className="flex items-start gap-3 cursor-pointer rounded-md -mx-2 px-2 py-1 hover:bg-white/5 dark:hover:bg-dark-gray/5"
                onClick={() => navigate(`/book/${book.id}`)}
              >
                {/* Book Cover Thumbnail */}
                <img
                  src={book.cover_image || 'https://via.placeholder.com/64x64?text=No+Cover'}
                  alt={book.title}
                  className="w-12 h-12 object-cover border-2 border-white/20 dark:border-dark-gray/20 shrink-0"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/64x64?text=No+Cover'
                  }}
                />
                
                {/* Title, Author, Progress */}
                <div className="flex-1 min-w-0">
                  {/* Title */}
                  <h4 className="text-sm font-semibold text-white dark:text-dark-gray mb-0.5">
                    {book.title}
                  </h4>
                  
                  {/* Author */}
                  <p className="text-xs text-white/60 dark:text-dark-gray/60 mb-2">
                    {book.author || 'Unknown Author'}
                  </p>
                  
                  {/* Progress Bar */}
                  <div className="mb-1.5">
                    <div className="w-full h-1.5 bg-white/10 dark:bg-dark-gray/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-700 dark:bg-emerald-600 transition-all duration-300 rounded-full"
                        style={{ width: `${book.progress}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Progress Percentage */}
                  <p className="text-xs text-white/50 dark:text-dark-gray/50">
                    {book.progress}% complete
                  </p>
                </div>
              </div>
              
              {/* Divider - except for last item */}
              {index < readingBooks.length - 1 && (
                <div className="mt-4 pt-4 border-t border-white/20 dark:border-dark-gray/20" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CurrentlyReadingCard

