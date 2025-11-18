import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { hasCompletedPersonalization, isAdmin } from '../lib/personalizationUtils'
import { reportLoginActivity } from '../lib/loginActivity'

function OAuthCallbackPage() {
  const navigate = useNavigate()
  const [error, setError] = useState(null)

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        console.log('🔄 OAuth Callback Page: Processing authentication...')
        console.log('📍 Current URL:', window.location.href)
        console.log('🔗 Hash present:', window.location.hash ? 'YES' : 'NO')

        // Get the session from the URL hash
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('❌ Session error:', sessionError)
          setError(sessionError.message)
          setTimeout(() => navigate('/sign-in'), 3000)
          return
        }

        if (!session) {
          console.log('⚠️ No session found, redirecting to sign-in')
          navigate('/sign-in', { replace: true })
          return
        }

        console.log('✅ Session found:', session.user.email)

        // Report login activity
        await reportLoginActivity(session)

        // Check if user is admin
        const admin = await isAdmin(session.user.id)
        
        if (admin) {
          console.log('🚀 Admin user, redirecting to /admin')
          navigate('/admin', { replace: true })
          return
        }

        // Check if user has completed personalization
        const completed = await hasCompletedPersonalization(session.user.id)
        
        if (!completed) {
          console.log('🚀 New user, redirecting to /personalization')
          navigate('/personalization', { replace: true })
        } else {
          console.log('🚀 Existing user, redirecting to /books')
          navigate('/books', { replace: true })
        }

      } catch (err) {
        console.error('❌ OAuth callback error:', err)
        setError(err.message || 'Authentication failed')
        setTimeout(() => navigate('/sign-in'), 3000)
      }
    }

    handleOAuthCallback()
  }, [navigate])

  if (error) {
    return (
      <div className="min-h-screen bg-dark-gray dark:bg-white flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md px-6">
          {/* Error Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-white dark:text-dark-gray text-xl font-semibold">
              Authentication Failed
            </h2>
            <p className="text-white/70 dark:text-dark-gray/70 text-sm">
              {error}
            </p>
            <p className="text-white/50 dark:text-dark-gray/50 text-xs">
              Redirecting to sign in...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-gray dark:bg-white flex items-center justify-center">
      <div className="text-center space-y-4">
        {/* Spinner */}
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-coral/20 border-t-coral"></div>
        
        {/* Loading Text */}
        <div className="space-y-2">
          <p className="text-white dark:text-dark-gray text-lg font-medium">
            Completing sign in...
          </p>
          <p className="text-white/60 dark:text-dark-gray/60 text-sm">
            Please wait while we set up your account
          </p>
        </div>
        
        {/* Animated dots */}
        <div className="flex justify-center gap-2">
          <div className="w-2 h-2 bg-coral rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-coral rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-coral rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  )
}

export default OAuthCallbackPage
