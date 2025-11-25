import { ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

function HeroSection() {
  return (
    <section className="bg-dark-gray dark:bg-white py-16 sm:py-24 md:py-32 lg:py-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 lg:gap-16">
          {/* Left Column - Main Content */}
          <div className="md:col-span-8">
            {/* Label */}
            <div className="mb-6 sm:mb-8 md:mb-12">
              <span className="text-xs font-medium uppercase tracking-widest text-white dark:text-dark-gray border-b-2 border-white dark:border-dark-gray pb-2 inline-block">
                AI-Powered Reading
              </span>
            </div>

            {/* Main Heading - Swiss Style */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl xl:text-9xl text-white dark:text-dark-gray mb-8 sm:mb-10 md:mb-12 leading-none tracking-tight">
              Your Next
              <br />
              Chapter
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg md:text-xl text-white/70 dark:text-dark-gray/70 mb-8 sm:mb-12 md:mb-16 max-w-2xl leading-relaxed font-light">
              Discover a revolutionary online bookstore where AI meets literature. 
              Explore thousands of books, get personalized recommendations, and enjoy 
              an immersive reading experience.
            </p>

            {/* CTA Button - Swiss Style with Inversion Animation */}
            <Link 
              to="/books" 
              className="group inline-flex items-center gap-3 bg-white dark:bg-dark-gray text-dark-gray dark:text-white px-6 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm font-medium uppercase tracking-widest border-2 border-white dark:border-dark-gray transition-all duration-300 hover:bg-dark-gray dark:hover:bg-white hover:text-white dark:hover:text-dark-gray overflow-hidden relative touch-manipulation"
            >
              <span className="relative z-10 transition-colors duration-300">Explore Books</span>
              <ArrowRight 
                className="w-4 h-4 relative z-10 transition-all duration-300 -translate-x-5 opacity-0 group-hover:translate-x-0 group-hover:opacity-100" 
              />
            </Link>
          </div>

          {/* Right Column - Stats Grid */}
          <div className="md:col-span-4 border-t-2 border-white dark:border-dark-gray pt-8 sm:pt-10 md:pt-0 md:border-t-0 md:border-l-2 md:pl-8 lg:pl-12">
            <div className="grid grid-cols-3 md:grid-cols-1 gap-8 sm:gap-12 md:gap-16">
              <div>
                <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white dark:text-dark-gray mb-2 sm:mb-3 md:mb-4 leading-none">10K+</div>
                <div className="text-xs font-medium uppercase tracking-widest text-white/60 dark:text-dark-gray/60">Books</div>
              </div>
              <div>
                <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white dark:text-dark-gray mb-2 sm:mb-3 md:mb-4 leading-none">50K+</div>
                <div className="text-xs font-medium uppercase tracking-widest text-white/60 dark:text-dark-gray/60">Readers</div>
              </div>
              <div>
                <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white dark:text-dark-gray mb-2 sm:mb-3 md:mb-4 leading-none">4.8</div>
                <div className="text-xs font-medium uppercase tracking-widest text-white/60 dark:text-dark-gray/60">Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection

