import { useState, useEffect } from 'react'

function ReadingActivityCard() {
  const [activityData, setActivityData] = useState({})
  const [stats, setStats] = useState({ activeDays: 205, pagesRead: 12973 })

  useEffect(() => {
    // Generate or load reading activity data for the year
    const generateActivityData = () => {
      const today = new Date()
      const currentYear = today.getFullYear()
      const startOfYear = new Date(currentYear, 0, 1)
      const data = {}
      
      // Get reading sessions from localStorage (in real app, from database)
      const readingSessions = JSON.parse(localStorage.getItem('reading_sessions') || '[]')
      const read = JSON.parse(localStorage.getItem('read') || '[]')
      
      // Generate data for each day of the year
      for (let i = 0; i < 365; i++) {
        const date = new Date(startOfYear)
        date.setDate(date.getDate() + i)
        
        // Skip future dates
        if (date > today) break
        
        const dateStr = date.toISOString().split('T')[0]
        const month = date.getMonth()
        const day = date.getDate()
        
        // Check if there's activity on this date
        const session = readingSessions.find(s => s.date === dateStr)
        
        if (session) {
          // Real activity data
          if (!data[month]) data[month] = {}
          data[month][day] = {
            pages: session.pages || Math.floor(Math.random() * 100),
            sessions: session.sessions || Math.floor(Math.random() * 3) + 1,
            date: new Date(date)
          }
        } else {
          // Simulate some random activity for demo (60% chance of activity)
          if (Math.random() > 0.4) {
            if (!data[month]) data[month] = {}
            data[month][day] = {
              pages: Math.floor(Math.random() * 100),
              sessions: Math.floor(Math.random() * 3) + 1,
              date: new Date(date)
            }
          }
        }
      }
      
      setActivityData(data)
      
      // Calculate stats
      const activeDays = Object.values(data).reduce((sum, month) => sum + Object.keys(month).length, 0)
      const pagesRead = read.length > 0 ? read.length * 300 : 12973 // Fallback
      setStats({ activeDays: activeDays || 205, pagesRead })
    }

    generateActivityData()
  }, [])

  const getDayIntensity = (month, day) => {
    if (!activityData[month] || !activityData[month][day]) {
      return 0 // No activity
    }
    
    const activity = activityData[month][day]
    const pages = activity.pages || 0
    
    // Determine intensity based on pages read
    if (pages === 0) return 0
    if (pages < 25) return 1
    if (pages < 50) return 2
    if (pages < 75) return 3
    return 4 // High activity
  }

  const getIntensityClass = (intensity) => {
    // Using vibrant colors for better visibility and distinction
    // Green scale from light to dark for reading activity
    switch (intensity) {
      case 0:
        return 'bg-white/5' // Very light/transparent for no activity
      case 1:
        return 'bg-emerald-400/40' // Light activity - light green
      case 2:
        return 'bg-emerald-500/60' // Moderate activity - medium green
      case 3:
        return 'bg-emerald-600/80' // High activity - darker green
      case 4:
        return 'bg-emerald-700' // Very high activity - darkest green
      default:
        return 'bg-white/5'
    }
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]

  const daysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfWeek = (month, year) => {
    return new Date(year, month, 1).getDay()
  }

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()
  const currentDay = new Date().getDate()

  return (
    <div className="bg-dark-gray dark:bg-white border-2 border-white/30 dark:border-dark-gray/30 p-4 mb-4">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-base text-white dark:text-dark-gray font-medium mb-1 uppercase tracking-wider">
          Reading Activity
        </h3>
        <p className="text-sm text-white/70 dark:text-dark-gray/70">
          {stats.activeDays} days active this year | {stats.pagesRead.toLocaleString()} pages read
        </p>
      </div>

      {/* Months Grid - Optimized size for readability */}
      <div className="flex gap-x-1.5 gap-y-4 mb-4 overflow-x-auto pb-2">
        {months.map((monthName, monthIndex) => {
          const daysInCurrentMonth = daysInMonth(monthIndex, currentYear)
          const firstDay = getFirstDayOfWeek(monthIndex, currentYear)
          const isCurrentMonth = monthIndex === currentMonth
          const isFutureMonth = monthIndex > currentMonth
          
          return (
            <div key={monthIndex} className="flex flex-col gap-1.5 flex-shrink-0">
              {/* Month Label */}
              <div className="text-xs text-white/60 dark:text-dark-gray/60 uppercase tracking-wider text-center font-medium">
                {monthName}
              </div>
              
              {/* Days Grid - 7 columns for days of the week */}
              <div className="grid grid-cols-7 gap-[2px]">
                {/* Empty cells for days before month starts */}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="w-[9px] h-[9px] rounded-sm" />
                ))}
                
                {/* Days of the month */}
                {Array.from({ length: daysInCurrentMonth }).map((_, dayIndex) => {
                  const day = dayIndex + 1
                  const intensity = getDayIntensity(monthIndex, day)
                  const isToday = isCurrentMonth && day === currentDay
                  const isFuture = isFutureMonth || (isCurrentMonth && day > currentDay)
                  const activity = activityData[monthIndex]?.[day]
                  
                  return (
                    <div
                      key={day}
                      className={`w-[9px] h-[9px] rounded-sm cursor-pointer hover:scale-125 hover:z-10 relative transition-all ${
                        isFuture 
                          ? 'bg-white/5' 
                          : getIntensityClass(intensity)
                      } ${isToday ? 'ring-2 ring-yellow-400' : ''}`}
                      title={
                        activity
                          ? `${formatDate(activity.date)} — ${activity.pages} pages read (${activity.sessions} ${activity.sessions === 1 ? 'session' : 'sessions'})`
                          : isFuture
                          ? `${monthName} ${day}, ${currentYear} — No activity yet`
                          : `${monthName} ${day}, ${currentYear} — No activity`
                      }
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 text-xs text-white/50 dark:text-dark-gray/50">
        <span>Less</span>
        <div className="flex gap-[2px]">
          <div className="w-[9px] h-[9px] rounded-sm bg-emerald-400/40" />
          <div className="w-[9px] h-[9px] rounded-sm bg-emerald-500/60" />
          <div className="w-[9px] h-[9px] rounded-sm bg-emerald-600/80" />
          <div className="w-[9px] h-[9px] rounded-sm bg-emerald-700" />
        </div>
        <span>More</span>
      </div>
    </div>
  )
}

export default ReadingActivityCard

