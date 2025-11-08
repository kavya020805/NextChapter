import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import HeroSection from '../components/HeroSection'
import { BookOpen, Sparkles, Brain, Search, BookMarked, Globe, ArrowRight, TrendingUp, MessageCircle, Download, Trophy } from 'lucide-react'

// Custom hook for counter animation
function useCounter(target, duration = 2000, suffix = '', isDecimal = false) {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const countRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasStarted) {
            setHasStarted(true)
            const startTime = Date.now()
            const startValue = 0

            const animate = () => {
              const now = Date.now()
              const elapsed = now - startTime
              const progress = Math.min(elapsed / duration, 1)

              // Easing function for smooth animation
              const easeOutQuart = 1 - Math.pow(1 - progress, 4)
              const currentValue = startValue + (target - startValue) * easeOutQuart

              if (isDecimal) {
                setCount(parseFloat(currentValue.toFixed(1)))
              } else {
                setCount(Math.floor(currentValue))
              }

              if (progress < 1) {
                requestAnimationFrame(animate)
              } else {
                if (isDecimal) {
                  setCount(target)
                } else {
                  setCount(target)
                }
              }
            }

            requestAnimationFrame(animate)
          }
        })
      },
      { threshold: 0.3 }
    )

    if (countRef.current) {
      observer.observe(countRef.current)
    }

    return () => {
      if (countRef.current) {
        observer.unobserve(countRef.current)
      }
    }
  }, [target, duration, hasStarted, isDecimal])

  const formatNumber = (num) => {
    if (isDecimal) {
      return num.toFixed(1)
    }
    return num.toLocaleString('en-US')
  }

  return { count: formatNumber(count), ref: countRef }
}

// Counter Stat Component
function CounterStat({ target, suffix, label, duration = 2000, isDecimal = false }) {
  const { count, ref } = useCounter(target, duration, suffix, isDecimal)

  return (
    <div ref={ref}>
      <div className="text-7xl md:text-8xl text-dark-gray dark:text-white mb-4 leading-none">
        {count}{suffix}
      </div>
      <div className="text-xs font-medium uppercase tracking-widest text-dark-gray/60 dark:text-white/60">
        {label}
      </div>
    </div>
  )
}

function LandingPage() {
  const features = [
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "AI Recommendations",
      description: "Advanced AI-powered suggestions that learn from your reading preferences to discover your next favorite book"
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI Summaries",
      description: "Get instant insights and key takeaways with unlimited AI-generated book summaries to enhance your understanding"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Reading Analytics",
      description: "Track your reading progress, history, and detailed personalized analytics to understand your reading habits"
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "AI Character Chatbot",
      description: "Engage in personalized conversations with custom AI characters for deeper book discussions and insights"
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Reading Streaks & Challenges",
      description: "Stay motivated with reading streaks, challenges, and gamified achievements to build consistent reading habits"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Multiple Device Reading",
      description: "Seamlessly sync your reading progress across all your devices and continue your journey from anywhere"
    }
  ]

  return (
    <div className="min-h-screen bg-dark-gray dark:bg-white">
      <Header />
      <HeroSection />
      
      {/* About Section - Swiss Grid */}
      <section className="bg-dark-gray dark:bg-white py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-12 gap-8 md:gap-16">
            <div className="col-span-12 md:col-span-4">
              <h2 className="text-5xl md:text-6xl text-white dark:text-dark-gray mb-8 leading-none">
                About
                <br />
                NextChapter
              </h2>
            </div>
            <div className="col-span-12 md:col-span-8 border-t-2 border-white dark:border-dark-gray pt-8 md:pt-0 md:border-t-0 md:border-l-2 md:pl-12">
              <p className="text-lg md:text-xl text-white/70 dark:text-dark-gray/70 leading-relaxed font-light max-w-2xl">
                NextChapter is more than just an online bookstore—it's a revolutionary platform that redefines 
                digital reading. We combine cutting-edge AI technology with a beautifully designed interface 
                to create an unparalleled reading experience. Discover, purchase, and read books with 
                intelligent recommendations, AI-powered summaries, and multimedia-enhanced content that brings 
                stories to life.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Swiss Grid */}
      <section className="bg-white dark:bg-dark-gray py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-12 gap-8 mb-20">
            <div className="col-span-12 md:col-span-4">
              <h2 className="text-5xl md:text-6xl text-dark-gray dark:text-white mb-6 leading-none">
                Features
              </h2>
            </div>
            <div className="col-span-12 md:col-span-8 border-t-2 border-dark-gray dark:border-white pt-8 md:pt-0 md:border-t-0 md:border-l-2 md:pl-12">
              <p className="text-lg text-dark-gray/70 dark:text-white/70 font-light">
                Everything you need for the perfect reading journey
              </p>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8 md:gap-12">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="col-span-12 md:col-span-6 lg:col-span-4 border-2 border-dark-gray dark:border-white p-8 hover:bg-dark-gray/5 dark:hover:bg-white/5 transition-colors"
              >
                <div className="text-dark-gray dark:text-white mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl text-dark-gray dark:text-white mb-4 leading-tight">
                  {feature.title}
                </h3>
                <p className="text-dark-gray/70 dark:text-white/70 leading-relaxed font-light text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section - Swiss Grid */}
      <section className="bg-white dark:bg-dark-gray py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-12 gap-8 md:gap-16 border-t-2 border-dark-gray dark:border-white pt-16">
            <div className="col-span-12 md:col-span-4">
              <CounterStat 
                target={10000} 
                suffix="+" 
                label="Books Available"
                duration={2000}
              />
            </div>
            <div className="col-span-12 md:col-span-4 border-t-2 border-dark-gray dark:border-white pt-8 md:pt-0 md:border-t-0 md:border-l-2 md:pl-12">
              <CounterStat 
                target={50000} 
                suffix="+" 
                label="Active Readers"
                duration={2500}
              />
            </div>
            <div className="col-span-12 md:col-span-4 border-t-2 border-dark-gray dark:border-white pt-8 md:pt-0 md:border-t-0 md:border-l-2 md:pl-12">
              <CounterStat 
                target={4.8} 
                suffix="" 
                label="User Rating"
                duration={1500}
                isDecimal={true}
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Swiss Style */}
      <section className="bg-dark-gray dark:bg-white py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-12 gap-8 md:gap-16">
            <div className="col-span-12 md:col-span-6">
              <h2 className="text-5xl md:text-6xl lg:text-7xl text-white dark:text-dark-gray mb-8 leading-none">
                Ready to Start
                <br />
                Your Next Chapter?
              </h2>
            </div>
            <div className="col-span-12 md:col-span-6 border-t-2 border-white dark:border-dark-gray pt-8 md:pt-0 md:border-t-0 md:border-l-2 md:pl-12 flex flex-col justify-center">
              <p className="text-lg text-white/70 dark:text-dark-gray/70 mb-8 font-light">
                Join thousands of readers discovering their next favorite book
              </p>
              <Link 
                to="/books" 
                className="group inline-flex items-center gap-3 bg-white dark:bg-dark-gray text-dark-gray dark:text-white px-8 py-4 text-sm font-medium uppercase tracking-widest border-2 border-white dark:border-dark-gray w-fit transition-all duration-300 hover:bg-dark-gray dark:hover:bg-white hover:text-white dark:hover:text-dark-gray overflow-hidden relative"
              >
                <span className="relative z-10 transition-colors duration-300">Get Started Free</span>
                <ArrowRight 
                  className="w-4 h-4 relative z-10 transition-all duration-300 -translate-x-5 opacity-0 group-hover:translate-x-0 group-hover:opacity-100" 
                />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Swiss Style */}
      <footer className="bg-dark-gray dark:bg-white border-t-2 border-white dark:border-dark-gray py-16">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-6">
              <div className="text-4xl text-white dark:text-dark-gray mb-8 leading-none">
                NextChapter
              </div>
              <p className="text-sm text-white/60 dark:text-dark-gray/60 font-light uppercase tracking-widest max-w-md">
                Redefining digital reading with AI-powered intelligence
              </p>
            </div>
            <div className="col-span-12 md:col-span-6 border-t-2 border-white dark:border-dark-gray pt-8 md:pt-0 md:border-t-0 md:border-l-2 md:pl-12">
              <div className="grid grid-cols-2 gap-8 mb-8">
                <a href="#" className="text-xs text-white dark:text-dark-gray font-medium uppercase tracking-widest hover:opacity-60 transition-opacity">About</a>
                <a href="#" className="text-xs text-white dark:text-dark-gray font-medium uppercase tracking-widest hover:opacity-60 transition-opacity">Features</a>
                <a href="#" className="text-xs text-white dark:text-dark-gray font-medium uppercase tracking-widest hover:opacity-60 transition-opacity">Contact</a>
                <a href="#" className="text-xs text-white dark:text-dark-gray font-medium uppercase tracking-widest hover:opacity-60 transition-opacity">Privacy</a>
              </div>
              <div className="text-xs text-white/40 dark:text-dark-gray/40 font-light uppercase tracking-widest">
                © 2025 NextChapter. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage

