import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

function MonthlyProgressCard() {
  const [monthlyData, setMonthlyData] = useState([])
  const [totalBooks, setTotalBooks] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [hoveredMonth, setHoveredMonth] = useState(null)

  useEffect(() => {
    loadMonthlyData()
  }, [])

  const loadMonthlyData = async () => {
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

      // Get reading sessions for pages
      let readingSessions = []
      try {
        const sessionsData = localStorage.getItem('reading_sessions')
        if (sessionsData) {
          readingSessions = JSON.parse(sessionsData)
        }
      } catch (e) {
        console.error('Error parsing reading sessions:', e)
        readingSessions = []
      }

      if (!Array.isArray(read) || read.length === 0) {
        // Demo data
        const demoData = [
          { month: 'Jan', books: 3, pages: 920 },
          { month: 'Feb', books: 2, pages: 650 },
          { month: 'Mar', books: 5, pages: 1540 },
          { month: 'Apr', books: 4, pages: 1200 },
          { month: 'May', books: 3, pages: 980 },
          { month: 'Jun', books: 6, pages: 1850 },
          { month: 'Jul', books: 4, pages: 1320 },
          { month: 'Aug', books: 3, pages: 950 },
          { month: 'Sep', books: 2, pages: 680 },
          { month: 'Oct', books: 4, pages: 1250 },
          { month: 'Nov', books: 1, pages: 400 },
          { month: 'Dec', books: 1, pages: 350 }
        ]
        setMonthlyData(demoData)
        setTotalBooks(38)
        setTotalPages(11090)
        setLoading(false)
        return
      }

      // Initialize monthly data
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const monthlyCounts = {}
      const monthlyPages = {}

      months.forEach(month => {
        monthlyCounts[month] = 0
        monthlyPages[month] = 0
      })

      // Fetch book details to get completion dates (or use reading sessions)
      const currentYear = new Date().getFullYear()
      const yearStart = new Date(currentYear, 0, 1)

      // Try to get completion dates from books or estimate from reading sessions
      readingSessions.forEach(session => {
        if (session.date) {
          const sessionDate = new Date(session.date)
          if (sessionDate >= yearStart) {
            const monthIndex = sessionDate.getMonth()
            const monthName = months[monthIndex]
            if (monthlyPages[monthName] !== undefined) {
              monthlyPages[monthName] = (monthlyPages[monthName] || 0) + (session.pages || 0)
            }
          }
        }
      })

      // For books, distribute them across months (simplified - in real app, use actual completion dates)
      const { data, error } = await supabase
        .from('books')
        .select('id')
        .in('id', read)

      if (!error && data) {
        // Distribute books evenly across months (for demo)
        const booksPerMonth = Math.floor(data.length / 12)
        const remainder = data.length % 12

        months.forEach((month, index) => {
          monthlyCounts[month] = booksPerMonth + (index < remainder ? 1 : 0)
        })

        // Calculate total pages from sessions or estimate
        const totalPagesCount = Object.values(monthlyPages).reduce((sum, pages) => sum + pages, 0)
        if (totalPagesCount === 0) {
          // Estimate pages (assuming average 300 pages per book)
          Object.keys(monthlyCounts).forEach(month => {
            monthlyPages[month] = monthlyCounts[month] * 300
          })
        }
      }

      const dataArray = months.map(month => ({
        month,
        books: monthlyCounts[month] || 0,
        pages: monthlyPages[month] || 0
      }))

      setMonthlyData(dataArray)
      setTotalBooks(data?.length || read.length)
      setTotalPages(Object.values(monthlyPages).reduce((sum, pages) => sum + pages, 0) || read.length * 300)
    } catch (error) {
      console.error('Error loading monthly data:', error)
      // Demo data on error
      const demoData = [
        { month: 'Jan', books: 3, pages: 920 },
        { month: 'Feb', books: 2, pages: 650 },
        { month: 'Mar', books: 5, pages: 1540 },
        { month: 'Apr', books: 4, pages: 1200 },
        { month: 'May', books: 3, pages: 980 },
        { month: 'Jun', books: 6, pages: 1850 },
        { month: 'Jul', books: 4, pages: 1320 },
        { month: 'Aug', books: 3, pages: 950 },
        { month: 'Sep', books: 2, pages: 680 },
        { month: 'Oct', books: 4, pages: 1250 },
        { month: 'Nov', books: 1, pages: 400 },
        { month: 'Dec', books: 1, pages: 350 }
      ]
      setMonthlyData(demoData)
      setTotalBooks(38)
      setTotalPages(11090)
    } finally {
      setLoading(false)
    }
  }

  // Generate line chart with improved design
  const generateLineChart = (data) => {
    if (!data || data.length === 0) return null

    const width = 600
    const height = 260
    const padding = { top: 30, right: 25, bottom: 30, left: 45 }
    const chartWidth = width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom

    const maxBooks = Math.max(...data.map(d => d.books), 1)
    const stepX = data.length > 1 ? chartWidth / (data.length - 1) : 0
    const scaleY = maxBooks > 0 ? chartHeight / maxBooks : chartHeight

    // Generate points with smooth spacing
    const points = data.map((item, index) => ({
      x: padding.left + (data.length > 1 ? index * stepX : chartWidth / 2),
      y: padding.top + chartHeight - (item.books * scaleY),
      books: item.books,
      pages: item.pages,
      month: item.month
    }))

    // Generate smooth path using simple interpolation
    const generateSmoothPath = (points) => {
      if (points.length < 2) return ''
      
      // Simple linear path with rounded line joins (handled by strokeLinejoin)
      return points.map((point, index) => {
        if (index === 0) {
          return `M ${point.x} ${point.y}`
        } else {
          return `L ${point.x} ${point.y}`
        }
      }).join(' ')
    }

    const pathData = generateSmoothPath(points)

    return { points, pathData, width, height, padding, maxBooks, chartWidth, chartHeight }
  }

  const chart = generateLineChart(monthlyData)

  if (loading) {
    return (
      <div className="bg-dark-gray dark:bg-white border-2 border-white/30 dark:border-dark-gray/30 p-4">
        <div className="text-white dark:text-dark-gray text-sm">Loading...</div>
      </div>
    )
  }

  return (
    <div className="bg-dark-gray dark:bg-white border-2 border-white/30 dark:border-dark-gray/30 p-4 flex flex-col h-fit">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-base text-white dark:text-dark-gray font-semibold uppercase tracking-wider mb-1">
          Monthly Reading Progress
        </h3>
        <p className="text-xs text-white/60 dark:text-dark-gray/60">
          Books completed each month
        </p>
      </div>

      {/* Chart */}
      <div className="mb-4 relative" style={{ height: '175px' }}>
        {chart && chart.points.length > 0 && (
          <div className="w-full">
            <svg 
              width="100%" 
              height="220" 
              viewBox={`0 0 ${chart.width} ${chart.height}`}
              preserveAspectRatio="xMidYMid meet"
              className="w-full h-full"
            >
              {/* Subtle gridlines */}
              {[0, 1, 2, 3, 4, 5].map((line) => {
                const y = chart.padding.top + (chart.chartHeight * (line / 5))
                return (
                  <line
                    key={line}
                    x1={chart.padding.left}
                    y1={y}
                    x2={chart.width - chart.padding.right}
                    y2={y}
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />
                )
              })}

              {/* Area under line (subtle fill) */}
              {chart.pathData && (
                <defs>
                  <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(16, 185, 129, 0.15)" />
                    <stop offset="100%" stopColor="rgba(16, 185, 129, 0.02)" />
                  </linearGradient>
                </defs>
              )}

              {/* Area fill */}
              {chart.pathData && chart.points.length > 0 && (
                <path
                  d={`${chart.pathData} L ${chart.points[chart.points.length - 1].x} ${chart.padding.top + chart.chartHeight} L ${chart.points[0].x} ${chart.padding.top + chart.chartHeight} Z`}
                  fill="url(#areaGradient)"
                  opacity="0.6"
                />
              )}

              {/* Smooth line */}
              {chart.pathData && (
                <path
                  d={chart.pathData}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="drop-shadow-sm"
                />
              )}

              {/* Dots with hover effect */}
              {chart.points.map((point, index) => (
                <g key={index}>
                  {/* Hover area (larger invisible circle for easier interaction) */}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="12"
                    fill="transparent"
                    onMouseEnter={() => setHoveredMonth(index)}
                    onMouseLeave={() => setHoveredMonth(null)}
                    className="cursor-pointer"
                  />
                  {/* Dot */}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={hoveredMonth === index ? "7" : "5.5"}
                    fill={hoveredMonth === index ? "#10b981" : "#34d399"}
                    stroke="rgba(255, 255, 255, 0.4)"
                    strokeWidth={hoveredMonth === index ? "3" : "2.5"}
                    onMouseEnter={() => setHoveredMonth(index)}
                    onMouseLeave={() => setHoveredMonth(null)}
                    className="cursor-pointer transition-all"
                    style={{ transition: 'r 0.2s ease' }}
                  />
                  {/* Hover tooltip */}
                  {hoveredMonth === index && (
                    <g>
                      <defs>
                        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2"/>
                        </filter>
                      </defs>
                      <rect
                        x={point.x - 55}
                        y={point.y - 48}
                        width="110"
                        height="36"
                        fill="rgba(0, 0, 0, 0.85)"
                        rx="6"
                        stroke="rgba(255, 255, 255, 0.15)"
                        strokeWidth="1"
                        filter="url(#shadow)"
                      />
                      <text
                        x={point.x}
                        y={point.y - 32}
                        textAnchor="middle"
                        fill="white"
                        fontSize="13"
                        fontWeight="600"
                      >
                        {point.month}
                      </text>
                      <text
                        x={point.x}
                        y={point.y - 18}
                        textAnchor="middle"
                        fill="rgba(255, 255, 255, 0.9)"
                        fontSize="12"
                        fontWeight="500"
                      >
                        {point.books} {point.books === 1 ? 'book' : 'books'}
                      </text>
                      <text
                        x={point.x}
                        y={point.y - 4}
                        textAnchor="middle"
                        fill="rgba(255, 255, 255, 0.7)"
                        fontSize="10"
                      >
                        ({point.pages.toLocaleString()} pages)
                      </text>
                    </g>
                  )}
                </g>
              ))}

              {/* Month labels - black text */}
              {chart.points.map((point, index) => (
                <text
                  key={index}
                  x={point.x}
                  y={chart.height - 10}
                  textAnchor="middle"
                  fill="#000000"
                  fontSize="20"
                  fontWeight="600"
                >
                  {point.month}
                </text>
              ))}
            </svg>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center text-xs text-white/60 dark:text-dark-gray/60 border-t border-white/10 dark:border-dark-gray/10 pt-3">
        <div>
          Total Books: <span className="font-semibold text-white dark:text-dark-gray">{totalBooks}</span>
        </div>
        <div>
          Total Pages: <span className="font-semibold text-white dark:text-dark-gray">{totalPages.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}

export default MonthlyProgressCard

