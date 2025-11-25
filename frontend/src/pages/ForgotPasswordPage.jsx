import { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useAuth } from '../contexts/AuthContext'
import { ArrowRight } from 'lucide-react'

function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    // Trim email
    const trimmedEmail = email.trim().toLowerCase()
    
    if (!trimmedEmail) {
      setError('Email is required.')
      return
    }
    
    setLoading(true)

    try {
      const { data, error: resetError } = await resetPassword(trimmedEmail)
      
      if (resetError) {
        setError(resetError.message || 'Failed to send password reset email. Please try again.')
      } else {
        setSuccess('Password reset email sent! Please check your inbox and follow the instructions to reset your password.')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Password reset error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-gray dark:bg-white">
      <Header />
      
      {/* Forgot Password Section */}
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
                Forgot
                <br />
                Password?
              </h1>
              <p className="text-lg text-white/70 dark:text-dark-gray/70 leading-relaxed font-light">
                Enter your email address and we'll send you a link to reset your password.
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-transparent border-2 border-white dark:border-dark-gray px-6 py-4 text-white dark:text-dark-gray placeholder-white/40 dark:placeholder-dark-gray/40 focus:outline-none focus:border-white dark:focus:border-dark-gray transition-colors font-light"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  {/* Reset Password Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="group w-full inline-flex items-center justify-center gap-3 bg-white dark:bg-dark-gray text-dark-gray dark:text-white px-8 py-4 text-sm font-medium uppercase tracking-widest border-2 border-white dark:border-dark-gray transition-all duration-300 hover:bg-dark-gray dark:hover:bg-white hover:text-white dark:hover:text-dark-gray overflow-hidden relative disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="relative z-10 transition-colors duration-300">
                      {loading ? 'Sending...' : 'Reset Password'}
                    </span>
                    {!loading && (
                      <ArrowRight 
                        className="w-4 h-4 relative z-10 transition-all duration-300 -translate-x-5 opacity-0 group-hover:translate-x-0 group-hover:opacity-100" 
                      />
                    )}
                  </button>
                </form>

                {/* Back to Sign In Link */}
                <div className="mt-8 text-center">
                  <Link 
                    to="/sign-in" 
                    className="text-sm text-white/70 dark:text-dark-gray/70 font-light uppercase tracking-widest hover:text-white dark:hover:text-dark-gray transition-colors inline-flex items-center gap-2"
                  >
                    Back to Sign In
                    <ArrowRight className="w-4 h-4" />
                  </Link>
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

export default ForgotPasswordPage

