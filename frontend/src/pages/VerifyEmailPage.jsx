import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useAuth } from '../contexts/AuthContext'
import { ArrowRight } from 'lucide-react'

function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { verifyOtp, resendOtp } = useAuth()
  
  const [email, setEmail] = useState(searchParams.get('email') || '')
  const [otp, setOtp] = useState(['', '', '', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [resendSuccess, setResendSuccess] = useState('')

  useEffect(() => {
    // If no email in URL, redirect to sign up
    if (!email) {
      navigate('/sign-up', { replace: true })
    }
  }, [email, navigate])

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 7) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').trim()
    
    // Check if pasted data is 8 digits
    if (/^\d{8}$/.test(pastedData)) {
      const newOtp = pastedData.split('')
      setOtp(newOtp)
      // Focus last input
      document.getElementById('otp-7')?.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const otpCode = otp.join('')
    
    if (otpCode.length !== 8) {
      setError('Please enter the complete 8-digit code.')
      return
    }

    setLoading(true)

    try {
      console.log('🔐 Verifying OTP for:', email)
      
      const { data, error: verifyError } = await verifyOtp(email, otpCode)
      
      console.log('📬 Verification response:', { data, error: verifyError })
      
      if (verifyError) {
        console.error('❌ Verification error:', verifyError)
        setError(verifyError.message || 'Invalid or expired verification code. Please try again.')
      } else {
        console.log('✅ Email verified successfully!')
        setSuccess('Email verified successfully! Redirecting...')
        
        // Check if user needs personalization
        if (data.user) {
          const { hasCompletedPersonalization } = await import('../lib/personalizationUtils')
          const completed = await hasCompletedPersonalization(data.user.id)
          
          setTimeout(() => {
            if (!completed) {
              navigate('/personalization', { replace: true })
            } else {
              navigate('/books', { replace: true })
            }
          }, 1500)
        } else {
          // Fallback to personalization
          setTimeout(() => {
            navigate('/personalization', { replace: true })
          }, 1500)
        }
      }
    } catch (err) {
      console.error('❌ Unexpected error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setResendSuccess('')
    setResending(true)

    try {
      console.log('📧 Resending OTP to:', email)
      
      const { error: resendError } = await resendOtp(email)
      
      console.log('📬 Resend response:', { error: resendError })
      
      if (resendError) {
        console.error('❌ Resend error:', resendError)
        setError(resendError.message || 'Failed to resend code. Please try again.')
      } else {
        console.log('✅ Code resent successfully')
        setResendSuccess('Verification code resent! Please check your email.')
        // Clear OTP inputs
        setOtp(['', '', '', '', '', '', '', ''])
        document.getElementById('otp-0')?.focus()
      }
    } catch (err) {
      console.error('❌ Unexpected error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-gray dark:bg-white">
      <Header />
      
      {/* Verify Email Section */}
      <section className="bg-dark-gray dark:bg-white py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-12 gap-8 md:gap-16">
            {/* Left Column - Heading */}
            <div className="col-span-12 md:col-span-4">
              <div className="mb-8">
                <span className="text-xs font-medium uppercase tracking-widest text-white dark:text-dark-gray border-b-2 border-white dark:border-dark-gray pb-2 inline-block">
                  Email Verification
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl text-white dark:text-dark-gray mb-8 leading-none">
                Verify
                <br />
                Your Email
              </h1>

              <p className="text-sm text-white/60 dark:text-dark-gray/60 font-light mb-8">
                Please check your inbox and enter the 8-digit code below to verify your email address.
              </p>

              {/* Back to Sign Up Link */}
              <button
                onClick={() => navigate('/sign-up')}
                className="text-sm text-white/60 dark:text-dark-gray/60 font-light uppercase tracking-widest hover:text-white dark:hover:text-dark-gray transition-colors inline-flex items-center gap-2"
              >
                Back to Sign Up
                <ArrowRight className="w-4 h-4" />
              </button>
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

                {/* Resend Success Message */}
                {resendSuccess && (
                  <div className="mb-6 p-4 bg-blue-500/10 border-2 border-blue-500 text-blue-500 text-sm font-light">
                    {resendSuccess}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* OTP Input */}
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-widest text-white dark:text-dark-gray mb-4 text-center">
                      Enter Verification Code
                    </label>
                    <div className="flex gap-3 justify-center" onPaste={handlePaste}>
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          className="w-12 h-14 bg-transparent border-2 border-white dark:border-dark-gray text-center text-2xl text-white dark:text-dark-gray focus:outline-none focus:border-white dark:focus:border-dark-gray transition-colors font-medium"
                          autoFocus={index === 0}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Verify Button */}
                  <button
                    type="submit"
                    disabled={loading || otp.join('').length !== 8}
                    className="group w-full inline-flex items-center justify-center gap-3 bg-white dark:bg-dark-gray text-dark-gray dark:text-white px-8 py-4 text-sm font-medium uppercase tracking-widest border-2 border-white dark:border-dark-gray transition-all duration-300 hover:bg-dark-gray dark:hover:bg-white hover:text-white dark:hover:text-dark-gray overflow-hidden relative disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="relative z-10 transition-colors duration-300">
                      {loading ? 'Verifying...' : 'Verify Email'}
                    </span>
                    {!loading && (
                      <ArrowRight 
                        className="w-4 h-4 relative z-10 transition-all duration-300 -translate-x-5 opacity-0 group-hover:translate-x-0 group-hover:opacity-100" 
                      />
                    )}
                  </button>
                </form>

                {/* Resend Code */}
                <div className="mt-8 text-center">
                  <p className="text-sm text-white/70 dark:text-dark-gray/70 font-light mb-3">
                    Didn't receive the code?
                  </p>
                  <button
                    onClick={handleResend}
                    disabled={resending}
                    className="text-sm text-white dark:text-dark-gray font-medium uppercase tracking-widest hover:opacity-60 transition-opacity disabled:opacity-50"
                  >
                    {resending ? 'Resending...' : 'Resend Code'}
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

export default VerifyEmailPage
