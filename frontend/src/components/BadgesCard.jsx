import { useState, useEffect } from 'react'
import { Award, BookOpen, Flame, Globe, Bookmark, Star } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

// Custom badge icons matching the theme
const BadgeIcon = ({ type, earned }) => {
  const iconClass = `w-8 h-8 ${earned ? 'text-white dark:text-dark-gray' : 'text-white/30 dark:text-dark-gray/30'}`
  
  switch(type) {
    case 'First Chapter':
      return <BookOpen className={iconClass} strokeWidth={1.5} />
    case 'Page Turner':
      return <Bookmark className={iconClass} strokeWidth={1.5} />
    case 'Bookworm':
      return <Star className={iconClass} strokeWidth={1.5} />
    case 'Genre Explorer':
      return <Globe className={iconClass} strokeWidth={1.5} />
    case 'Marathon Reader':
      return <Flame className={iconClass} strokeWidth={1.5} />
    default:
      return <Award className={iconClass} strokeWidth={1.5} />
  }
}

function BadgesCard({ userId, readingStats = null, genreDistribution = null }) {
  const [badges, setBadges] = useState([])
  const [userBadges, setUserBadges] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalContent, setModalContent] = useState({ type: '', message: '', stats: null })

  useEffect(() => {
    if (userId) {
      loadBadges()
    }
  }, [userId])

  const loadBadges = async () => {
    try {
      setLoading(true)

      // Fetch all badges
      const { data: allBadges, error: badgesError } = await supabase
        .from('badges')
        .select('*')
        .order('requirement_value', { ascending: true })

      if (badgesError) {
        console.error('Badges table error:', badgesError)
        console.error('Error code:', badgesError.code)
        console.error('Error message:', badgesError.message)
        
        // If table exists but API can't access it, use fallback badges
        if (badgesError.code === 'PGRST116' || badgesError.code === '42P01') {
          console.warn('Using fallback badges - table not accessible via API')
          const fallbackBadges = [
            { id: '1', name: 'First Chapter', description: 'Read your first book', icon: 'BookOpen', requirement_type: 'books_read', requirement_value: 1 },
            { id: '2', name: 'Page Turner', description: 'Read 500 pages', icon: 'Bookmark', requirement_type: 'pages_read', requirement_value: 500 },
            { id: '3', name: 'Bookworm', description: 'Read 10 books', icon: 'Star', requirement_type: 'books_read', requirement_value: 10 },
            { id: '4', name: 'Genre Explorer', description: 'Read books from 5 different genres', icon: 'Globe', requirement_type: 'genres_explored', requirement_value: 5 },
            { id: '5', name: 'Marathon Reader', description: 'Maintain a 7-day reading streak', icon: 'Flame', requirement_type: 'reading_streak', requirement_value: 7 }
          ]
          setBadges(fallbackBadges)
          setUserBadges([])
          setLoading(false)
          return
        }
        
        setBadges([])
        setUserBadges([])
        setLoading(false)
        return
      }

      // Fetch user's earned badges
      const { data: earnedBadges, error: userBadgesError } = await supabase
        .from('user_badges')
        .select('badge_id, earned_at')
        .eq('user_id', userId)

      if (userBadgesError) {
        console.warn('User badges error:', userBadgesError)
        setUserBadges([])
      } else {
        setUserBadges(earnedBadges || [])
      }

      setBadges(allBadges || [])
    } catch (error) {
      console.error('Error loading badges:', error)
      setBadges([])
      setUserBadges([])
    } finally {
      setLoading(false)
    }
  }

  const checkBadges = async () => {
    try {
      // Try using the RPC function first
      const { data, error } = await supabase.rpc('check_and_award_badges', {
        p_user_id: userId
      })

      if (error) {
        console.warn('RPC function not accessible, using manual check:', error)
        // Fallback: Manual badge checking
        await checkBadgesManually()
        return
      }

      // Reload badges to show newly earned ones
      await loadBadges()

      if (data && data.length > 0) {
        setModalContent({
          type: 'success',
          message: `You earned ${data.length} new badge(s)!`,
          stats: null
        })
        setShowModal(true)
      } else {
        setModalContent({
          type: 'info',
          message: 'No new badges earned yet. Keep reading!',
          stats: null
        })
        setShowModal(true)
      }
    } catch (error) {
      console.error('Error checking badges:', error)
      await checkBadgesManually()
    }
  }

  const checkBadgesManually = async () => {
    try {
      // Use the same logic as reading challenge - count books with status 'read'
      const { data: booksReadData } = await supabase
        .from('user_books')
        .select('book_id, status, completed_at')
        .eq('user_id', userId)
        .eq('status', 'read')

      const booksRead = booksReadData?.length || 0

      // Use genre distribution from Genre Preferences (already calculated)
      const genresExplored = genreDistribution ? Object.keys(genreDistribution).length : 0

      const { data: sessionsData } = await supabase
        .from('reading_sessions')
        .select('pages_read')
        .eq('user_id', userId)

      const pagesRead = sessionsData?.reduce((sum, session) => sum + (session.pages_read || 0), 0) || 0

      // Get reading streak from readingStats (from Reading Activity)
      const currentStreak = readingStats?.currentStreak || 0

      // Check which badges should be earned
      const newBadges = []
      
      for (const badge of badges) {
        // Skip if already earned
        if (hasBadge(badge.id)) continue

        let shouldEarn = false
        
        if (badge.requirement_type === 'books_read' && booksRead >= badge.requirement_value) {
          shouldEarn = true
        } else if (badge.requirement_type === 'pages_read' && pagesRead >= badge.requirement_value) {
          shouldEarn = true
        } else if (badge.requirement_type === 'reading_streak' && currentStreak >= badge.requirement_value) {
          shouldEarn = true
        } else if (badge.requirement_type === 'genres_explored' && genresExplored >= badge.requirement_value) {
          shouldEarn = true
        }

        if (shouldEarn) {
          // Try to award the badge
          const { error: insertError } = await supabase
            .from('user_badges')
            .insert({
              user_id: userId,
              badge_id: badge.id
            })

          if (!insertError) {
            newBadges.push(badge.name)
          }
        }
      }

      // Reload badges
      await loadBadges()

      if (newBadges.length > 0) {
        setModalContent({
          type: 'success',
          message: `You earned ${newBadges.length} new badge(s)!`,
          badges: newBadges,
          stats: { booksRead, pagesRead, currentStreak, genresExplored }
        })
        setShowModal(true)
      } else {
        setModalContent({
          type: 'progress',
          message: 'Keep reading!',
          stats: { booksRead, pagesRead, currentStreak, genresExplored }
        })
        setShowModal(true)
      }
    } catch (error) {
      console.error('Error in manual badge check:', error)
      setModalContent({
        type: 'error',
        message: 'Could not check badges. Please try again later.',
        stats: null
      })
      setShowModal(true)
    }
  }

  const hasBadge = (badgeId) => {
    return userBadges.some(ub => ub.badge_id === badgeId)
  }

  if (loading) {
    return (
      <div className="bg-dark-gray dark:bg-white border-2 border-white/30 dark:border-dark-gray/30 p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Award className="w-5 h-5 text-white dark:text-dark-gray" />
          <h3 className="text-sm font-medium uppercase tracking-wider text-white dark:text-dark-gray">
            Badges
          </h3>
        </div>
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-white dark:border-dark-gray"></div>
        </div>
      </div>
    )
  }

  // Show setup message if badges system not set up
  if (badges.length === 0) {
    return (
      <div className="bg-dark-gray dark:bg-white border-2 border-white/30 dark:border-dark-gray/30 p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Award className="w-5 h-5 text-white dark:text-dark-gray" />
          <h3 className="text-sm font-medium uppercase tracking-wider text-white dark:text-dark-gray">
            Badges
          </h3>
        </div>
        <div className="text-center py-6">
          <p className="text-sm text-white/60 dark:text-dark-gray/60 mb-2">
            Badges system not set up yet
          </p>
          <p className="text-xs text-white/40 dark:text-dark-gray/40">
            Run badges_setup.sql in Supabase SQL Editor
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-dark-gray dark:bg-white border-2 border-white/30 dark:border-dark-gray/30 p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-white dark:text-dark-gray" />
          <h3 className="text-sm font-medium uppercase tracking-wider text-white dark:text-dark-gray">
            Badges ({userBadges.length}/{badges.length})
          </h3>
        </div>
        <button
          onClick={checkBadges}
          className="px-2 py-1 text-xs text-white/70 dark:text-dark-gray/70 hover:text-white dark:hover:text-dark-gray border border-white/40 dark:border-dark-gray/40 hover:border-white/60 dark:hover:border-dark-gray/60 rounded transition-all"
        >
          Check Progress
        </button>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {badges.map((badge) => {
          const earned = hasBadge(badge.id)
          return (
            <div
              key={badge.id}
              className="relative group"
            >
              {/* Badge Container */}
              <div
                className={`flex flex-col items-center justify-center p-4 transition-all duration-300 ${
                  earned
                    ? 'bg-white/5 dark:bg-dark-gray/5 border-2 border-white/60 dark:border-dark-gray/60'
                    : 'bg-transparent border-2 border-white/20 dark:border-dark-gray/20'
                }`}
              >
                {/* Icon */}
                <div className="mb-2">
                  <BadgeIcon type={badge.name} earned={earned} />
                </div>
                
                {/* Badge Name */}
                <div className={`text-[10px] text-center font-medium uppercase tracking-wider leading-tight ${
                  earned 
                    ? 'text-white dark:text-dark-gray' 
                    : 'text-white/40 dark:text-dark-gray/40'
                }`}>
                  {badge.name}
                </div>
                
                {/* Earned indicator */}
                {earned && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-white dark:bg-dark-gray rounded-full border-2 border-dark-gray dark:border-white"></div>
                )}
              </div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-dark-gray dark:bg-white border-2 border-white/40 dark:border-dark-gray/40 text-xs text-white dark:text-dark-gray whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                <div className="font-medium mb-0.5">{badge.name}</div>
                <div className="text-white/70 dark:text-dark-gray/70 text-[10px]">{badge.description}</div>
              </div>
            </div>
          )
        })}
      </div>

      {userBadges.length === 0 && (
        <p className="text-xs text-white/60 dark:text-dark-gray/60 text-center mt-3">
          Start reading to earn badges!
        </p>
      )}

      {/* Custom Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-gray/80 dark:bg-white/80 backdrop-blur-sm">
          <div className="bg-dark-gray dark:bg-white border-2 border-white/40 dark:border-dark-gray/40 max-w-md w-full p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium uppercase tracking-wider text-white dark:text-dark-gray">
                {modalContent.type === 'success' ? 'Congratulations!' : 
                 modalContent.type === 'progress' ? 'Your Progress' : 
                 modalContent.type === 'error' ? 'Error' : 'Info'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-white/60 dark:text-dark-gray/60 hover:text-white dark:hover:text-dark-gray transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="mb-6">
              <p className="text-white dark:text-dark-gray mb-4">
                {modalContent.message}
              </p>

              {modalContent.badges && modalContent.badges.length > 0 && (
                <div className="mb-4 p-3 bg-white/5 dark:bg-dark-gray/5 border border-white/20 dark:border-dark-gray/20">
                  <p className="text-xs uppercase tracking-wider text-white/60 dark:text-dark-gray/60 mb-2">
                    New Badges
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {modalContent.badges.map((badgeName, idx) => (
                      <span key={idx} className="px-2 py-1 bg-white/10 dark:bg-dark-gray/10 text-white dark:text-dark-gray text-xs border border-white/30 dark:border-dark-gray/30">
                        {badgeName}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {modalContent.stats && (
                <div className="space-y-2 p-3 bg-white/5 dark:bg-dark-gray/5 border border-white/20 dark:border-dark-gray/20">
                  <p className="text-xs uppercase tracking-wider text-white/60 dark:text-dark-gray/60 mb-2">
                    Reading Stats
                  </p>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70 dark:text-dark-gray/70">Books Completed</span>
                    <span className="text-white dark:text-dark-gray font-medium">{modalContent.stats.booksRead}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70 dark:text-dark-gray/70">Pages Read</span>
                    <span className="text-white dark:text-dark-gray font-medium">{modalContent.stats.pagesRead}</span>
                  </div>
                  {modalContent.stats.currentStreak !== undefined && (
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70 dark:text-dark-gray/70">Current Streak</span>
                      <span className="text-white dark:text-dark-gray font-medium">{modalContent.stats.currentStreak} days</span>
                    </div>
                  )}
                  {modalContent.stats.genresExplored !== undefined && (
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70 dark:text-dark-gray/70">Genres Explored</span>
                      <span className="text-white dark:text-dark-gray font-medium">{modalContent.stats.genresExplored}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="w-full px-4 py-2 bg-white dark:bg-dark-gray text-dark-gray dark:text-white border-2 border-white dark:border-dark-gray hover:bg-white/90 dark:hover:bg-dark-gray/90 transition-all text-xs font-medium uppercase tracking-wider"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default BadgesCard
