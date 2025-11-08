import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

function GenreChart() {
  const [genreData, setGenreData] = useState([])

  useEffect(() => {
    loadGenreData()
  }, [])

  const loadGenreData = async () => {
    try {
      // Get read books from localStorage
      const read = JSON.parse(localStorage.getItem('read') || '[]')
      
      if (read.length === 0) {
        // Mock data for demonstration
        setGenreData([
          { genre: 'Fantasy', count: 12, percentage: 35 },
          { genre: 'Science Fiction', count: 8, percentage: 25 },
          { genre: 'Mystery', count: 7, percentage: 20 },
          { genre: 'Literary Fiction', count: 5, percentage: 15 },
          { genre: 'Non-Fiction', count: 2, percentage: 5 }
        ])
        return
      }

      // Fetch book details
      const { data, error } = await supabase
        .from('books')
        .select('id, genre, subjects')
        .in('id', read)
      
      if (error) throw error

      // Count genres
      const genreCounts = {}
      const total = (data || []).length

      ;(data || []).forEach(book => {
        const genres = book.genre 
          ? [book.genre] 
          : (Array.isArray(book.subjects) ? book.subjects : [book.subjects || 'Unknown'])
        
        genres.forEach(genre => {
          if (genre) {
            genreCounts[genre] = (genreCounts[genre] || 0) + 1
          }
        })
      })

      // Convert to array and calculate percentages
      const genres = Object.entries(genreCounts)
        .map(([genre, count]) => ({
          genre,
          count,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5) // Top 5 genres

      setGenreData(genres)
    } catch (error) {
      console.error('Error loading genre data:', error)
      // Fallback to mock data
      setGenreData([
        { genre: 'Fantasy', count: 12, percentage: 35 },
        { genre: 'Science Fiction', count: 8, percentage: 25 },
        { genre: 'Mystery', count: 7, percentage: 20 },
        { genre: 'Literary Fiction', count: 5, percentage: 15 },
        { genre: 'Non-Fiction', count: 2, percentage: 5 }
      ])
    }
  }

  const maxCount = Math.max(...genreData.map(g => g.count), 1)

  return (
    <div className="bg-white dark:bg-dark-gray border border-dark-gray/10 dark:border-white/10 p-4">
      <h3 className="text-sm text-dark-gray dark:text-white font-medium mb-3 uppercase tracking-wider">
        Genres
      </h3>
      
      <div className="space-y-2.5">
        {genreData.map((item, index) => (
          <div key={index}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-dark-gray dark:text-white font-medium truncate flex-1">
                {item.genre}
              </span>
              <span className="text-xs text-dark-gray/60 dark:text-white/60 ml-2">
                {item.count} ({item.percentage}%)
              </span>
            </div>
            <div className="w-full bg-dark-gray/10 dark:bg-white/10 h-3 rounded-full overflow-hidden">
              <div
                className="bg-green-600 dark:bg-green-400 h-full transition-all flex items-center justify-end pr-1.5"
                style={{ width: `${(item.count / maxCount) * 100}%` }}
              >
                <span className="text-[10px] text-white dark:text-dark-gray font-medium">
                  {item.count}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default GenreChart

