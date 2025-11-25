import { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Check } from 'lucide-react'

function SubscriptionPage() {
  const [billingCycle, setBillingCycle] = useState('monthly')

  const plans = [
    {
      name: 'Basic',
      monthlyPrice: 299,
      yearlyPrice: 2999,
      description: 'Perfect for casual readers',
      features: [
        'Access to 5,000+ books',
        'Basic AI recommendations',
        'Online reading',
        'Personal library',
        'Bookmarking and highlighting'
      ],
      popular: false
    },
    {
      name: 'Pro',
      monthlyPrice: 599,
      yearlyPrice: 5999,
      description: 'For avid readers and book lovers',
      features: [
        'Access to 10,000+ books',
        'Advanced AI recommendations',
        'AI-powered summaries',
        'Unlimited personal library',
        'Reading history and progress tracking',
        'Multimedia content access',
        'Reading streaks and challenges',
        'Personalized reading analytics'
      ],
      popular: true
    },
    {
      name: 'Premium',
      monthlyPrice: 999,
      yearlyPrice: 9999,
      description: 'The ultimate reading experience',
      features: [
        'Access to all books',
        'Premium AI recommendations',
        'Unlimited AI summaries',
        'Unlimited personal library',
        'Personal AI custom character chatbot',
        'AI image generation for book scenes',
        'Multiple device reading',
        'Early access to new features',
        'Advanced personalized reading analytics'
      ],
      popular: false
    }
  ]

  const getYearlySavings = (monthlyPrice, yearlyPrice) => {
    const monthlyTotal = monthlyPrice * 12
    const savings = monthlyTotal - yearlyPrice
    const percentage = Math.round((savings / monthlyTotal) * 100)
    return { savings, percentage }
  }

  return (
    <div className="min-h-screen bg-dark-gray dark:bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-dark-gray dark:bg-white py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-6">
              <div className="mb-8">
                <span className="text-xs font-medium uppercase tracking-widest text-white dark:text-dark-gray border-b-2 border-white dark:border-dark-gray pb-2 inline-block">
                  Choose Your Plan
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl text-white dark:text-dark-gray mb-8 leading-none">
                Subscription
                <br />
                Plans
              </h1>
              <p className="text-lg text-white/70 dark:text-dark-gray/70 leading-relaxed font-light max-w-xl">
                Unlock unlimited access to thousands of books, AI-powered features, and an enhanced reading experience tailored to your needs.
              </p>
            </div>
            <div className="col-span-12 md:col-span-6 border-t-2 border-white dark:border-dark-gray pt-8 md:pt-0 md:border-t-0 md:border-l-2 md:pl-12 flex items-center">
              {/* Billing Toggle */}
              <div className="w-full">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <span className={`text-sm font-medium uppercase tracking-widest transition-colors ${
                    billingCycle === 'monthly' 
                      ? 'text-white dark:text-dark-gray' 
                      : 'text-white/50 dark:text-dark-gray/50'
                  }`}>
                    Monthly
                  </span>
                  <button
                    onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                    className="relative w-16 h-8 bg-white dark:bg-dark-gray border-2 border-white dark:border-dark-gray transition-all duration-300"
                  >
                    <span
                      className={`absolute top-0 left-0 w-1/2 h-full bg-dark-gray dark:bg-white transition-transform duration-300 ${
                        billingCycle === 'yearly' ? 'translate-x-full' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className={`text-sm font-medium uppercase tracking-widest transition-colors ${
                    billingCycle === 'yearly' 
                      ? 'text-white dark:text-dark-gray' 
                      : 'text-white/50 dark:text-dark-gray/50'
                  }`}>
                    Yearly
                  </span>
                </div>
                {billingCycle === 'yearly' && (
                  <p className="text-xs text-white/60 dark:text-dark-gray/60 text-center uppercase tracking-widest">
                    Save up to 17% with yearly billing
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section className="bg-white dark:bg-dark-gray py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-12 gap-8 md:gap-12">
            {plans.map((plan, index) => {
              const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice
              const savings = billingCycle === 'yearly' 
                ? getYearlySavings(plan.monthlyPrice, plan.yearlyPrice)
                : null

              return (
                <div
                  key={plan.name}
                  className={`col-span-12 md:col-span-6 lg:col-span-4 border-2 border-dark-gray dark:border-white p-8 md:p-10 transition-all duration-300 ${
                    plan.popular
                      ? 'bg-dark-gray dark:bg-white text-white dark:text-dark-gray'
                      : 'bg-white dark:bg-dark-gray text-dark-gray dark:text-white hover:bg-dark-gray/5 dark:hover:bg-white/5'
                  }`}
                >
                  {plan.popular && (
                    <div className="mb-6">
                      <span className="text-xs font-medium uppercase tracking-widest border-b-2 border-white dark:border-dark-gray pb-2 inline-block">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <h3 className="text-3xl md:text-4xl mb-2 leading-none">
                    {plan.name}
                  </h3>
                  
                  <p className={`text-sm mb-8 font-light ${
                    plan.popular
                      ? 'text-white/70 dark:text-dark-gray/70'
                      : 'text-dark-gray/70 dark:text-white/70'
                  }`}>
                    {plan.description}
                  </p>

                  <div className="mb-8">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl md:text-6xl leading-none">
                        ₹{price.toFixed(0)}
                      </span>
                      <span className={`text-sm uppercase tracking-widest ${
                        plan.popular
                          ? 'text-white/60 dark:text-dark-gray/60'
                          : 'text-dark-gray/60 dark:text-white/60'
                      }`}>
                        /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                      </span>
                    </div>
                    {savings && (
                      <p className={`text-xs mt-2 uppercase tracking-widest ${
                        plan.popular
                          ? 'text-white/60 dark:text-dark-gray/60'
                          : 'text-dark-gray/60 dark:text-white/60'
                      }`}>
                        Save ₹{savings.savings.toFixed(0)} ({savings.percentage}% off)
                      </p>
                    )}
                  </div>

                  <ul className="space-y-4 mb-10">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className={`w-5 h-5 shrink-0 mt-0.5 ${
                          plan.popular
                            ? 'text-white dark:text-dark-gray'
                            : 'text-dark-gray dark:text-white'
                        }`} />
                        <span className={`text-sm leading-relaxed font-light ${
                          plan.popular
                            ? 'text-white/90 dark:text-dark-gray/90'
                            : 'text-dark-gray/90 dark:text-white/90'
                        }`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to="#"
                    className={`inline-flex items-center justify-center w-full border-2 px-8 py-4 text-sm font-medium uppercase tracking-widest transition-all duration-300 ${
                      plan.popular
                        ? 'bg-white dark:bg-dark-gray text-dark-gray dark:text-white border-white dark:border-dark-gray hover:bg-dark-gray dark:hover:bg-white hover:text-white dark:hover:text-dark-gray'
                        : 'bg-dark-gray dark:bg-white text-white dark:text-dark-gray border-dark-gray dark:border-white hover:bg-white dark:hover:bg-dark-gray hover:text-dark-gray dark:hover:text-white'
                    }`}
                  >
                    Get Started
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-dark-gray dark:bg-white py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-12 gap-8 md:gap-16">
            <div className="col-span-12 md:col-span-4">
              <h2 className="text-5xl md:text-6xl text-white dark:text-dark-gray mb-8 leading-none">
                Frequently
                <br />
                Asked
                <br />
                Questions
              </h2>
            </div>
            <div className="col-span-12 md:col-span-8 border-t-2 border-white dark:border-dark-gray pt-8 md:pt-0 md:border-t-0 md:border-l-2 md:pl-12">
              <div className="space-y-12">
                <div>
                  <h3 className="text-xl text-white dark:text-dark-gray mb-4">
                    Can I change my plan later?
                  </h3>
                  <p className="text-white/70 dark:text-dark-gray/70 leading-relaxed font-light">
                    Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl text-white dark:text-dark-gray mb-4">
                    What payment methods do you accept?
                  </h3>
                  <p className="text-white/70 dark:text-dark-gray/70 leading-relaxed font-light">
                    We accept all major credit cards, debit cards, and PayPal. All payments are processed securely.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl text-white dark:text-dark-gray mb-4">
                    Is there a free trial?
                  </h3>
                  <p className="text-white/70 dark:text-dark-gray/70 leading-relaxed font-light">
                    Yes, all plans come with a 7-day free trial. No credit card required to start your trial.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl text-white dark:text-dark-gray mb-4">
                    Can I cancel anytime?
                  </h3>
                  <p className="text-white/70 dark:text-dark-gray/70 leading-relaxed font-light">
                    Absolutely. You can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
                  </p>
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

export default SubscriptionPage

