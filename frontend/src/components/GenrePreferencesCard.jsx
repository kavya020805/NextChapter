import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

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
    if (propGenreDistribution && Object.keys(propGenreDistribution).length > 0) {
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
      
      setGenreData(genres)
      setTotalBooks(total)
      setLoading(false)
    } else {
      // Fallback to loading from database/localStorage
      loadGenreData()
    }
  }, [propGenreDistribution])

  const loadGenreData = async () => {
    try {
      // Get read books from localStorage
      let read = []
      try {
        const readData = localStorage.getItem('read')
        if (readData) {
          read = JSON.parse(readData)
        }
      } catch (e) {
        console.error('Error parsing read books:', e)
        read = []
      }

      if (!Array.isArray(read) || read.length === 0) {
        // Demo data
        const demoData = [
          { genre: 'Fantasy', count: 12, percentage: 35 },
          { genre: 'Science Fiction', count: 8, percentage: 25 },
          { genre: 'Mystery', count: 7, percentage: 20 },
          { genre: 'Literary Fiction', count: 5, percentage: 15 },
          { genre: 'Non-Fiction', count: 2, percentage: 5 }
        ]
        setGenreData(demoData)
        setTotalBooks(34)
        setLoading(false)
        return
      }

      setTotalBooks(read.length)

      // Fetch book details from Supabase using new schema
      const { data, error } = await supabase
        .from('books')
        .select('id, genres, subjects')
        .in('id', read)

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      // Count genres
      const genreCounts = {}
      const total = (data || []).length

      ;(data || []).forEach(book => {
        // Prefer genres[] from new schema, fall back to subjects[] if needed
        const rawGenres = Array.isArray(book.genres)
          ? book.genres
          : Array.isArray(book.subjects)
          ? book.subjects
          : []

        rawGenres.forEach(genre => {
          if (genre) {
            const genreKey = genre.toString().trim()
            if (!genreKey) return
            genreCounts[genreKey] = (genreCounts[genreKey] || 0) + 1
          }
        })
      })

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
      // Demo data on error
      const demoData = [
        { genre: 'Fantasy', count: 12, percentage: 35 },
        { genre: 'Science Fiction', count: 8, percentage: 25 },
        { genre: 'Mystery', count: 7, percentage: 20 },
        { genre: 'Literary Fiction', count: 5, percentage: 15 },
        { genre: 'Non-Fiction', count: 2, percentage: 5 }
      ]
      setGenreData(demoData)
      setTotalBooks(34)
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

  return (
    <div className="bg-dark-gray dark:bg-white border-2 border-white/30 dark:border-dark-gray/30 p-4 flex flex-col h-full">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-base text-white dark:text-dark-gray font-semibold uppercase tracking-wider mb-1">
          Genre Preferences
        </h3>
        <p className="text-xs text-white/60 dark:text-dark-gray/60">
          Your reading habits by genre this year
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

