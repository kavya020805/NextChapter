import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Header from '../components/Header'
import HeroSection from '../components/HeroSection'
import Footer from '../components/Footer'
import CountUp from '../components/CountUp'
import { BookOpen, Sparkles, Brain, Search, BookMarked, Globe, ArrowRight, TrendingUp, MessageCircle, Download, Trophy } from 'lucide-react'

// Counter Stat Component
function CounterStat({ target, suffix, label, duration = 2 }) {
  return (
    <div>
      <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-dark-gray dark:text-white mb-3 sm:mb-4 leading-none">
        <CountUp
          from={0}
          to={target}
          separator=","
          direction="up"
          duration={duration}
          className="count-up-text"
        />
        {suffix}
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
      icon: <Sparkles className="w-8 h-8 md:w-10 md:h-10" />,
      title: "AI Recommendations",
      description: "Advanced AI-powered suggestions that learn from your reading preferences to discover your next favorite book",
      isAI: true,
      size: "large"
    },
    {
      icon: <Brain className="w-8 h-8 md:w-10 md:h-10" />,
      title: "AI Summaries",
      description: "Get instant insights and key takeaways with unlimited AI-generated book summaries to enhance your understanding",
      isAI: true,
      size: "large"
    },
    {
      icon: <MessageCircle className="w-8 h-8 md:w-10 md:h-10" />,
      title: "AI Character Chatbot",
      description: "Engage in personalized conversations with custom AI characters for deeper book discussions and insights",
      isAI: true,
      size: "large"
    },
    {
      icon: <TrendingUp className="w-6 h-6 md:w-7 md:h-7" />,
      title: "Reading Analytics",
      description: "Track your reading progress, history, and detailed personalized analytics to understand your reading habits",
      isAI: false,
      size: "small"
    },
    {
      icon: <Trophy className="w-6 h-6 md:w-7 md:h-7" />,
      title: "Reading Streaks & Challenges",
      description: "Stay motivated with reading streaks, challenges, and gamified achievements to build consistent reading habits",
      isAI: false,
      size: "small"
    },
    {
      icon: <Globe className="w-6 h-6 md:w-7 md:h-7" />,
      title: "Multiple Device Reading",
      description: "Seamlessly sync your reading progress across all your devices and continue your journey from anywhere",
      isAI: false,
      size: "small"
    }
  ]

  return (
    <div className="min-h-screen bg-dark-gray dark:bg-white">
      <Header />
      <HeroSection />
      
      {/* About Section - Swiss Grid */}
      <section className="bg-dark-gray dark:bg-white py-16 sm:py-20 md:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 md:gap-12 lg:gap-16">
            <div className="md:col-span-4">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white dark:text-dark-gray mb-6 sm:mb-8 leading-none">
                About
                <br />
                NextChapter
              </h2>
            </div>
            <div className="md:col-span-8 border-t-2 border-white dark:border-dark-gray pt-6 sm:pt-8 md:pt-0 md:border-t-0 md:border-l-2 md:pl-8 lg:pl-12">
              <p className="text-base sm:text-lg md:text-xl text-white/70 dark:text-dark-gray/70 leading-relaxed font-light max-w-2xl">
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

      {/* Features Section - Bento Grid */}
      <section className="bg-white dark:bg-dark-gray py-16 sm:py-20 md:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 mb-12 sm:mb-16 md:mb-20">
            <div className="md:col-span-4">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-dark-gray dark:text-white mb-4 sm:mb-6 leading-none">
                Features
              </h2>
            </div>
            <div className="md:col-span-8 border-t-2 border-dark-gray dark:border-white pt-6 sm:pt-8 md:pt-0 md:border-t-0 md:border-l-2 md:pl-8 lg:pl-12">
              <p className="text-base sm:text-lg text-dark-gray/70 dark:text-white/70 font-light">
                Everything you need for the perfect reading journey
              </p>
            </div>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 sm:gap-3 md:gap-2">
            {/* AI Recommendations - Large Card (2x2) */}
            <div className="md:col-span-2 md:row-span-2 border-2 border-dark-gray dark:border-white p-6 sm:p-8 md:p-6 lg:p-8 xl:p-10 hover:bg-dark-gray/5 dark:hover:bg-white/5 transition-all duration-300 md:hover:scale-[1.02] group relative overflow-hidden">
              {/* Animated Background Glow */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                animate={{
                  background: [
                    'radial-gradient(circle at 20% 30%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)',
                    'radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
                    'radial-gradient(circle at 20% 30%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)',
                  ],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Floating Sparkles */}
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  initial={{
                    x: 10 + Math.random() * 30 + '%',
                    y: 5 + Math.random() * 15 + '%',
                    opacity: 0,
                  }}
                  animate={{
                    y: [null, -10 - Math.random() * 15],
                    x: [null, Math.random() * 20 - 10],
                    opacity: [0, 0.6, 0],
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                    ease: "easeOut"
                  }}
                >
                  <Sparkles className="w-3 h-3 text-purple-400 dark:text-purple-300" />
                </motion.div>
              ))}

              {/* Floating Book Icons */}
              {[...Array(2)].map((_, i) => (
                <motion.div
                  key={`book-${i}`}
                  className="absolute"
                  initial={{
                    x: 15 + Math.random() * 25 + '%',
                    y: 8 + Math.random() * 20 + '%',
                    opacity: 0,
                    rotate: Math.random() * 360,
                  }}
                  animate={{
                    y: [null, -15 - Math.random() * 20],
                    x: [null, Math.random() * 15 - 7.5],
                    opacity: [0, 0.3, 0],
                    rotate: [null, Math.random() * 360 + 180],
                    scale: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 4 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 3,
                    ease: "easeInOut"
                  }}
                >
                  <BookOpen className="w-4 h-4 text-blue-400 dark:text-blue-300" />
                </motion.div>
              ))}

              {/* Pulsing Recommendation Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                {[...Array(3)].map((_, i) => {
                  const x1 = 20 + Math.random() * 60
                  const y1 = 20 + Math.random() * 60
                  const x2 = 20 + Math.random() * 60
                  const y2 = 20 + Math.random() * 60
                  return (
                    <motion.line
                      key={`line-${i}`}
                      x1={`${x1}%`}
                      y1={`${y1}%`}
                      x2={`${x2}%`}
                      y2={`${y2}%`}
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="text-purple-400/30 dark:text-purple-300/30"
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: [0, 0.5, 0],
                      }}
                      transition={{
                        duration: 2 + i * 0.5,
                        repeat: Infinity,
                        delay: i * 0.7,
                        ease: "easeInOut"
                      }}
                    />
                  )
                })}
              </svg>

              {/* Content */}
              <div className="relative z-10">
                <div className="text-dark-gray dark:text-white mb-6">
                  {features[0].icon}
                </div>
                <h3 className="text-2xl md:text-3xl text-dark-gray dark:text-white mb-4 leading-tight font-medium">
                  {features[0].title}
                </h3>
                <p className="text-base md:text-lg text-dark-gray/70 dark:text-white/70 leading-relaxed font-light">
                  {features[0].description}
                </p>

                {/* Animated Recommendation Badge */}
                <motion.div
                  className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-purple-500/10 to-blue-500/10 dark:from-purple-400/20 dark:to-blue-400/20 rounded-full border border-purple-300/30 dark:border-purple-400/30"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: [1, 1.05, 1],
                    opacity: 1,
                  }}
                  transition={{
                    scale: {
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }
                  }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                  </motion.div>
                  <span className="text-xs md:text-sm font-medium text-purple-600 dark:text-purple-300">
                    Learning your preferences...
                  </span>
                </motion.div>
              </div>
            </div>

            {/* Reading Analytics - Small Card (1x1) */}
            <div className="md:col-span-1 md:row-span-1 border-2 border-dark-gray dark:border-white p-6 md:p-8 hover:bg-dark-gray/5 dark:hover:bg-white/5 transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden">
              {/* Animated Background Glow */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                animate={{
                  background: [
                    'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.08) 0%, transparent 60%)',
                    'radial-gradient(circle at 50% 50%, rgba(34, 197, 94, 0.08) 0%, transparent 60%)',
                    'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.08) 0%, transparent 60%)',
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Floating Chart Dots */}
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={`dot-${i}`}
                  className="absolute rounded-full bg-blue-400/20 dark:bg-blue-300/20"
                  initial={{
                    x: Math.random() * 100 + '%',
                    y: Math.random() * 100 + '%',
                    opacity: 0,
                  }}
                  animate={{
                    y: [null, Math.random() * -30 - 15],
                    opacity: [0, 0.3, 0],
                    scale: [0, 0.6, 0],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 1.5,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                    ease: "easeOut"
                  }}
                  style={{
                    width: '6px',
                    height: '6px',
                  }}
                />
              ))}

              {/* Content */}
              <div className="relative z-10">
                <div className="text-dark-gray dark:text-white mb-4">
                  {features[3].icon}
                </div>
                <h3 className="text-lg md:text-xl text-dark-gray dark:text-white mb-2 leading-tight font-medium">
                  {features[3].title}
                </h3>
                <p className="text-sm md:text-base text-dark-gray/70 dark:text-white/70 leading-relaxed font-light">
                  {features[3].description}
                </p>
              </div>
            </div>

            {/* Reading Streaks - Small Card (1x1) */}
            <div className="md:col-span-1 md:row-span-1 border-2 border-dark-gray dark:border-white p-6 md:p-8 hover:bg-dark-gray/5 dark:hover:bg-white/5 transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden">
              {/* Animated Background Glow */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                animate={{
                  background: [
                    'radial-gradient(circle at 50% 50%, rgba(251, 191, 36, 0.08) 0%, transparent 60%)',
                    'radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.08) 0%, transparent 60%)',
                    'radial-gradient(circle at 50% 50%, rgba(251, 191, 36, 0.08) 0%, transparent 60%)',
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Floating Stars */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={`star-${i}`}
                  className="absolute"
                  initial={{
                    x: Math.random() * 100 + '%',
                    y: Math.random() * 100 + '%',
                    opacity: 0,
                    rotate: Math.random() * 360,
                  }}
                  animate={{
                    y: [null, Math.random() * -25 - 10],
                    opacity: [0, 0.4, 0],
                    rotate: [null, Math.random() * 180 + 90],
                    scale: [0, 0.5, 0],
                  }}
                  transition={{
                    duration: 2.5 + Math.random() * 1,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                    ease: "easeOut"
                  }}
                >
                  <Trophy className="w-3 h-3 text-yellow-400/40 dark:text-yellow-300/40" />
                </motion.div>
              ))}

              {/* Content */}
              <div className="relative z-10">
                <div className="text-dark-gray dark:text-white mb-4">
                  {features[4].icon}
                </div>
                <h3 className="text-lg md:text-xl text-dark-gray dark:text-white mb-2 leading-tight font-medium">
                  {features[4].title}
                </h3>
                <p className="text-sm md:text-base text-dark-gray/70 dark:text-white/70 leading-relaxed font-light">
                  {features[4].description}
                </p>
              </div>
            </div>

            {/* AI Summaries - Large Card (2x1) */}
            <div className="md:col-span-2 md:row-span-1 border-2 border-dark-gray dark:border-white p-6 md:p-8 lg:p-10 hover:bg-dark-gray/5 dark:hover:bg-white/5 transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden">
              {/* Animated Background Glow */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                animate={{
                  background: [
                    'radial-gradient(circle at 25% 35%, rgba(30, 58, 138, 0.1) 0%, transparent 50%)',
                    'radial-gradient(circle at 75% 65%, rgba(37, 99, 235, 0.1) 0%, transparent 50%)',
                    'radial-gradient(circle at 25% 35%, rgba(30, 58, 138, 0.1) 0%, transparent 50%)',
                  ],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Floating Document Icons */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={`doc-${i}`}
                  className="absolute"
                  initial={{
                    x: 10 + Math.random() * 30 + '%',
                    y: 5 + Math.random() * 15 + '%',
                    opacity: 0,
                    rotate: Math.random() * 360,
                  }}
                  animate={{
                    y: [null, -10 - Math.random() * 20],
                    x: [null, Math.random() * 15 - 7.5],
                    opacity: [0, 0.4, 0],
                    rotate: [null, Math.random() * 360 + 180],
                    scale: [0.4, 0.7, 0.4],
                  }}
                  transition={{
                    duration: 4 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 3,
                    ease: "easeInOut"
                  }}
                >
                  <BookMarked className="w-4 h-4 text-blue-600 dark:text-blue-500" />
                </motion.div>
              ))}

              {/* Floating Brain Icons (for understanding) */}
              {[...Array(2)].map((_, i) => (
                <motion.div
                  key={`brain-${i}`}
                  className="absolute"
                  initial={{
                    x: 15 + Math.random() * 20 + '%',
                    y: 8 + Math.random() * 12 + '%',
                    opacity: 0,
                    scale: 0,
                  }}
                  animate={{
                    y: [null, -8 - Math.random() * 12],
                    x: [null, Math.random() * 10 - 5],
                    opacity: [0, 0.5, 0],
                    scale: [0, 0.8, 0],
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 5 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 4,
                    ease: "easeInOut"
                  }}
                >
                  <Brain className="w-5 h-5 text-blue-700 dark:text-blue-600" />
                </motion.div>
              ))}

              {/* Summary Lines (connecting insights) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                {[...Array(3)].map((_, i) => {
                  const x1 = 20 + Math.random() * 60
                  const y1 = 25 + Math.random() * 50
                  const x2 = 20 + Math.random() * 60
                  const y2 = 25 + Math.random() * 50
                  return (
                    <motion.line
                      key={`summary-${i}`}
                      x1={`${x1}%`}
                      y1={`${y1}%`}
                      x2={`${x2}%`}
                      y2={`${y2}%`}
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="text-blue-600/25 dark:text-blue-500/25"
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: [0, 0.5, 0],
                      }}
                      transition={{
                        duration: 2.5 + i * 0.4,
                        repeat: Infinity,
                        delay: i * 0.8,
                        ease: "easeInOut"
                      }}
                    />
                  )
                })}
              </svg>

              {/* Content */}
              <div className="relative z-10">
                <div className="text-dark-gray dark:text-white mb-4">
                  {features[1].icon}
                </div>
                <h3 className="text-2xl md:text-3xl text-dark-gray dark:text-white mb-3 leading-tight font-medium">
                  {features[1].title}
                </h3>
                <p className="text-base md:text-lg text-dark-gray/70 dark:text-white/70 leading-relaxed font-light">
                  {features[1].description}
                </p>

                {/* Animated Summary Badge */}
                <motion.div
                  className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-blue-600/10 to-blue-800/10 dark:from-blue-500/20 dark:to-blue-700/20 rounded-full border border-blue-500/30 dark:border-blue-400/30"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: [1, 1.05, 1],
                    opacity: 1,
                  }}
                  transition={{
                    scale: {
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }
                  }}
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 15, -15, 0]
                    }}
                    transition={{ 
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Brain className="w-4 h-4 text-blue-600 dark:text-blue-500" />
                  </motion.div>
                  <span className="text-xs md:text-sm font-medium text-blue-700 dark:text-blue-400">
                    Generating insights...
                  </span>
                </motion.div>
              </div>
            </div>

             {/* AI Character Chatbot - Large Card (3x1) */}
             <div className="md:col-span-3 md:row-span-1 border-2 border-dark-gray dark:border-white p-6 md:p-8 lg:p-10 hover:bg-dark-gray/5 dark:hover:bg-white/5 transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden">
               {/* Animated Background Glow */}
               <motion.div
                 className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                 animate={{
                   background: [
                     'radial-gradient(circle at 30% 40%, rgba(34, 197, 94, 0.1) 0%, transparent 50%)',
                     'radial-gradient(circle at 70% 60%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
                     'radial-gradient(circle at 30% 40%, rgba(34, 197, 94, 0.1) 0%, transparent 50%)',
                   ],
                 }}
                 transition={{
                   duration: 4,
                   repeat: Infinity,
                   ease: "easeInOut"
                 }}
               />
               
               {/* Floating Chat Bubbles */}
               {[...Array(3)].map((_, i) => (
                 <motion.div
                   key={`bubble-${i}`}
                   className="absolute rounded-full bg-linear-to-br from-green-400/20 to-blue-400/20 dark:from-green-300/30 dark:to-blue-300/30 backdrop-blur-sm"
                   initial={{
                     x: 10 + Math.random() * 30 + '%',
                     y: 5 + Math.random() * 15 + '%',
                     opacity: 0,
                     scale: 0,
                   }}
                   animate={{
                     y: [null, -10 - Math.random() * 20],
                     x: [null, Math.random() * 15 - 7.5],
                     opacity: [0, 0.4, 0],
                     scale: [0, Math.random() * 0.8 + 0.3, 0],
                   }}
                   transition={{
                     duration: 3 + Math.random() * 2,
                     repeat: Infinity,
                     delay: Math.random() * 2,
                     ease: "easeOut"
                   }}
                   style={{
                     width: `${20 + Math.random() * 30}px`,
                     height: `${20 + Math.random() * 30}px`,
                   }}
                 />
               ))}

               {/* Floating Message Icons */}
               {[...Array(3)].map((_, i) => (
                 <motion.div
                   key={`message-${i}`}
                   className="absolute"
                   initial={{
                     x: 12 + Math.random() * 28 + '%',
                     y: 6 + Math.random() * 14 + '%',
                     opacity: 0,
                     rotate: Math.random() * 360,
                   }}
                   animate={{
                     y: [null, -12 - Math.random() * 18],
                     x: [null, Math.random() * 12 - 6],
                     opacity: [0, 0.5, 0],
                     rotate: [null, Math.random() * 360 + 180],
                     scale: [0.4, 0.7, 0.4],
                   }}
                   transition={{
                     duration: 4 + Math.random() * 2,
                     repeat: Infinity,
                     delay: Math.random() * 3,
                     ease: "easeInOut"
                   }}
                 >
                   <MessageCircle className="w-4 h-4 text-green-400 dark:text-green-300" />
                 </motion.div>
               ))}

               {/* Conversation Lines */}
               <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                 {[...Array(4)].map((_, i) => {
                   const x1 = 15 + Math.random() * 70
                   const y1 = 20 + Math.random() * 60
                   const x2 = 15 + Math.random() * 70
                   const y2 = 20 + Math.random() * 60
                   return (
                     <motion.line
                       key={`conversation-${i}`}
                       x1={`${x1}%`}
                       y1={`${y1}%`}
                       x2={`${x2}%`}
                       y2={`${y2}%`}
                       stroke="currentColor"
                       strokeWidth="1.5"
                       strokeDasharray="4 4"
                       className="text-green-400/20 dark:text-green-300/20"
                       initial={{ opacity: 0 }}
                       animate={{
                         opacity: [0, 0.4, 0],
                         strokeDashoffset: [0, -20, 0],
                       }}
                       transition={{
                         duration: 2.5 + i * 0.3,
                         repeat: Infinity,
                         delay: i * 0.6,
                         ease: "easeInOut"
                       }}
                     />
                   )
                 })}
               </svg>

               {/* Content */}
               <div className="relative z-10">
                 <div className="text-dark-gray dark:text-white mb-4">
                   {features[2].icon}
                 </div>
                 <h3 className="text-2xl md:text-3xl text-dark-gray dark:text-white mb-3 leading-tight font-medium">
                   {features[2].title}
                 </h3>
                 <p className="text-base md:text-lg text-dark-gray/70 dark:text-white/70 leading-relaxed font-light">
                   {features[2].description}
                 </p>

                 {/* Animated Chat Badge */}
                 <motion.div
                   className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-green-500/10 to-blue-500/10 dark:from-green-400/20 dark:to-blue-400/20 rounded-full border border-green-300/30 dark:border-green-400/30"
                   initial={{ scale: 0, opacity: 0 }}
                   animate={{ 
                     scale: [1, 1.05, 1],
                     opacity: 1,
                   }}
                   transition={{
                     scale: {
                       duration: 2,
                       repeat: Infinity,
                       ease: "easeInOut"
                     }
                   }}
                 >
                   <motion.div
                     animate={{ 
                       scale: [1, 1.2, 1],
                       rotate: [0, 10, -10, 0]
                     }}
                     transition={{ 
                       duration: 2,
                       repeat: Infinity,
                       ease: "easeInOut"
                     }}
                   >
                     <MessageCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
                   </motion.div>
                   <span className="text-xs md:text-sm font-medium text-green-600 dark:text-green-300">
                     Chatting...
                   </span>
                 </motion.div>
               </div>
             </div>

            {/* Multiple Device Reading - Small Card (1x1) */}
            <div className="md:col-span-1 md:row-span-1 border-2 border-dark-gray dark:border-white p-6 md:p-8 hover:bg-dark-gray/5 dark:hover:bg-white/5 transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden">
              {/* Animated Background Glow */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                animate={{
                  background: [
                    'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 60%)',
                    'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.08) 0%, transparent 60%)',
                    'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 60%)',
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Floating Sync Circles */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={`sync-${i}`}
                  className="absolute rounded-full border border-indigo-400/20 dark:border-indigo-300/20"
                  initial={{
                    x: Math.random() * 100 + '%',
                    y: Math.random() * 100 + '%',
                    opacity: 0,
                    scale: 0,
                  }}
                  animate={{
                    opacity: [0, 0.3, 0],
                    scale: [0, 0.8, 0],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 1,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                    ease: "easeOut"
                  }}
                  style={{
                    width: `${15 + Math.random() * 10}px`,
                    height: `${15 + Math.random() * 10}px`,
                  }}
                />
              ))}

              {/* Content */}
              <div className="relative z-10">
                <div className="text-dark-gray dark:text-white mb-4">
                  {features[5].icon}
                </div>
                <h3 className="text-lg md:text-xl text-dark-gray dark:text-white mb-2 leading-tight font-medium">
                  {features[5].title}
                </h3>
                <p className="text-sm md:text-base text-dark-gray/70 dark:text-white/70 leading-relaxed font-light">
                  {features[5].description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Swiss Grid */}
      <section className="bg-white dark:bg-dark-gray py-16 sm:py-20 md:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 md:gap-12 lg:gap-16 border-t-2 border-dark-gray dark:border-white pt-10 sm:pt-12 md:pt-16">
            <div>
              <CounterStat 
                target={10000} 
                suffix="+" 
                label="Books Available"
                duration={2.5}
              />
            </div>
            <div className="border-t-2 md:border-t-0 md:border-l-2 border-dark-gray dark:border-white pt-8 md:pt-0 md:pl-8 lg:pl-12">
              <CounterStat 
                target={50000} 
                suffix="+" 
                label="Active Readers"
                duration={3}
              />
            </div>
            <div className="border-t-2 md:border-t-0 md:border-l-2 border-dark-gray dark:border-white pt-8 md:pt-0 md:pl-8 lg:pl-12">
              <CounterStat 
                target={4.8} 
                suffix="" 
                label="User Rating"
                duration={2}
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Swiss Style */}
      <section className="bg-dark-gray dark:bg-white py-16 sm:py-20 md:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 lg:gap-16">
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-white dark:text-dark-gray mb-6 sm:mb-8 leading-none">
                Ready to Start
                <br />
                Your Next Chapter?
              </h2>
            </div>
            <div className="border-t-2 border-white dark:border-dark-gray pt-6 sm:pt-8 md:pt-0 md:border-t-0 md:border-l-2 md:pl-8 lg:pl-12 flex flex-col justify-center">
              <p className="text-base sm:text-lg text-white/70 dark:text-dark-gray/70 mb-6 sm:mb-8 font-light">
                Join thousands of readers discovering their next favorite book
              </p>
              <Link 
                to="/books" 
                className="group inline-flex items-center justify-center sm:justify-start gap-3 bg-white dark:bg-dark-gray text-dark-gray dark:text-white px-6 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm font-medium uppercase tracking-widest border-2 border-white dark:border-dark-gray w-full sm:w-fit transition-all duration-300 hover:bg-dark-gray dark:hover:bg-white hover:text-white dark:hover:text-dark-gray overflow-hidden relative touch-manipulation"
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

      <Footer />
    </div>
  )
}

export default LandingPage

