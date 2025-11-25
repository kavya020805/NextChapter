import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Mail, MessageSquare, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { sanitizeObject } from '../lib/sanitize'
import logger from '../lib/logger'

function ContactPage() {
  // Meta tags for Razorpay validation
  document.title = 'Contact Us - NextChapter';
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    // Rate limiting: Prevent spam submissions
    const RATE_LIMIT_KEY = 'contact_form_last_submit'
    const RATE_LIMIT_MINUTES = 5
    
    const lastSubmit = localStorage.getItem(RATE_LIMIT_KEY)
    if (lastSubmit) {
      const minutesSince = (Date.now() - parseInt(lastSubmit)) / 1000 / 60
      if (minutesSince < RATE_LIMIT_MINUTES) {
        const waitTime = Math.ceil(RATE_LIMIT_MINUTES - minutesSince)
        setError(`Please wait ${waitTime} minute${waitTime > 1 ? 's' : ''} before submitting again.`)
        setSubmitting(false)
        return
      }
    }

    // Sanitize all inputs
    const sanitizedData = sanitizeObject(formData)

    try {
      // Insert into contact_submissions table
      const { data, error: submitError } = await supabase
        .from('contact_submissions')
        .insert([
          {
            ...sanitizedData,
            status: 'new'
          }
        ])
        .select()

      if (submitError) {
        logger.error('Error submitting contact form:', submitError)
        throw submitError
      }

      logger.log('Contact form submitted successfully:', data)
      setSubmitted(true)
      
      // Set rate limit timestamp
      localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString())
      
      // Reset form after 3 seconds
      const timer = setTimeout(() => {
        setSubmitted(false)
        setFormData({ name: '', email: '', subject: '', message: '' })
      }, 3000)
      
      return () => clearTimeout(timer)
    } catch (err) {
      logger.error('Error:', err)
      setError(err.message || 'Failed to submit form. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup any pending timers
    }
  }, [])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-dark-gray dark:bg-white">
      <Header />
      
      <section className="bg-dark-gray dark:bg-white py-16 sm:py-20 md:py-24 lg:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12 sm:mb-16">
            <div className="mb-4">
              <span className="text-xs font-medium uppercase tracking-widest text-white dark:text-dark-gray border-b-2 border-white dark:border-dark-gray pb-2 inline-block">
                Support
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white dark:text-dark-gray mb-4 leading-none">
              Contact Us
            </h1>
            <p className="text-base sm:text-lg text-white/70 dark:text-dark-gray/70 leading-relaxed font-light max-w-2xl">
              Have questions? We're here to help. Reach out to our team and we'll get back to you as soon as possible.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl text-white dark:text-dark-gray mb-6 uppercase tracking-wider">
                Send us a Message
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-xs uppercase tracking-widest text-white/60 dark:text-dark-gray/60 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-transparent border-b-2 border-white/30 dark:border-dark-gray/30 text-white dark:text-dark-gray px-0 py-2 focus:outline-none focus:border-white dark:focus:border-dark-gray transition-colors"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs uppercase tracking-widest text-white/60 dark:text-dark-gray/60 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-transparent border-b-2 border-white/30 dark:border-dark-gray/30 text-white dark:text-dark-gray px-0 py-2 focus:outline-none focus:border-white dark:focus:border-dark-gray transition-colors"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-xs uppercase tracking-widest text-white/60 dark:text-dark-gray/60 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full bg-transparent border-b-2 border-white/30 dark:border-dark-gray/30 text-white dark:text-dark-gray px-0 py-2 focus:outline-none focus:border-white dark:focus:border-dark-gray transition-colors"
                    placeholder="How can we help?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs uppercase tracking-widest text-white/60 dark:text-dark-gray/60 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    className="w-full bg-transparent border-2 border-white/30 dark:border-dark-gray/30 text-white dark:text-dark-gray px-4 py-3 focus:outline-none focus:border-white dark:focus:border-dark-gray transition-colors resize-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                {/* Success/Error Messages */}
                {submitted && (
                  <div className="flex items-center gap-3 p-4 bg-green-500/10 border-2 border-green-500/30">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <p className="text-sm text-green-500 uppercase tracking-wider">
                      Message sent successfully! We'll get back to you soon.
                    </p>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-3 p-4 bg-red-500/10 border-2 border-red-500/30">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="text-sm text-red-500 uppercase tracking-wider">
                      {error}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitted || submitting}
                  className="w-full bg-white dark:bg-dark-gray text-dark-gray dark:text-white px-8 py-4 text-sm font-medium uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {submitting ? 'Sending...' : submitted ? 'Message Sent!' : 'Send Message'}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl text-white dark:text-dark-gray mb-6 uppercase tracking-wider">
                  Get in Touch
                </h2>
                
                <div className="space-y-6">
                  {/* Email */}
                  <div className="border-l-2 border-white dark:border-dark-gray pl-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Mail className="w-5 h-5 text-white dark:text-dark-gray" />
                      <h3 className="text-lg text-white dark:text-dark-gray font-medium">Email</h3>
                    </div>
                    <p className="text-sm text-white/70 dark:text-dark-gray/70 mb-2">
                      For general inquiries:
                    </p>
                    <a 
                      href="mailto:202301124@dau.ac.in" 
                      className="text-sm text-white dark:text-dark-gray underline hover:opacity-60 transition-opacity"
                    >
                      202301124@dau.ac.in
                    </a>
                  </div>

                  {/* Response Time */}
                  <div className="border-l-2 border-white dark:border-dark-gray pl-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="w-5 h-5 text-white dark:text-dark-gray" />
                      <h3 className="text-lg text-white dark:text-dark-gray font-medium">Response Time</h3>
                    </div>
                    <p className="text-sm text-white/70 dark:text-dark-gray/70">
                      We typically respond within 24-48 hours during business days.
                    </p>
                  </div>
                </div>
              </div>

              {/* FAQ Link */}
              <div className="border-t-2 border-white/30 dark:border-dark-gray/30 pt-8">
                <h3 className="text-xl text-white dark:text-dark-gray mb-4 uppercase tracking-wider">
                  Quick Help
                </h3>
                <p className="text-sm text-white/70 dark:text-dark-gray/70 mb-4">
                  Looking for immediate answers? Check out our common topics:
                </p>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link to="/terms" className="text-white dark:text-dark-gray underline hover:opacity-60 transition-opacity">
                      Terms and Conditions
                    </Link>
                  </li>
                  <li>
                    <Link to="/privacy" className="text-white dark:text-dark-gray underline hover:opacity-60 transition-opacity">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link to="/refunds" className="text-white dark:text-dark-gray underline hover:opacity-60 transition-opacity">
                      Cancellation & Refunds
                    </Link>
                  </li>
                  <li>
                    <Link to="/subscription" className="text-white dark:text-dark-gray underline hover:opacity-60 transition-opacity">
                      Subscription Plans
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Business Hours */}
              <div className="border-t-2 border-white/30 dark:border-dark-gray/30 pt-8">
                <h3 className="text-xl text-white dark:text-dark-gray mb-4 uppercase tracking-wider">
                  Business Hours
                </h3>
                <div className="space-y-2 text-sm text-white/70 dark:text-dark-gray/70">
                  <p>Monday - Friday: 9:00 AM - 6:00 PM IST</p>
                  <p>Saturday: 10:00 AM - 4:00 PM IST</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Back Link */}
          <div className="mt-12 pt-8 border-t-2 border-white/30 dark:border-dark-gray/30">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-sm uppercase tracking-widest text-white dark:text-dark-gray hover:opacity-60 transition-opacity"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </section>
          <Footer />
    </div>
  )
}

export default ContactPage
