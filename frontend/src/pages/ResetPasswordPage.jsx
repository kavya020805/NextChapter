import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useAuth } from '../contexts/AuthContext'
import { ArrowRight } from 'lucide-react'

function ResetPasswordPage() {
  const { updatePassword } = useAuth()
  const navigate = useNavigate()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [hasRecoveryToken, setHasRecoveryToken] = useState(false)

  // Check if there's a recovery token in the URL
  useEffect(() => {
    const hash = window.location.hash
    console.log('🔐 ResetPasswordPage - Checking for recovery token')
    console.log('   Hash:', hash ? 'Present' : 'None')
    
    if (hash && (hash.includes('type=recovery') || hash.includes('access_token'))) {
      console.log('✅ Recovery token found')
      setHasRecoveryToken(true)
    } else {
      console.log('❌ No recovery token found')
      setError('Invalid or expired password reset link. Please request a new one.')
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validate passwords
    if (!newPassword || !confirmPassword) {
      setError('Both password fields are required.')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      console.log('🔄 Attempting to update password...')
      const { error: updateError } = await updatePassword(newPassword)

      if (updateError) {
        console.error('❌ Password update error:', updateError)
        setError(updateError.message || 'Failed to update password. Please try again.')
      } else {
        console.log('✅ Password updated successfully')
        setSuccess('Password updated successfully! Redirecting to sign in...')
        // Redirect to sign in page after 2 seconds
        setTimeout(() => {
          navigate('/sign-in', { replace: true })
        }, 2000)
      }
    } catch (err) {
      console.error('❌ Unexpected error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-gray dark:bg-white">
      <Header />
      
      {/* Reset Password Section */}
      <section className="bg-dark-gray dark:bg-white py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-12 gap-8 md:gap-16">
            {/* Left Column - Heading */}
            <div className="col-span-12 md:col-span-4">
              <div className="mb-8">
                <span className="text-xs font-medium uppercase tracking-widest text-white dark:text-dark-gray border-b-2 border-white dark:border-dark-gray pb-2 inline-block">
                  Reset Password
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl text-white dark:text-dark-gray mb-8 leading-none">
                New
                <br />
                Password
              </h1>
              <p className="text-lg text-white/70 dark:text-dark-gray/70 leading-relaxed font-light">
                Enter your new password below. Make sure it's secure and at least 6 characters long.
              </p>
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

                {/* Show form only if we have a valid recovery token */}
                {hasRecoveryToken && !success ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* New Password Field */}
                    <div>
                      <label 
                        htmlFor="newPassword" 
                        className="block text-xs font-medium uppercase tracking-widest text-white dark:text-dark-gray mb-3"
                      >
                        New Password
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="w-full bg-transparent border-2 border-white dark:border-dark-gray px-6 py-4 text-white dark:text-dark-gray placeholder-white/40 dark:placeholder-dark-gray/40 focus:outline-none focus:border-white dark:focus:border-dark-gray transition-colors font-light"
                        placeholder="Enter new password"
                        minLength={6}
                      />
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                      <label 
                        htmlFor="confirmPassword" 
                        className="block text-xs font-medium uppercase tracking-widest text-white dark:text-dark-gray mb-3"
                      >
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full bg-transparent border-2 border-white dark:border-dark-gray px-6 py-4 text-white dark:text-dark-gray placeholder-white/40 dark:placeholder-dark-gray/40 focus:outline-none focus:border-white dark:focus:border-dark-gray transition-colors font-light"
                        placeholder="Confirm new password"
                        minLength={6}
                      />
                    </div>

                    {/* Update Password Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="group w-full inline-flex items-center justify-center gap-3 bg-white dark:bg-dark-gray text-dark-gray dark:text-white px-8 py-4 text-sm font-medium uppercase tracking-widest border-2 border-white dark:border-dark-gray transition-all duration-300 hover:bg-dark-gray dark:hover:bg-white hover:text-white dark:hover:text-dark-gray overflow-hidden relative disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="relative z-10 transition-colors duration-300">
                        {loading ? 'Updating...' : 'Update Password'}
                      </span>
                      {!loading && (
                        <ArrowRight 
                          className="w-4 h-4 relative z-10 transition-all duration-300 -translate-x-5 opacity-0 group-hover:translate-x-0 group-hover:opacity-100" 
                        />
                      )}
                    </button>
                  </form>
                ) : !success && (
                  /* Show link to forgot password if no recovery token */
                  <div className="text-center">
                    <p className="text-white/70 dark:text-dark-gray/70 mb-6 font-light">
                      Please request a password reset link first.
                    </p>
                    <Link 
                      to="/forgot-password" 
                      className="inline-flex items-center gap-2 text-sm text-white dark:text-dark-gray font-medium uppercase tracking-widest hover:opacity-60 transition-opacity"
                    >
                      Request Reset Link
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}

                {/* Back to Sign In Link */}
                {!loading && (
                  <div className="mt-8 text-center">
                    <Link 
                      to="/sign-in" 
                      className="text-sm text-white/70 dark:text-dark-gray/70 font-light uppercase tracking-widest hover:text-white dark:hover:text-dark-gray transition-colors inline-flex items-center gap-2"
                    >
                      Back to Sign In
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}

export default ResetPasswordPage

