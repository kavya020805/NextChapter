import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

function PinnedBooksCard({ pinnedBooks: propPinnedBooks = [] }) {
  const [pinnedBooks, setPinnedBooks] = useState([])
  const [loading, setLoading] = useState(true)
	const navigate = useNavigate()

  useEffect(() => {
    if (propPinnedBooks && propPinnedBooks.length > 0) {
      // Use provided data
      const booksWithRatings = propPinnedBooks.map(book => {
        const rating = localStorage.getItem(`book_rating_${book.id}`)
        return {
          ...book,
          userRating: rating ? parseInt(rating) : 0
        }
      })
      const sorted = booksWithRatings.sort((a, b) => (b.userRating || 0) - (a.userRating || 0))
      setPinnedBooks(sorted.slice(0, 3))
      setLoading(false)
    } else {
      // Fallback to loading from localStorage
      loadPinnedBooks()
    }
  }, [propPinnedBooks])

  const loadPinnedBooks = async () => {
    try {
      // Get wishlist from localStorage (using it as pinned books)
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
      
      if (wishlist.length === 0) {
        setPinnedBooks([])
        setLoading(false)
        return
      }

      // Fetch book details from Supabase
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .in('id', wishlist)
      
      if (error) throw error

      // Add ratings to books
      const booksWithRatings = (data || []).map(book => {
        const rating = localStorage.getItem(`book_rating_${book.id}`)
        return {
          ...book,
          userRating: rating ? parseInt(rating) : 0
        }
      })
      const sorted = booksWithRatings.sort((a, b) => (b.userRating || 0) - (a.userRating || 0))
      setPinnedBooks(sorted.slice(0, 3))
    } catch (error) {
      console.error('Error loading pinned books:', error)
      setPinnedBooks([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-dark-gray dark:bg-white border-2 border-white/30 dark:border-dark-gray/30 p-4 flex flex-col h-full">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-base text-white dark:text-dark-gray font-medium mb-1 uppercase tracking-wider">
          Pinned Books
        </h3>
      </div>

      {/* Book List */}
      {loading ? (
        <p className="text-xs text-white/60 dark:text-dark-gray/60">Loading...</p>
      ) : pinnedBooks.length === 0 ? (
        <p className="text-xs text-white/60 dark:text-dark-gray/60">No pinned books yet</p>
      ) : (
        <div className="space-y-3">
          {pinnedBooks.map((book, index) => (
            <div key={book.id}>
              <div
                className="cursor-pointer rounded-md -mx-2 px-2 py-1 hover:bg-white/5 dark:hover:bg-dark-gray/5"
                onClick={() => navigate(`/book/${book.id}`)}
              >
                {/* Title */}
                <h4 className="text-sm font-semibold text-white dark:text-dark-gray mb-1">
                  {book.title}
                </h4>
                
                {/* Author */}
                <p className="text-xs text-white/60 dark:text-dark-gray/60 mb-2">
                  {book.author || 'Unknown Author'}
                </p>
                
                {/* Star Rating */}
                {book.userRating > 0 && (
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3 h-3 ${
                          star <= book.userRating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-white/20 dark:text-dark-gray/20'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
              {/* Divider - except for last item */}
              {index < pinnedBooks.length - 1 && (
                <div className="mt-3 pt-3 border-t border-white/20 dark:border-dark-gray/20" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PinnedBooksCard

