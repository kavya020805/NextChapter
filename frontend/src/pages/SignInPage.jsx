import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { hasCompletedPersonalization } from '../lib/personalizationUtils'

function SignInPage() {
  const { isDark } = useTheme()
  const { user, loading: authLoading, signIn, signInWithOAuth } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    const checkAndRedirect = async () => {
      if (!authLoading && user) {
        const completed = await hasCompletedPersonalization(user.id)
        if (!completed) {
          navigate('/personalization', { replace: true })
        } else {
          navigate('/books', { replace: true })
        }
      }
    }
    
    checkAndRedirect()
  }, [user, authLoading, navigate])

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-dark-gray dark:bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-coral mb-4"></div>
          <p className="text-white dark:text-dark-gray">Loading...</p>
        </div>
      </div>
    )
  }

  // Show loading during redirect
  if (user) {
    return (
      <div className="min-h-screen bg-dark-gray dark:bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-coral mb-4"></div>
          <p className="text-white dark:text-dark-gray">Redirecting...</p>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    // Trim email
    const trimmedEmail = email.trim().toLowerCase()

    try {
      const { data, error: signInError } = await signIn(trimmedEmail, password)
      
      if (signInError) {
        setError(signInError.message || 'Failed to sign in. Please check your credentials.')
      } else {
        setSuccess('Successfully signed in! Redirecting...')
        
        // Check if user has completed personalization in database
        if (data?.user) {
          const completed = await hasCompletedPersonalization(data.user.id)
          if (!completed) {
            navigate('/personalization', { replace: true })
          } else {
            navigate('/books', { replace: true })
          }
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Sign in error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setLoading(true)
    try {
      const { error: oauthError } = await signInWithOAuth('google')
      if (oauthError) {
        setError(oauthError.message || 'Failed to sign in with Google.')
        setLoading(false)
      }
      // OAuth will redirect, so we don't need to handle success here
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
      console.error('Google sign in error:', err)
    }
  }

  const handleAppleSignIn = async () => {
    setError('')
    setLoading(true)
    try {
      const { error: oauthError } = await signInWithOAuth('apple')
      if (oauthError) {
        setError(oauthError.message || 'Failed to sign in with Apple.')
        setLoading(false)
      }
      // OAuth will redirect, so we don't need to handle success here
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
      console.error('Apple sign in error:', err)
    }
  }

  return (
    <div className="min-h-screen bg-dark-gray dark:bg-white">
      <Header />
      
      {/* Sign In Section */}
      <section className="bg-dark-gray dark:bg-white py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-12 gap-8 md:gap-16">
            {/* Left Column - Heading */}
            <div className="col-span-12 md:col-span-4">
              <div className="mb-8">
                <span className="text-xs font-medium uppercase tracking-widest text-white dark:text-dark-gray border-b-2 border-white dark:border-dark-gray pb-2 inline-block">
                  Welcome Back
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl text-white dark:text-dark-gray mb-8 leading-none">
                Sign In
              </h1>
              <p className="text-lg text-white/70 dark:text-dark-gray/70 leading-relaxed font-light mb-8">
                Access your personal library and continue your reading journey.
              </p>
              
              {/* Sign Up Link */}
              <div>
                <p className="text-sm text-white/70 dark:text-dark-gray/70 font-light mb-2">
                  Don't have an account?
                </p>
                <Link 
                  to="/sign-up" 
                  className="text-sm text-white dark:text-dark-gray font-medium uppercase tracking-widest hover:opacity-60 transition-opacity inline-flex items-center gap-2"
                >
                  Sign Up
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="col-span-12 md:col-span-8 border-t-2 border-white dark:border-dark-gray pt-8 md:pt-0 md:border-t-0 md:border-l-2 md:pl-12 flex items-center justify-center">
              <div className="max-w-md w-full">
                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 bg-red-500/10 border-2 border-red-500 text-red-500 text-sm font-light">
                    {error}
                  </div>
                )}
                
                {/* Success Message */}
                {success && (
                  <div className="mb-6 p-4 bg-green-500/10 border-2 border-green-500 text-green-500 text-sm font-light">
                    {success}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Field */}
                  <div>
                    <label 
                      htmlFor="email" 
                      className="block text-xs font-medium uppercase tracking-widest text-white dark:text-dark-gray mb-3"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      data-testid="signin-email-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-transparent border-2 border-white dark:border-dark-gray px-6 py-4 text-white dark:text-dark-gray placeholder-white/40 dark:placeholder-dark-gray/40 focus:outline-none focus:border-white dark:focus:border-dark-gray transition-colors font-light"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  {/* Password Field */}
                  <div>
                    <label 
                      htmlFor="password" 
                      className="block text-xs font-medium uppercase tracking-widest text-white dark:text-dark-gray mb-3"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        data-testid="signin-password-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full bg-transparent border-2 border-white dark:border-dark-gray px-6 py-4 pr-14 text-white dark:text-dark-gray placeholder-white/40 dark:placeholder-dark-gray/40 focus:outline-none focus:border-white dark:focus:border-dark-gray transition-colors font-light"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        data-testid="signin-password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 dark:text-dark-gray/60 hover:text-white dark:hover:text-dark-gray transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-5 h-5 border-2 border-white dark:border-dark-gray bg-transparent appearance-none checked:bg-white dark:checked:bg-dark-gray checked:border-white dark:checked:border-dark-gray relative cursor-pointer transition-all"
                        />
                        {rememberMe && (
                          <svg 
                            className="absolute top-0 left-0 w-5 h-5 pointer-events-none" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke={isDark ? '#ffffff' : '#2a2a2a'} 
                            strokeWidth="3" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </div>
                      <span className="text-sm text-white/70 dark:text-dark-gray/70 font-light uppercase tracking-widest group-hover:text-white dark:group-hover:text-dark-gray transition-colors">
                        Remember me
                      </span>
                    </label>
                    <Link 
                      to="/forgot-password" 
                      className="text-sm text-white/70 dark:text-dark-gray/70 font-light uppercase tracking-widest hover:text-white dark:hover:text-dark-gray transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {/* Sign In Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    data-testid="signin-submit-button"
                    className="group w-full inline-flex items-center justify-center gap-3 bg-white dark:bg-dark-gray text-dark-gray dark:text-white px-8 py-4 text-sm font-medium uppercase tracking-widest border-2 border-white dark:border-dark-gray transition-all duration-300 hover:bg-dark-gray dark:hover:bg-white hover:text-white dark:hover:text-dark-gray overflow-hidden relative disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="relative z-10 transition-colors duration-300">
                      {loading ? 'Signing In...' : 'Sign In'}
                    </span>
                    {!loading && (
                      <ArrowRight 
                        className="w-4 h-4 relative z-10 transition-all duration-300 -translate-x-5 opacity-0 group-hover:translate-x-0 group-hover:opacity-100" 
                      />
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-4 my-8">
                  <div className="flex-1 h-px bg-white/20 dark:bg-dark-gray/20"></div>
                  <span className="text-xs font-medium uppercase tracking-widest text-white/60 dark:text-dark-gray/60">
                    Or
                  </span>
                  <div className="flex-1 h-px bg-white/20 dark:bg-dark-gray/20"></div>
                </div>

                {/* Social Sign In Buttons */}
                <div className="space-y-4">
                  {/* Google Sign In */}
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-3 bg-transparent border-2 border-white dark:border-dark-gray text-white dark:text-dark-gray px-8 py-4 text-sm font-medium uppercase tracking-widest transition-all duration-300 hover:bg-white/10 dark:hover:bg-dark-gray/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  {/* Apple Sign In */}
                  <button
                    onClick={handleAppleSignIn}
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-3 bg-transparent border-2 border-white dark:border-dark-gray text-white dark:text-dark-gray px-8 py-4 text-sm font-medium uppercase tracking-widest transition-all duration-300 hover:bg-white/10 dark:hover:bg-dark-gray/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                    <span>Continue with Apple</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default SignInPage

