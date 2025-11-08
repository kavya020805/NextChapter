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
    // Using dark colors with varying opacity on light background
    // Inverted from white on dark to dark on light
    switch (intensity) {
      case 0:
        return 'bg-dark-gray/10' // Very light/transparent for no activity
      case 1:
        return 'bg-dark-gray/40' // Light activity
      case 2:
        return 'bg-dark-gray/60' // Moderate activity
      case 3:
        return 'bg-dark-gray/80' // High activity
      case 4:
        return 'bg-dark-gray' // Very high activity - pure dark
      default:
        return 'bg-dark-gray/10'
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
    <div className="bg-white dark:bg-gray-100 p-4">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-sm text-dark-gray font-medium mb-1 uppercase tracking-wider">
          Reading Activity
        </h3>
        <p className="text-xs text-dark-gray/70">
          {stats.activeDays} days active this year | {stats.pagesRead.toLocaleString()} pages read
        </p>
      </div>

      {/* Months Grid - All in one line with horizontal scroll if needed */}
      <div className="flex gap-x-3 gap-y-4 mb-4 overflow-x-auto pb-2">
        {months.map((monthName, monthIndex) => {
          const daysInCurrentMonth = daysInMonth(monthIndex, currentYear)
          const firstDay = getFirstDayOfWeek(monthIndex, currentYear)
          const isCurrentMonth = monthIndex === currentMonth
          const isFutureMonth = monthIndex > currentMonth
          
          return (
            <div key={monthIndex} className="flex flex-col gap-2 flex-shrink-0">
              {/* Month Label */}
              <div className="text-[10px] text-dark-gray/60 uppercase tracking-wider text-center">
                {monthName}
              </div>
              
              {/* Days Grid - 7 columns for days of the week */}
              <div className="grid grid-cols-7 gap-[2px]">
                {/* Empty cells for days before month starts */}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="w-[7px] h-[7px]" />
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
                      className={`w-[7px] h-[7px] cursor-pointer hover:scale-150 hover:z-10 relative transition-transform ${
                        isFuture 
                          ? 'bg-dark-gray/10' 
                          : getIntensityClass(intensity)
                      } ${isToday ? 'ring-[1px] ring-dark-gray/50' : ''}`}
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
      <div className="flex items-center justify-end gap-2 text-[10px] text-dark-gray/50">
        <span>Less</span>
        <div className="flex gap-[2px]">
          <div className="w-[7px] h-[7px] bg-dark-gray/40" />
          <div className="w-[7px] h-[7px] bg-dark-gray/60" />
          <div className="w-[7px] h-[7px] bg-dark-gray/80" />
          <div className="w-[7px] h-[7px] bg-dark-gray" />
        </div>
        <span>More</span>
      </div>
    </div>
  )
}

export default ReadingActivityCard

