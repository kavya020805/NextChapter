import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { parseGenres } from '../lib/genreUtils'

function GenrePreferencesCard({ genreDistribution: propGenreDistribution = {} }) {
  const [genreData, setGenreData] = useState([])
  const [totalBooks, setTotalBooks] = useState(0)
  const [loading, setLoading] = useState(true)

  // Genre-specific colors (pastel versions of theme colors)
  const genreColors = [
    '#6EE7B7', // pastel emerald
    '#93C5FD', // pastel blue
    '#FDBA74', // pastel orange
    '#FDE68A', // pastel amber
    '#F9A8D4', // pastel pink
    '#A5B4FC', // pastel indigo
    '#C4B5FD' // pastel violet
  ]

  // Get color for genre index (wrap around palette)
  const getGenreColor = (index) => {
    return genreColors[index % genreColors.length]
  }

  useEffect(() => {
    console.log('=== GenrePreferencesCard Debug ===');
    console.log('propGenreDistribution:', propGenreDistribution);
    console.log('Keys count:', Object.keys(propGenreDistribution || {}).length);
    
    if (propGenreDistribution && Object.keys(propGenreDistribution).length > 0) {
      console.log('Using provided genre distribution');
      // Use provided genre distribution
      const total = Object.values(propGenreDistribution).reduce((sum, count) => sum + count, 0)
      const genres = Object.entries(propGenreDistribution)
        .map(([genre, count]) => ({
          genre,
          count,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
      
      console.log('Processed genres:', genres);
      setGenreData(genres)
      setTotalBooks(total)
      setLoading(false)
    } else {
      console.log('Falling back to loadGenreData (localStorage/database)');
      // Fallback to loading from database/localStorage
      loadGenreData()
    }
    console.log('=================================');
  }, [propGenreDistribution])

  const loadGenreData = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        console.log('No user logged in - showing empty state');
        setGenreData([])
        setTotalBooks(0)
        setLoading(false)
        return
      }

      // Fetch books that are marked as 'read' OR 'reading' from user_books table
      console.log('🔍 Fetching user books for user:', user.id);
      const { data: userBooks, error: userBooksError } = await supabase
        .from('user_books')
        .select('book_id, status')
        .eq('user_id', user.id)
        .in('status', ['read', 'reading']) // Get both read and currently reading books

      if (userBooksError) {
        console.error('❌ Error fetching user books:', userBooksError)
        throw userBooksError
      }

      console.log('📚 User books fetched:', userBooks);
      console.log('📊 Books by status:', {
        reading: userBooks?.filter(b => b.status === 'reading').length || 0,
        read: userBooks?.filter(b => b.status === 'read').length || 0,
        total: userBooks?.length || 0
      });

      const bookIds = (userBooks || []).map(ub => ub.book_id)

      if (bookIds.length === 0) {
        console.log('⚠️ No books read or reading - showing empty state');
        setGenreData([])
        setTotalBooks(0)
        setLoading(false)
        return
      }

      console.log('📖 Book IDs to fetch:', bookIds);
      setTotalBooks(bookIds.length)

      // Fetch book details from Supabase
      // Note: 'genres' is an array/vector column in PostgreSQL
      const { data, error } = await supabase
        .from('books')
        .select('id, genres')
        .in('id', bookIds)

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('=== GenrePreferencesCard Fetch Debug ===');
      console.log('Fetched books count:', data?.length || 0);
      console.log('Book IDs (read + reading) from database:', bookIds);
      
      if (data && data.length > 0) {
        console.log('✅ Sample book structure:', {
          id: data[0].id,
          genres: data[0].genres,
          isArray: Array.isArray(data[0].genres),
          genresLength: Array.isArray(data[0].genres) ? data[0].genres.length : 0
        });
      } else {
        console.log('⚠️ No book data returned from query');
      }

      // Count genres
      const genreCounts = {}
      const total = (data || []).length

      ;(data || []).forEach(book => {
        // Use utility function to parse genres (handles all formats)
        const rawGenres = parseGenres(book);

        console.log(`📕 Book ${book.id}:`, {
          genres: book.genres,
          type: typeof book.genres,
          isArray: Array.isArray(book.genres),
          parsedGenres: rawGenres
        });

        rawGenres.forEach(genre => {
          if (genre) {
            genreCounts[genre] = (genreCounts[genre] || 0) + 1
          }
        })
      })

      console.log('Final genre counts:', genreCounts);
      console.log('======================================');

      // Convert to array and calculate percentages
      let genres = Object.entries(genreCounts)
        .map(([genre, count]) => ({
          genre,
          count,
          percentage: total > 0 ? (count / total) * 100 : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5) // Top 5 genres

      // Normalize percentages to sum to 100% (adjust the largest slice if needed)
      const totalPercentage = genres.reduce((sum, item) => sum + item.percentage, 0)
      if (totalPercentage > 0 && Math.abs(totalPercentage - 100) > 0.01) {
        const diff = 100 - totalPercentage
        if (genres.length > 0) {
          genres[0].percentage += diff
        }
      }

      // Round percentages for display
      genres = genres.map(item => ({
        ...item,
        percentage: Math.round(item.percentage)
      }))

      setGenreData(genres)
      setTotalBooks(total)
    } catch (error) {
      console.error('Error loading genre data:', error)
      // Show empty state on error instead of demo data
      setGenreData([])
      setTotalBooks(0)
    } finally {
      setLoading(false)
    }
  }

  // Generate minimal pie chart path
  const generatePieChart = (data) => {
    if (!data || data.length === 0) return null

    const size = 100
    const radius = 40
    const centerX = size / 2
    const centerY = size / 2
    let currentAngle = -90 // Start from top

    const paths = data.map((item, index) => {
      const sliceAngle = (item.percentage / 100) * 360
      const startAngle = currentAngle
      const endAngle = currentAngle + sliceAngle

      const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180)
      const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180)
      const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180)
      const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180)

      const largeArcFlag = sliceAngle > 180 ? 1 : 0

      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ')

      currentAngle = endAngle

      return {
        path: pathData,
        color: getGenreColor(index),
        genre: item.genre
      }
    })

    return paths
  }

  const piePaths = generatePieChart(genreData)

  if (loading) {
    return (
      <div className="bg-dark-gray dark:bg-white border-2 border-white/30 dark:border-dark-gray/30 p-4">
        <div className="text-white dark:text-dark-gray text-sm">Loading...</div>
      </div>
    )
  }

  // Empty state when no books have been read
  if (!genreData || genreData.length === 0) {
    return (
      <div className="bg-dark-gray dark:bg-white border-2 border-white/30 dark:border-dark-gray/30 p-4 flex flex-col h-full">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-base text-white dark:text-dark-gray font-semibold uppercase tracking-wider mb-1">
            Genre Preferences
          </h3>
          <p className="text-xs text-white/60 dark:text-dark-gray/60">
            Genres you're reading and have read
          </p>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
          <div className="w-16 h-16 mb-4 rounded-full border-2 border-white/20 dark:border-dark-gray/20 flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-white/40 dark:text-dark-gray/40" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
              />
            </svg>
          </div>
          <p className="text-sm text-white/60 dark:text-dark-gray/60 mb-1">
            No books yet
          </p>
          <p className="text-xs text-white/40 dark:text-dark-gray/40">
            Start reading to see your genre preferences
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-dark-gray dark:bg-white border-2 border-white/30 dark:border-dark-gray/30 p-4 flex flex-col h-full">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-base text-white dark:text-dark-gray font-semibold uppercase tracking-wider mb-1">
          Genre Preferences
        </h3>
        <p className="text-xs text-white/60 dark:text-dark-gray/60">
          Based on {totalBooks} book{totalBooks !== 1 ? 's' : ''} you're reading & have read
        </p>
      </div>

      {/* Content */}
      <div className="flex flex-col md:flex-row gap-6 flex-1 items-center md:items-start">
        {/* Minimal Pie Chart (40% width) */}
        <div className="shrink-0 w-full md:w-[40%] flex justify-center items-center py-2">
          <div className="relative" style={{ width: '100px', height: '100px' }}>
            <svg width="120" height="120" viewBox="0 0 100 100" className="absolute inset-0">
              {piePaths && piePaths.map((path, index) => (
                <path
                  key={index}
                  d={path.path}
                  fill={path.color}
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="0.5"
                />
              ))}
            </svg>
          </div>
        </div>

        {/* Legend (60% width) */}
        <div className="flex-1 w-full md:w-[60%] space-y-2.5">
          {genreData.map((item, index) => {
            const color = getGenreColor(index)
            return (
              <div key={index} className="flex items-center gap-3">
                {/* Colored dot */}
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                {/* Genre info */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white dark:text-dark-gray truncate">
                    {item.genre}
                  </div>
                  <div className="text-xs text-white/60 dark:text-dark-gray/60">
                    {item.count} {item.count === 1 ? 'book' : 'books'} ({item.percentage}%)
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default GenrePreferencesCard

