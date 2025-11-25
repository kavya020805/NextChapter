import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

function TermsPage() {
  return (
    <>
      {/* Meta tags for Razorpay validation */}
      <title>Terms and Conditions - NextChapter</title>
      <meta name="description" content="NextChapter Terms and Conditions - Read our terms of service and user agreement." />
      
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
              Terms and Conditions
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
                Welcome to NextChapter. By accessing or using our platform, you agree to be bound by these Terms and Conditions. Please read them carefully before using our service.
              </p>
            </div>

            {/* Section 1 */}
            <div>
              <h2 className="text-2xl text-white dark:text-dark-gray mb-4 uppercase tracking-wider">
                1. Acceptance of Terms
              </h2>
              <div className="pl-6 border-l-2 border-white/30 dark:border-dark-gray/30">
                <p className="text-sm leading-relaxed">
                  By creating an account or using NextChapter, you agree to these Terms and Conditions, our Privacy Policy, and all applicable laws and regulations. If you do not agree, please do not use our service.
                </p>
              </div>
            </div>

            {/* Section 2 */}
            <div>
              <h2 className="text-2xl text-white dark:text-dark-gray mb-4 uppercase tracking-wider">
                2. User Accounts
              </h2>
              <div className="pl-6 border-l-2 border-white/30 dark:border-dark-gray/30 space-y-4">
                <div>
                  <h3 className="text-lg text-white dark:text-dark-gray mb-2 font-medium">Account Creation</h3>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li>You must be at least 13 years old to create an account</li>
                    <li>You must provide accurate and complete information</li>
                    <li>You are responsible for maintaining account security</li>
                    <li>One person may not maintain multiple accounts</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg text-white dark:text-dark-gray mb-2 font-medium">Account Responsibilities</h3>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li>Keep your password confidential</li>
                    <li>Notify us immediately of unauthorized access</li>
                    <li>You are liable for all activities under your account</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div>
              <h2 className="text-2xl text-white dark:text-dark-gray mb-4 uppercase tracking-wider">
                3. Subscription and Payment
              </h2>
              <div className="pl-6 border-l-2 border-white/30 dark:border-dark-gray/30 space-y-4">
                <div>
                  <h3 className="text-lg text-white dark:text-dark-gray mb-2 font-medium">Free and Paid Tiers</h3>
                  <p className="text-sm leading-relaxed mb-2">
                    NextChapter offers both free and paid subscription tiers. Paid subscriptions provide access to premium features including unlimited AI summaries, chatbots, and advanced analytics.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg text-white dark:text-dark-gray mb-2 font-medium">Billing</h3>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li>Subscriptions are billed monthly or annually</li>
                    <li>Payments are processed securely through Razorpay</li>
                    <li>Prices are subject to change with 30 days notice</li>
                    <li>You authorize automatic recurring charges</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg text-white dark:text-dark-gray mb-2 font-medium">Cancellation</h3>
                  <p className="text-sm leading-relaxed">
                    You may cancel your subscription at any time. See our <Link to="/refunds" className="underline hover:text-white dark:hover:text-dark-gray">Cancellation & Refunds Policy</Link> for details.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 4 */}
            <div>
              <h2 className="text-2xl text-white dark:text-dark-gray mb-4 uppercase tracking-wider">
                4. Acceptable Use
              </h2>
              <div className="pl-6 border-l-2 border-white/30 dark:border-dark-gray/30 space-y-4">
                <p className="text-sm">You agree NOT to:</p>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Violate any laws or regulations</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Share your account credentials with others</li>
                  <li>Attempt to hack, reverse engineer, or disrupt our service</li>
                  <li>Use automated tools to scrape or download content</li>
                  <li>Upload malicious code or viruses</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Use the service for commercial purposes without permission</li>
                </ul>
              </div>
            </div>

            {/* Section 5 */}
            <div>
              <h2 className="text-2xl text-white dark:text-dark-gray mb-4 uppercase tracking-wider">
                5. Intellectual Property
              </h2>
              <div className="pl-6 border-l-2 border-white/30 dark:border-dark-gray/30 space-y-4">
                <div>
                  <h3 className="text-lg text-white dark:text-dark-gray mb-2 font-medium">Our Content</h3>
                  <p className="text-sm leading-relaxed">
                    The NextChapter platform, including its design, features, and AI technology, is owned by us and protected by copyright, trademark, and other intellectual property laws.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg text-white dark:text-dark-gray mb-2 font-medium">Book Content</h3>
                  <p className="text-sm leading-relaxed">
                    Books available on our platform are either in the public domain or licensed for distribution. You may not redistribute, sell, or commercially exploit any content from our platform.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg text-white dark:text-dark-gray mb-2 font-medium">Your Content</h3>
                  <p className="text-sm leading-relaxed">
                    You retain ownership of your highlights, notes, and comments. By posting content, you grant us a license to display and use it within our platform.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 6 */}
            <div>
              <h2 className="text-2xl text-white dark:text-dark-gray mb-4 uppercase tracking-wider">
                6. AI Features
              </h2>
              <div className="pl-6 border-l-2 border-white/30 dark:border-dark-gray/30">
                <p className="text-sm leading-relaxed mb-3">
                  Our AI-powered features (summaries, chatbots, recommendations) are provided "as is." While we strive for accuracy:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>AI-generated content may contain errors or inaccuracies</li>
                  <li>AI responses should not be considered professional advice</li>
                  <li>We are not liable for decisions made based on AI outputs</li>
                  <li>AI features may be modified or discontinued at any time</li>
                </ul>
              </div>
            </div>

            {/* Section 7 */}
            <div>
              <h2 className="text-2xl text-white dark:text-dark-gray mb-4 uppercase tracking-wider">
                7. Limitation of Liability
              </h2>
              <div className="pl-6 border-l-2 border-white/30 dark:border-dark-gray/30">
                <p className="text-sm leading-relaxed mb-3">
                  To the maximum extent permitted by law:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>NextChapter is provided "as is" without warranties of any kind</li>
                  <li>We are not liable for indirect, incidental, or consequential damages</li>
                  <li>Our total liability shall not exceed the amount you paid in the last 12 months</li>
                  <li>We do not guarantee uninterrupted or error-free service</li>
                </ul>
              </div>
            </div>

            {/* Section 8 */}
            <div>
              <h2 className="text-2xl text-white dark:text-dark-gray mb-4 uppercase tracking-wider">
                8. Termination
              </h2>
              <div className="pl-6 border-l-2 border-white/30 dark:border-dark-gray/30">
                <p className="text-sm leading-relaxed mb-3">
                  We reserve the right to suspend or terminate your account if you:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Violate these Terms and Conditions</li>
                  <li>Engage in fraudulent or illegal activity</li>
                  <li>Abuse our service or other users</li>
                  <li>Fail to pay subscription fees</li>
                </ul>
                <p className="text-sm leading-relaxed mt-3">
                  Upon termination, your access will cease, but these Terms will continue to apply to past use.
                </p>
              </div>
            </div>

            {/* Section 9 */}
            <div>
              <h2 className="text-2xl text-white dark:text-dark-gray mb-4 uppercase tracking-wider">
                9. Changes to Terms
              </h2>
              <div className="pl-6 border-l-2 border-white/30 dark:border-dark-gray/30">
                <p className="text-sm leading-relaxed">
                  We may modify these Terms at any time. We will notify you of significant changes via email or platform notification. Continued use after changes constitutes acceptance of the new Terms.
                </p>
              </div>
            </div>

            {/* Section 10 */}
            <div>
              <h2 className="text-2xl text-white dark:text-dark-gray mb-4 uppercase tracking-wider">
                10. Governing Law
              </h2>
              <div className="pl-6 border-l-2 border-white/30 dark:border-dark-gray/30">
                <p className="text-sm leading-relaxed">
                  These Terms are governed by the laws of India. Any disputes shall be resolved in the courts of [Your City/State], India.
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
                  Questions about these Terms? Contact us:
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

export default TermsPage
