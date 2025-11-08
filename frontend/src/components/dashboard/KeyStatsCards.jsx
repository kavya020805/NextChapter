import { Flame, Clock, TrendingUp, Calendar } from 'lucide-react'

function KeyStatsCards() {
  const stats = [
    {
      icon: TrendingUp,
      label: 'Reading Speed',
      value: '28 pages/hour',
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      icon: Flame,
      label: 'Current Streak',
      value: '15 days',
      tooltip: 'Longest streak: 29 days',
      color: 'text-orange-600 dark:text-orange-400'
    },
    {
      icon: Clock,
      label: 'Average Session',
      value: '45 minutes',
      subtitle: 'Evening Reader',
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      icon: Calendar,
      label: 'This Month',
      value: '4 books',
      subtitle: '1,100 pages',
      color: 'text-green-600 dark:text-green-400'
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div
            key={index}
            className="bg-white dark:bg-dark-gray border border-dark-gray/10 dark:border-white/10 p-3"
            title={stat.tooltip}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-4 h-4 ${stat.color}`} />
              <p className="text-[10px] font-medium uppercase tracking-wider text-dark-gray/60 dark:text-white/60">
                {stat.label}
              </p>
            </div>
            <p className="text-lg text-dark-gray dark:text-white font-bold mb-0.5">
              {stat.value}
            </p>
            {stat.subtitle && (
              <p className="text-xs text-dark-gray/60 dark:text-white/60">
                {stat.subtitle}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default KeyStatsCards

