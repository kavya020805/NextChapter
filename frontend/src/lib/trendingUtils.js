import { supabase } from './supabaseClient'

/**
 * Calculate trending score for a book using the formula:
 * trendingScore = (1.0 * NewReads) + (0.5 * WishlistAdds) + 
 *                 (2.0 * RecentAvgRating * RecentRatingCount) + 
 *                 (0.1 * AvgScrollDepth%) + (1.5 * NewDiscussions)
 * 
 * @param {Object} metrics - Book metrics object
 * @returns {number} - Calculated trending score
 */
export function calculateTrendingScore(metrics) {
  const {
    newReads = 0,
    wishlistAdds = 0,
    recentAvgRating = 0,
    recentRatingCount = 0,
    avgScrollDepth = 0,
    newDiscussions = 0
  } = metrics

  const score = 
    (1.0 * newReads) +
    (0.5 * wishlistAdds) +
    (2.0 * recentAvgRating * recentRatingCount) +
    (0.1 * avgScrollDepth) +
    (1.5 * newDiscussions)

  return score
}

/**
 * Get metrics for a specific book from Supabase
 * @param {string} bookId - Book ID
 * @param {number} days - Number of recent days to consider (default: 30)
 * @returns {Promise<Object>} - Book metrics
 */
export async function getBookMetrics(bookId, days = 30) {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)
  const cutoffDateStr = cutoffDate.toISOString()

  try {
    // Get NewReads (books marked as read in the last N days)
    const { count: newReads, error: readsError } = await supabase
      .from('book_reads')
      .select('*', { count: 'exact', head: true })
      .eq('book_id', bookId)
      .gte('read_at', cutoffDateStr)

    if (readsError && readsError.code !== 'PGRST116') {
      // PGRST116 is "relation does not exist" - we'll handle that gracefully
      console.warn(`Error fetching reads for book ${bookId}:`, readsError)
    }

    // Get WishlistAdds (books added to wishlist in the last N days)
    const { count: wishlistAdds, error: wishlistError } = await supabase
      .from('book_wishlist')
      .select('*', { count: 'exact', head: true })
      .eq('book_id', bookId)
      .gte('added_at', cutoffDateStr)

    if (wishlistError && wishlistError.code !== 'PGRST116') {
      console.warn(`Error fetching wishlist for book ${bookId}:`, wishlistError)
    }

    // Get Recent Ratings (ratings in the last N days)
    const { data: recentRatings, error: ratingsError } = await supabase
      .from('book_ratings')
      .select('rating')
      .eq('book_id', bookId)
      .gte('rated_at', cutoffDateStr)

    if (ratingsError && ratingsError.code !== 'PGRST116') {
      console.warn(`Error fetching ratings for book ${bookId}:`, ratingsError)
    }

    const recentRatingCount = recentRatings?.length || 0
    const recentAvgRating = recentRatingCount > 0
      ? recentRatings.reduce((sum, r) => sum + (r.rating || 0), 0) / recentRatingCount
      : 0

    // Get Average Scroll Depth (average of all scroll depths for this book)
    const { data: scrollDepths, error: scrollError } = await supabase
      .from('book_scroll_depth')
      .select('scroll_depth_percentage')
      .eq('book_id', bookId)

    if (scrollError && scrollError.code !== 'PGRST116') {
      console.warn(`Error fetching scroll depth for book ${bookId}:`, scrollError)
    }

    const avgScrollDepth = scrollDepths && scrollDepths.length > 0
      ? scrollDepths.reduce((sum, s) => sum + (s.scroll_depth_percentage || 0), 0) / scrollDepths.length
      : 0

    // Get NewDiscussions (discussions created in the last N days)
    const { count: newDiscussions, error: discussionsError } = await supabase
      .from('book_discussions')
      .select('*', { count: 'exact', head: true })
      .eq('book_id', bookId)
      .gte('created_at', cutoffDateStr)

    if (discussionsError && discussionsError.code !== 'PGRST116') {
      console.warn(`Error fetching discussions for book ${bookId}:`, discussionsError)
    }

    return {
      newReads: newReads || 0,
      wishlistAdds: wishlistAdds || 0,
      recentAvgRating,
      recentRatingCount,
      avgScrollDepth,
      newDiscussions: newDiscussions || 0
    }
  } catch (error) {
    console.error(`Error fetching metrics for book ${bookId}:`, error)
    // Return default metrics if tables don't exist yet
    return {
      newReads: 0,
      wishlistAdds: 0,
      recentAvgRating: 0,
      recentRatingCount: 0,
      avgScrollDepth: 0,
      newDiscussions: 0
    }
  }
}

/**
 * Get top N trending books from Supabase
 * @param {number} limit - Number of books to return (default: 10)
 * @param {number} days - Number of recent days to consider (default: 30)
 * @returns {Promise<Array>} - Array of books with trending scores, sorted by score descending
 */
export async function getTrendingBooks(limit = 10, days = 30) {
  try {
    console.log('Fetching trending books...')
    
    // Fetch all books
    const { data: books, error: booksError } = await supabase
      .from('books')
      .select('*')

    if (booksError) {
      console.error('Error fetching books:', booksError)
      throw booksError
    }

    if (!books || books.length === 0) {
      console.log('No books found in database')
      return []
    }

    console.log(`Found ${books.length} books, calculating trending scores...`)

    // Calculate trending score for each book
    const booksWithScores = await Promise.all(
      books.map(async (book) => {
        try {
          const metrics = await getBookMetrics(book.id, days)
          const trendingScore = calculateTrendingScore(metrics)
          
          return {
            ...book,
            trendingScore,
            metrics
          }
        } catch (err) {
          console.error(`Error calculating score for book ${book.id}:`, err)
          // Return book with 0 score if calculation fails
          return {
            ...book,
            trendingScore: 0,
            metrics: {
              newReads: 0,
              wishlistAdds: 0,
              recentAvgRating: 0,
              recentRatingCount: 0,
              avgScrollDepth: 0,
              newDiscussions: 0
            }
          }
        }
      })
    )

    // Sort by trending score (descending) and return top N
    // If all scores are 0, still return books (they'll be sorted by score but all equal)
    const sortedBooks = booksWithScores
      .sort((a, b) => {
        // First sort by trending score
        if (b.trendingScore !== a.trendingScore) {
          return b.trendingScore - a.trendingScore
        }
        // If scores are equal, sort by title for consistency
        return (a.title || '').localeCompare(b.title || '')
      })
      .slice(0, limit)

    console.log(`Returning ${sortedBooks.length} trending books (scores: ${sortedBooks.map(b => b.trendingScore).join(', ')})`)
    return sortedBooks
  } catch (error) {
    console.error('Error getting trending books:', error)
    // Return empty array on error
    return []
  }
}

