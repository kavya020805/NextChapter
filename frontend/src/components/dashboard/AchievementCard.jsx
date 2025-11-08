import { Trophy } from 'lucide-react'

function AchievementCard() {
  const achievements = [
    {
      title: 'Speed Reader',
      description: 'Completed 5 books in one month!',
      icon: Trophy,
      color: 'text-yellow-600 dark:text-yellow-400'
    }
    // Add more achievements as needed
  ]

  return (
    <div className="bg-white dark:bg-dark-gray border border-dark-gray/10 dark:border-white/10 p-4">
      <h3 className="text-sm text-dark-gray dark:text-white font-medium mb-3 uppercase tracking-wider">
        Achievements
      </h3>
      
      <div className="space-y-2">
        {achievements.map((achievement, index) => {
          const Icon = achievement.icon
          return (
            <div
              key={index}
              className="flex items-start gap-3 p-2 border border-dark-gray/10 dark:border-white/10"
            >
              <Icon className={`w-5 h-5 ${achievement.color} flex-shrink-0 mt-0.5`} />
              <div>
                <h4 className="text-sm text-dark-gray dark:text-white font-medium mb-0.5">
                  {achievement.title}
                </h4>
                <p className="text-xs text-dark-gray/60 dark:text-white/60">
                  {achievement.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AchievementCard

