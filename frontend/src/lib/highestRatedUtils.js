import { supabase } from './supabaseClient'

function toNumber(value) {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : 0
}

export async function getHighestRatedBooks(limit = 10, minimumRatings = 1) {
  try {
    const { data, error } = await supabase
      .from('book_ratings')
      .select('book_id, rating')

    if (error) {
      throw error
    }

    if (!data || data.length === 0) {
      return []
    }

    const ratingMap = new Map()

    data.forEach(({ book_id, rating }) => {
      if (!book_id) return
      const existing = ratingMap.get(book_id) || { book_id, sum: 0, count: 0 }
      existing.sum += toNumber(rating)
      existing.count += 1
      ratingMap.set(book_id, existing)
    })

    const orderedStats = Array.from(ratingMap.values())
      .map((entry) => ({
        book_id: entry.book_id,
        avgRating: entry.count > 0 ? entry.sum / entry.count : 0,
        ratingCount: entry.count
      }))
      .filter((entry) => entry.book_id && entry.ratingCount >= minimumRatings)
      .sort((a, b) => {
        if (b.avgRating !== a.avgRating) {
          return b.avgRating - a.avgRating
        }
        if (b.ratingCount !== a.ratingCount) {
          return b.ratingCount - a.ratingCount
        }
        return String(a.book_id).localeCompare(String(b.book_id))
      })
      .slice(0, limit)

    if (orderedStats.length === 0) {
      return []
    }

    const { data: books, error: booksError } = await supabase
      .from('books')
      .select('*')
      .in('id', orderedStats.map((stat) => stat.book_id))

    if (booksError) {
      throw booksError
    }

    if (!books || books.length === 0) {
      return []
    }

    const bookMap = new Map(books.map((book) => [book.id, book]))

    return orderedStats
      .map((stat) => {
        const book = bookMap.get(stat.book_id)
        if (!book) return null
        return {
          ...book,
          avgRating: stat.avgRating,
          ratingCount: stat.ratingCount
        }
      })
      .filter(Boolean)
  } catch (error) {
    console.error('Error fetching highest rated books:', error)
    return []
  }
}
