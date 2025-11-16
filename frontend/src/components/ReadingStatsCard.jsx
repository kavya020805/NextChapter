import { Zap, Flame, Clock, Calendar } from 'lucide-react'

function ReadingStatsCard({ readingStats = null }) {
  // Use provided stats or default values
  const statsData = readingStats || {
    readingSpeed: 0,
    currentStreak: 0,
    longestStreak: 0,
    averageSession: 0,
    thisMonthBooks: 0,
    thisMonthPages: 0
  }

  const stats = [
    {
      title: 'Reading Speed',
      value: statsData.readingSpeed?.toString() || '0',
      unit: 'pages/day',
      icon: Zap,
      tag: statsData.readingSpeed > 0 ? 'This week' : 'No data yet',
      iconColor: 'text-yellow-400/80 dark:text-yellow-500/70'
    },
    {
      title: 'Current Streak',
      value: statsData.currentStreak?.toString() || '0',
      unit: 'days',
      icon: Flame,
      tag: `Longest: ${statsData.longestStreak || 0} days`,
      iconColor: 'text-orange-400/80 dark:text-orange-500/70'
    },
    {
      title: 'Average Session',
      value: statsData.averageSession?.toString() || '0',
      unit: 'minutes',
      icon: Clock,
      tag: statsData.averageSession > 0 ? 'This year' : 'No sessions yet',
      iconColor: 'text-blue-400/80 dark:text-blue-500/70'
    },
    {
      title: 'This Month',
      value: statsData.thisMonthBooks?.toString() || '0',
      unit: 'books',
      icon: Calendar,
      tag: `${(statsData.thisMonthPages || 0).toLocaleString()} pages`,
      iconColor: 'text-green-400/80 dark:text-green-500/70'
    }
  ]

  return (
    <div className="mt-4 mb-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon
          return (
            <div
              key={index}
              className="bg-dark-gray dark:bg-white border-2 border-white/30 dark:border-dark-gray/30 p-4 flex flex-col"
            >
              {/* Title and Icon */}
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs text-white/60 dark:text-dark-gray/60 uppercase tracking-wider font-medium">
                  {stat.title}
                </h4>
                <IconComponent className={`w-4 h-4 ${stat.iconColor} shrink-0`} />
              </div>

              {/* Value and Unit */}
              <div className="mb-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-semibold text-white dark:text-dark-gray leading-none">
                    {stat.value}
                  </span>
                  <span className="text-xs text-white/50 dark:text-dark-gray/50 font-light">
                    {stat.unit}
                  </span>
                </div>
              </div>

              {/* Tag */}
              <div className="flex justify-center mt-2">
                <span className="px-2.5 py-1 bg-white/5 dark:bg-dark-gray/5 text-white dark:text-dark-gray text-xs rounded text-center">
                  {stat.tag}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ReadingStatsCard
