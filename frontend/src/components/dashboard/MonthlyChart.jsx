import { useEffect, useState } from 'react'

function MonthlyChart() {
  const [monthlyData, setMonthlyData] = useState([])

  useEffect(() => {
    // Generate mock data for books completed per month
    // In real app, this would come from database
    const generateMonthlyData = () => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const currentMonth = new Date().getMonth()
      
      const data = months.map((month, index) => ({
        month,
        count: index <= currentMonth ? Math.floor(Math.random() * 8) + 1 : 0
      }))
      
      setMonthlyData(data)
    }

    generateMonthlyData()
  }, [])

  const maxCount = Math.max(...monthlyData.map(m => m.count), 1)
  const totalBooks = monthlyData.reduce((sum, m) => sum + m.count, 0)

  return (
    <div className="bg-white dark:bg-dark-gray border border-dark-gray/10 dark:border-white/10 p-4">
      <h3 className="text-sm text-dark-gray dark:text-white font-medium mb-3 uppercase tracking-wider">
        Monthly Progress
      </h3>
      
      <div className="flex items-end justify-between gap-1 mb-3" style={{ height: '120px' }}>
        {monthlyData.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-1">
            <div className="relative w-full flex items-end justify-center" style={{ height: '100px' }}>
              <div
                className="w-full bg-green-600 dark:bg-green-400 rounded-t transition-all hover:opacity-80"
                style={{ 
                  height: `${(item.count / maxCount) * 100}%`,
                  minHeight: item.count > 0 ? '3px' : '0'
                }}
                title={`${item.month}: ${item.count} books`}
              />
            </div>
            <span className="text-[10px] text-dark-gray/60 dark:text-white/60 uppercase">
              {item.month}
            </span>
          </div>
        ))}
      </div>
      
      <div className="text-center">
        <p className="text-xs text-dark-gray/60 dark:text-white/60">
          Total: {totalBooks} books
        </p>
      </div>
    </div>
  )
}

export default MonthlyChart

