import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Star, Pin } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'

function FavoriteBooks() {
  const [favoriteBooks, setFavoriteBooks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFavoriteBooks()
  }, [])

  const loadFavoriteBooks = async () => {
    try {
      // Get wishlist from localStorage
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
      
      if (wishlist.length === 0) {
        setFavoriteBooks([])
        setLoading(false)
        return
      }

      // Fetch book details from Supabase
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .in('id', wishlist.slice(0, 5)) // Get first 5 favorites
      
      if (error) throw error

      // Add ratings to books
      const booksWithRatings = (data || []).map(book => {
        const rating = localStorage.getItem(`book_rating_${book.id}`)
        const progress = localStorage.getItem(`book_progress_${book.id}`) || '0'
        return {
          ...book,
          userRating: rating ? parseInt(rating) : 0,
          progress: parseInt(progress)
        }
      })

      setFavoriteBooks(booksWithRatings)
    } catch (error) {
      console.error('Error loading favorite books:', error)
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

  if (favoriteBooks.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-gray border border-dark-gray/10 dark:border-white/10 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Pin className="w-4 h-4 text-dark-gray dark:text-white" />
          <h3 className="text-sm text-dark-gray dark:text-white font-medium uppercase tracking-wider">
            Favorites
          </h3>
        </div>
        <p className="text-xs text-dark-gray/60 dark:text-white/60">
          No favorites yet
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-dark-gray border border-dark-gray/10 dark:border-white/10 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Pin className="w-4 h-4 text-dark-gray dark:text-white" />
        <h3 className="text-sm text-dark-gray dark:text-white font-medium uppercase tracking-wider">
          Favorites
        </h3>
      </div>

      <div className="space-y-2">
        {favoriteBooks.map((book) => (
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
              <p className="text-xs text-dark-gray/60 dark:text-white/60 mb-1.5 truncate">
                {book.author || 'Unknown Author'}
              </p>
              
              {book.userRating > 0 && (
                <div className="flex items-center gap-0.5 mb-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3 h-3 ${
                        star <= book.userRating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-dark-gray/20 dark:text-white/20'
                      }`}
                    />
                  ))}
                </div>
              )}
              
              {book.progress > 0 && (
                <div>
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
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default FavoriteBooks

