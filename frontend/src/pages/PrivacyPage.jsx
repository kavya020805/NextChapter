import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

function PrivacyPage() {
  return (
    <>
      {/* Meta tags for Razorpay validation */}
      <title>Privacy Policy - NextChapter</title>
      <meta name="description" content="NextChapter Privacy Policy - Learn how we collect, use, and protect your personal information." />
      
      <div className="min-h-screen bg-dark-gray dark:bg-white">
        <Header />
      
      <section className="bg-dark-gray dark:bg-white py-16 sm:py-20 md:py-24 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12 sm:mb-16">
            <div className="mb-4">
              <span className="text-xs font-medium uppercase tracking-widest text-white dark:text-dark-gray border-b-2 border-white dark:border-dark-gray pb-2 inline-block">
                Legal
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white dark:text-dark-gray mb-4 leading-none">
              Privacy Policy
            </h1>
            <p className="text-sm text-white/60 dark:text-dark-gray/60 uppercase tracking-widest">
              Last Updated: December 2024
            </p>
          </div>

          {/* Content */}
          <div className="space-y-8 text-white/80 dark:text-dark-gray/80">
            {/* Introduction */}
            <div className="border-l-2 border-white dark:border-dark-gray pl-6">
              <p className="text-base leading-relaxed">
                NextChapter ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our digital reading platform.
              </p>
            </div>

            {/* Section 1 */}
            <div>
              <h2 className="text-2xl text-white dark:text-dark-gray mb-4 uppercase tracking-wider">
                1. Information We Collect
              </h2>
              <div className="space-y-4 pl-6 border-l-2 border-white/30 dark:border-dark-gray/30">
                <div>
                  <h3 className="text-lg text-white dark:text-dark-gray mb-2 font-medium">Personal Information</h3>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li>Email address and username</li>
                    <li>Profile information (optional: photo, bio, date of birth)</li>
                    <li>Payment information (processed securely by Razorpay)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg text-white dark:text-dark-gray mb-2 font-medium">Usage Data</h3>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li>Reading history and progress</li>
                    <li>Bookmarks, highlights, and notes</li>
                    <li>Search queries and preferences</li>
                    <li>Device information and IP address</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div>
              <h2 className="text-2xl text-white dark:text-dark-gray mb-4 uppercase tracking-wider">
                2. How We Use Your Information
              </h2>
              <div className="pl-6 border-l-2 border-white/30 dark:border-dark-gray/30">
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Provide and maintain our reading platform</li>
                  <li>Personalize your reading experience with AI recommendations</li>
                  <li>Process subscription payments and manage your account</li>
                  <li>Send important updates about our service</li>
                  <li>Improve our platform through analytics</li>
                  <li>Detect and prevent fraud or abuse</li>
                </ul>
              </div>
            </div>

            {/* Section 3 */}
            <div>
              <h2 className="text-2xl text-white dark:text-dark-gray mb-4 uppercase tracking-wider">
                3. Data Sharing and Disclosure
              </h2>
              <div className="pl-6 border-l-2 border-white/30 dark:border-dark-gray/30 space-y-4">
                <p className="text-sm">We do not sell your personal information. We may share data with:</p>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li><strong>Service Providers:</strong> Supabase (database), Razorpay (payments), AI APIs (Google Gemini)</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                  <li><strong>Business Transfers:</strong> In case of merger or acquisition</li>
                </ul>
              </div>
            </div>

            {/* Section 4 */}
            <div>
              <h2 className="text-2xl text-white dark:text-dark-gray mb-4 uppercase tracking-wider">
                4. Data Security
              </h2>
              <div className="pl-6 border-l-2 border-white/30 dark:border-dark-gray/30">
                <p className="text-sm leading-relaxed">
                  We implement industry-standard security measures including encryption, secure authentication, and regular security audits. However, no method of transmission over the internet is 100% secure.
                </p>
              </div>
            </div>

            {/* Section 5 */}
            <div>
              <h2 className="text-2xl text-white dark:text-dark-gray mb-4 uppercase tracking-wider">
                5. Your Rights
              </h2>
              <div className="pl-6 border-l-2 border-white/30 dark:border-dark-gray/30">
                <p className="text-sm mb-3">You have the right to:</p>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Access and download your personal data</li>
                  <li>Correct inaccurate information</li>
                  <li>Delete your account and data</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Object to data processing</li>
                </ul>
              </div>
            </div>

            {/* Section 6 */}
            <div>
              <h2 className="text-2xl text-white dark:text-dark-gray mb-4 uppercase tracking-wider">
                6. Cookies and Tracking
              </h2>
              <div className="pl-6 border-l-2 border-white/30 dark:border-dark-gray/30">
                <p className="text-sm leading-relaxed">
                  We use cookies and similar technologies to enhance your experience, analyze usage, and remember your preferences. You can control cookies through your browser settings.
                </p>
              </div>
            </div>

            {/* Section 7 */}
            <div>
              <h2 className="text-2xl text-white dark:text-dark-gray mb-4 uppercase tracking-wider">
                7. Children's Privacy
              </h2>
              <div className="pl-6 border-l-2 border-white/30 dark:border-dark-gray/30">
                <p className="text-sm leading-relaxed">
                  Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us immediately.
                </p>
              </div>
            </div>

            {/* Section 8 */}
            <div>
              <h2 className="text-2xl text-white dark:text-dark-gray mb-4 uppercase tracking-wider">
                8. Changes to This Policy
              </h2>
              <div className="pl-6 border-l-2 border-white/30 dark:border-dark-gray/30">
                <p className="text-sm leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.
                </p>
              </div>
            </div>

            {/* Contact */}
            <div className="pt-8 border-t-2 border-white/30 dark:border-dark-gray/30">
              <h2 className="text-2xl text-white dark:text-dark-gray mb-4 uppercase tracking-wider">
                Contact Us
              </h2>
              <div className="pl-6 border-l-2 border-white/30 dark:border-dark-gray/30">
                <p className="text-sm leading-relaxed mb-4">
                  If you have questions about this Privacy Policy, please contact us:
                </p>
                <ul className="space-y-2 text-sm">
                  <li><strong>Email:</strong> 202301124@dau.ac.in</li>
                  <li><strong>Website:</strong> <Link to="/contact" className="underline hover:text-white dark:hover:text-dark-gray">Contact Form</Link></li>
                </ul>
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
    </>
  )
}

export default PrivacyPage
