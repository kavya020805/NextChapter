import { Zap, Flame, Clock, Calendar } from 'lucide-react'

function ReadingStatsCard() {
  const stats = [
    {
      title: 'Reading Speed',
      value: '28',
      unit: 'pages/hour',
      icon: Zap,
      tag: '+5% vs last month',
      iconColor: 'text-yellow-400/80 dark:text-yellow-500/70'
    },
    {
      title: 'Current Streak',
      value: '15',
      unit: 'days',
      icon: Flame,
      tag: 'Longest: 28 days',
      iconColor: 'text-orange-400/80 dark:text-orange-500/70'
    },
    {
      title: 'Average Session',
      value: '45',
      unit: 'minutes',
      icon: Clock,
      tag: 'Evening Reader',
      iconColor: 'text-blue-400/80 dark:text-blue-500/70'
    },
    {
      title: 'This Month',
      value: '4',
      unit: 'books',
      icon: Calendar,
      tag: '1,100 pages',
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
                <IconComponent className={`w-4 h-4 ${stat.iconColor} flex-shrink:0`} />
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
