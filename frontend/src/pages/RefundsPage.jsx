import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

function RefundsPage() {
  return (
    <>
      {/* Meta tags for Razorpay validation */}
      <title>Cancellation & Refunds - NextChapter</title>
      <meta name="description" content="NextChapter Cancellation and Refunds Policy - Learn about our refund process and cancellation terms." />
      
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
              Cancellation & Refunds
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
                At NextChapter, we want you to be completely satisfied with your subscription. This policy outlines our cancellation and refund procedures.
              </p>
            </div>

            {/* Section 1 */}
            <div>
              <h2 className="text-2xl text-white dark:text-dark-gray mb-4 uppercase tracking-wider">
                1. Subscription Cancellation
              </h2>
              <div className="pl-6 border-l-2 border-white/30 dark:border-dark-gray/30 space-y-4">
                <div>
                  <h3 className="text-lg text-white dark:text-dark-gray mb-2 font-medium">How to Cancel</h3>
                  <p className="text-sm leading-relaxed mb-2">
                    You can cancel your subscription at any time through:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li>Your account settings page</li>
                    <li>Contacting our support team at 202301124@dau.ac.in</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg text-white dark:text-dark-gray mb-2 font-medium">When Cancellation Takes Effect</h3>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li>Cancellation is effective at the end of your current billing period</li>
                    <li>You retain access to premium features until the period ends</li>
                    <li>No further charges will be made after cancellation</li>
                    <li>Your account will automatically downgrade to the free tier</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div>
              <h2 className="text-2xl text-white dark:text-dark-gray mb-4 uppercase tracking-wider">
                2. Refund Policy
              </h2>
              <div className="pl-6 border-l-2 border-white/30 dark:border-dark-gray/30 space-y-4">
                <div>
                  <h3 className="text-lg text-white dark:text-dark-gray mb-2 font-medium">7-Day Money-Back Guarantee</h3>
                  <p className="text-sm leading-relaxed mb-2">
                    We offer a 7-day money-back guarantee for new subscribers:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li>Applies to first-time Premium or Pro subscriptions only</li>
                    <li>Request a refund within 7 days of initial purchase</li>
                    <li>Full refund, no questions asked</li>
                    <li>Does not apply to subscription renewals</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg text-white dark:text-dark-gray mb-2 font-medium">Refund Eligibility</h3>
                  <p className="text-sm leading-relaxed mb-2">
                    Refunds may be granted in the following cases:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li>Technical issues preventing service access (after troubleshooting)</li>
                    <li>Duplicate charges or billing errors</li>
                    <li>Unauthorized charges (with proof)</li>
                    <li>Service outages exceeding 48 hours</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg text-white dark:text-dark-gray mb-2 font-medium">Non-Refundable Situations</h3>
                  <p className="text-sm leading-relaxed mb-2">
                    Refunds will NOT be provided for:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li>Subscription renewals after the initial 7-day period</li>
                    <li>Partial month refunds (except in case of billing errors)</li>
                    <li>Change of mind after 7 days</li>
                    <li>Account termination due to Terms of Service violations</li>
                    <li>Failure to cancel before renewal date</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div>
              <h2 className="text-2xl text-white dark:text-dark-gray mb-4 uppercase tracking-wider">
                3. How to Request a Refund
              </h2>
              <div className="pl-6 border-l-2 border-white/30 dark:border-dark-gray/30 space-y-4">
                <p className="text-sm leading-relaxed">
                  To request a refund, please contact us with the following information:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Your account email address</li>
                  <li>Transaction ID or payment receipt</li>
                  <li>Reason for refund request</li>
                  <li>Date of purchase</li>
                </ul>
                <div className="mt-4 p-4 bg-white/5 dark:bg-dark-gray/5 border-l-2 border-white dark:border-dark-gray">
                  <p className="text-sm"><strong>Contact:</strong></p>
                  <p className="text-sm mt-2">Email: 202301124@dau.ac.in</p>
                  <p className="text-sm">Subject: Refund Request - [Your Email]</p>
                </div>
              </div>
            </div>

            {/* Section 4 */}
            <div>
              <h2 className="text-2xl text-white dark:text-dark-gray mb-4 uppercase tracking-wider">
                4. Refund Processing
              </h2>
              <div className="pl-6 border-l-2 border-white/30 dark:border-dark-gray/30 space-y-4">
                <div>
                  <h3 className="text-lg text-white dark:text-dark-gray mb-2 font-medium">Timeline</h3>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li><strong>Review:</strong> We will review your request within 2-3 business days</li>
                    <li><strong>Approval:</strong> If approved, refund will be initiated immediately</li>
                    <li><strong>Processing:</strong> Refunds typically appear in 5-10 business days</li>
                    <li><strong>Bank Processing:</strong> Additional time may be required by your bank</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg text-white dark:text-dark-gray mb-2 font-medium">Refund Method</h3>
                  <p className="text-sm leading-relaxed">
                    Refunds will be issued to the original payment method used for purchase. We cannot process refunds to different accounts or payment methods.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 5 */}
            <div>
              <h2 className="text-2xl text-white dark:text-dark-gray mb-4 uppercase tracking-wider">
                5. Annual Subscriptions
              </h2>
              <div className="pl-6 border-l-2 border-white/30 dark:border-dark-gray/30">
                <p className="text-sm leading-relaxed mb-3">
                  Special terms for annual subscriptions:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>7-day money-back guarantee applies to new annual subscriptions</li>
                  <li>After 7 days, no refunds for unused months</li>
                  <li>You can cancel anytime, but no prorated refunds</li>
                  <li>Access continues until the end of the annual period</li>
                </ul>
              </div>
            </div>

            {/* Section 6 */}
            <div>
              <h2 className="text-2xl text-white dark:text-dark-gray mb-4 uppercase tracking-wider">
                6. Free Trial Cancellation
              </h2>
              <div className="pl-6 border-l-2 border-white/30 dark:border-dark-gray/30">
                <p className="text-sm leading-relaxed mb-3">
                  If we offer a free trial period:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Cancel anytime during the trial to avoid charges</li>
                  <li>Cancellation must be completed before trial ends</li>
                  <li>No refunds for charges after trial period ends</li>
                  <li>You will receive a reminder email before trial expires</li>
                </ul>
              </div>
            </div>

            {/* Section 7 */}
            <div>
              <h2 className="text-2xl text-white dark:text-dark-gray mb-4 uppercase tracking-wider">
                7. Billing Disputes
              </h2>
              <div className="pl-6 border-l-2 border-white/30 dark:border-dark-gray/30">
                <p className="text-sm leading-relaxed mb-3">
                  If you notice an incorrect charge:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Contact us immediately at 202301124@dau.ac.in</li>
                  <li>Provide transaction details and explanation</li>
                  <li>We will investigate and respond within 48 hours</li>
                  <li>Billing errors will be corrected promptly</li>
                </ul>
              </div>
            </div>

            {/* Section 8 */}
            <div>
              <h2 className="text-2xl text-white dark:text-dark-gray mb-4 uppercase tracking-wider">
                8. Account Reactivation
              </h2>
              <div className="pl-6 border-l-2 border-white/30 dark:border-dark-gray/30">
                <p className="text-sm leading-relaxed">
                  If you cancel and later wish to reactivate your subscription, you can do so at any time. However, promotional pricing from your original subscription may no longer be available.
                </p>
              </div>
            </div>

            {/* Contact */}
            <div className="pt-8 border-t-2 border-white/30 dark:border-dark-gray/30">
              <h2 className="text-2xl text-white dark:text-dark-gray mb-4 uppercase tracking-wider">
                Questions?
              </h2>
              <div className="pl-6 border-l-2 border-white/30 dark:border-dark-gray/30">
                <p className="text-sm leading-relaxed mb-4">
                  For questions about cancellations or refunds:
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

export default RefundsPage
