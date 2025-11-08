import { useEffect, useState } from 'react'

function ChallengeProgress({ target = 52 }) {
  const [completed, setCompleted] = useState(0)

  useEffect(() => {
    // Get completed books from localStorage
    const read = JSON.parse(localStorage.getItem('read') || '[]')
    setCompleted(read.length || 34) // Fallback to demo value
  }, [])

  const percentage = Math.round((completed / target) * 100)
  const remaining = target - completed

  return (
    <div className="bg-white dark:bg-dark-gray border border-dark-gray/10 dark:border-white/10 p-4">
      <h3 className="text-sm text-dark-gray dark:text-white font-medium mb-3 uppercase tracking-wider">
        Challenge
      </h3>
      
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg text-dark-gray dark:text-white font-bold">
            {completed} of {target}
          </span>
          <span className="text-sm text-dark-gray/60 dark:text-white/60">
            {percentage}%
          </span>
        </div>
        
        <div className="w-full bg-dark-gray/10 dark:bg-white/10 h-2 rounded-full overflow-hidden">
          <div
            className="bg-green-600 dark:bg-green-400 h-full transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      
      <p className="text-xs text-dark-gray/60 dark:text-white/60">
        {remaining} {remaining === 1 ? 'book' : 'books'} to go
      </p>
    </div>
  )
}

export default ChallengeProgress

