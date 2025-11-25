import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Zap, Globe, Download } from 'lucide-react'

function ShippingPage() {
  return (
    <>
      {/* Meta tags for Razorpay validation */}
      <title>Shipping & Delivery - NextChapter</title>
      <meta name="description" content="NextChapter Shipping and Delivery Information - Digital delivery, instant access to books." />
      
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
              Shipping & Delivery
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
                NextChapter is a 100% digital platform. We do not ship physical products. All books and services are delivered instantly online.
              </p>
            </div>

            {/* Digital Delivery */}
            <div>
              <h2 className="text-2xl text-white dark:text-dark-gray mb-4 uppercase tracking-wider">
                Digital Delivery
              </h2>
              <div className="pl-6 border-l-2 border-white/30 dark:border-dark-gray/30 space-y-6">
                <div className="flex items-start gap-4">
                  <Zap className="w-6 h-6 text-white dark:text-dark-gray flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg text-white dark:text-dark-gray mb-2 font-medium">Instant Access</h3>
                    <p className="text-sm leading-relaxed">
                      Upon successful registration or subscription, you receive immediate access to our entire digital library. No waiting, no shipping delays.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Globe className="w-6 h-6 text-white dark:text-dark-gray flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg text-white dark:text-dark-gray mb-2 font-medium">Global Availability</h3>
                    <p className="text-sm leading-relaxed">
                      Access NextChapter from anywhere in the world with an internet connection. No geographical restrictions or shipping zones.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Download className="w-6 h-6 text-white dark:text-dark-gray flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg text-white dark:text-dark-gray mb-2 font-medium">Cross-Device Sync</h3>
                    <p className="text-sm leading-relaxed">
                      Your reading progress, bookmarks, and highlights sync automatically across all your devices. Start reading on your phone, continue on your tablet or computer.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div>
              <h2 className="text-2xl text-white dark:text-dark-gray mb-4 uppercase tracking-wider">
                How It Works
              </h2>
              <div className="pl-6 border-l-2 border-white/30 dark:border-dark-gray/30 space-y-4">
                <div>
                  <h3 className="text-lg text-white dark:text-dark-gray mb-2 font-medium">Step 1: Sign Up</h3>
                  <p className="text-sm leading-relaxed">
                    Create your free account in seconds using your email address or social login.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg text-white dark:text-dark-gray mb-2 font-medium">Step 2: Choose Your Plan</h3>
                  <p className="text-sm leading-relaxed">
                    Select from our Free, Premium, or Pro subscription tiers based on your reading needs.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg text-white dark:text-dark-gray mb-2 font-medium">Step 3: Start Reading</h3>
                  <p className="text-sm leading-relaxed">
                    Browse our library of 10,000+ books and start reading immediately. No downloads required (though offline reading is available for premium users).
                  </p>
                </div>
              </div>
            </div>

            {/* Access Requirements */}
            <div>
              <h2 className="text-2xl text-white dark:text-dark-gray mb-4 uppercase tracking-wider">
                Access Requirements
              </h2>
              <div className="pl-6 border-l-2 border-white/30 dark:border-dark-gray/30">
                <p className="text-sm leading-relaxed mb-3">
                  To access NextChapter, you need:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Internet connection (for online reading)</li>
                  <li>Modern web browser (Chrome, Firefox, Safari, Edge)</li>
                  <li>Valid email address for account creation</li>
                  <li>Payment method for premium subscriptions (credit/debit card, UPI, net banking)</li>
                </ul>
              </div>
            </div>

            {/* Supported Devices */}
            <div>
              <h2 className="text-2xl text-white dark:text-dark-gray mb-4 uppercase tracking-wider">
                Supported Devices
              </h2>
              <div className="pl-6 border-l-2 border-white/30 dark:border-dark-gray/30">
                <p className="text-sm leading-relaxed mb-3">
                  NextChapter works seamlessly on:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Desktop computers (Windows, Mac, Linux)</li>
                  <li>Laptops and notebooks</li>
                  <li>Tablets (iPad, Android tablets)</li>
                  <li>Smartphones (iOS, Android)</li>
                  <li>Any device with a modern web browser</li>
                </ul>
              </div>
            </div>

            {/* No Physical Products */}
            <div>
              <h2 className="text-2xl text-white dark:text-dark-gray mb-4 uppercase tracking-wider">
                No Physical Products
              </h2>
              <div className="pl-6 border-l-2 border-white/30 dark:border-dark-gray/30">
                <p className="text-sm leading-relaxed mb-3">
                  Important to note:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>We do not sell or ship physical books</li>
                  <li>No printed materials will be delivered to your address</li>
                  <li>All content is digital and accessed through our web platform</li>
                  <li>No shipping fees or delivery charges apply</li>
                  <li>No customs or import duties for international users</li>
                </ul>
              </div>
            </div>

            {/* Delivery Issues */}
            <div>
              <h2 className="text-2xl text-white dark:text-dark-gray mb-4 uppercase tracking-wider">
                Access Issues
              </h2>
              <div className="pl-6 border-l-2 border-white/30 dark:border-dark-gray/30">
                <p className="text-sm leading-relaxed mb-3">
                  If you experience any issues accessing your account or content:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Check your internet connection</li>
                  <li>Clear your browser cache and cookies</li>
                  <li>Try a different browser or device</li>
                  <li>Verify your subscription is active</li>
                  <li>Contact our support team at <a href="mailto:202301124@dau.ac.in" className="underline hover:text-white dark:hover:text-dark-gray">202301124@dau.ac.in</a></li>
                </ul>
              </div>
            </div>

            {/* Refund Policy */}
            <div>
              <h2 className="text-2xl text-white dark:text-dark-gray mb-4 uppercase tracking-wider">
                Refund Policy
              </h2>
              <div className="pl-6 border-l-2 border-white/30 dark:border-dark-gray/30">
                <p className="text-sm leading-relaxed">
                  Since we provide instant digital access, our refund policy differs from physical product retailers. Please review our <Link to="/refunds" className="underline hover:text-white dark:hover:text-dark-gray">Cancellation & Refunds Policy</Link> for complete details on our 7-day money-back guarantee.
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
                  For questions about access or delivery:
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

export default ShippingPage
