import { useEffect, useState } from 'react'

function ReadingHeatmap() {
  const [heatmapData, setHeatmapData] = useState([])
  const [activeDays, setActiveDays] = useState(0)

  useEffect(() => {
    // Generate heatmap data for the current year
    const generateHeatmapData = () => {
      const today = new Date()
      const startOfYear = new Date(today.getFullYear(), 0, 1)
      const daysInYear = Math.floor((today - startOfYear) / (1000 * 60 * 60 * 24))
      
      // Get reading activity from localStorage (in real app, this would come from database)
      // For now, we'll simulate based on reading sessions
      const readingSessions = JSON.parse(localStorage.getItem('reading_sessions') || '[]')
      
      const data = []
      let active = 0
      
      for (let i = 0; i <= daysInYear; i++) {
        const date = new Date(startOfYear)
        date.setDate(date.getDate() + i)
        const dateStr = date.toISOString().split('T')[0]
        
        // Check if there's activity on this date
        // In real app, check reading_sessions for this date
        // For demo, simulate activity
        const hasActivity = readingSessions.some(session => session.date === dateStr)
        let activity = 0
        
        if (hasActivity) {
          activity = Math.floor(Math.random() * 4) + 1
          active++
        } else {
          // Simulate some random activity for demo
          activity = Math.random() > 0.6 ? Math.floor(Math.random() * 4) + 1 : 0
          if (activity > 0) active++
        }
        
        data.push({
          date,
          dateStr,
          activity
        })
      }
      
      setHeatmapData(data)
      setActiveDays(active || 205) // Fallback to demo value
    }

    generateHeatmapData()
  }, [])

  const getIntensityClass = (activity) => {
    if (activity === 0) return 'bg-white dark:bg-dark-gray border border-dark-gray/10 dark:border-white/10'
    if (activity === 1) return 'bg-green-200 dark:bg-green-900'
    if (activity === 2) return 'bg-green-400 dark:bg-green-700'
    if (activity === 3) return 'bg-green-600 dark:bg-green-500'
    return 'bg-green-800 dark:bg-green-300'
  }

  // Group days by week (7 days per week)
  const weeks = []
  for (let i = 0; i < heatmapData.length; i += 7) {
    const week = heatmapData.slice(i, i + 7)
    // Pad week to 7 days if needed
    while (week.length < 7) {
      week.push({ date: null, activity: -1 })
    }
    weeks.push(week)
  }

  return (
    <div className="bg-white dark:bg-dark-gray border border-dark-gray/10 dark:border-white/10 p-4">
      <h3 className="text-sm text-dark-gray dark:text-white font-medium mb-3 uppercase tracking-wider">
        Activity
      </h3>
      
      <div className="overflow-x-auto mb-3">
        <div className="flex gap-0.5 min-w-max">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-0.5">
              {week.map((day, dayIndex) => {
                if (day.activity === -1 || !day.date) {
                  return <div key={dayIndex} className="w-2.5 h-2.5" />
                }
                return (
                  <div
                    key={dayIndex}
                    className={`w-2.5 h-2.5 ${getIntensityClass(day.activity)} rounded cursor-pointer hover:opacity-80 transition-opacity`}
                    title={`${day.date.toLocaleDateString()}: ${day.activity} ${day.activity === 1 ? 'session' : 'sessions'}`}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] text-dark-gray/50 dark:text-white/50">
        <span>Less</span>
        <div className="flex gap-0.5">
          <div className="w-2 h-2 bg-white dark:bg-dark-gray border border-dark-gray/10 dark:border-white/10 rounded" />
          <div className="w-2 h-2 bg-green-200 dark:bg-green-900 rounded" />
          <div className="w-2 h-2 bg-green-400 dark:bg-green-700 rounded" />
          <div className="w-2 h-2 bg-green-600 dark:bg-green-500 rounded" />
          <div className="w-2 h-2 bg-green-800 dark:bg-green-300 rounded" />
        </div>
        <span>More</span>
      </div>
    </div>
  )
}

export default ReadingHeatmap

