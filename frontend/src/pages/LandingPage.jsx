import Header from '../components/Header'
import HeroSection from '../components/HeroSection'
import { BookOpen, Sparkles, Brain, Search, BookMarked, Globe } from 'lucide-react'

function LandingPage() {
  const features = [
    {
      icon: <Search className="w-8 h-8" />,
      title: "Smart Search",
      description: "Find your next favorite book instantly with our intelligent search and advanced filters"
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "AI Recommendations",
      description: "Personalized book suggestions powered by advanced AI to match your unique reading taste"
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Online Reading",
      description: "Elegant, distraction-free reader with customizable themes and seamless reading experience"
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI Summaries",
      description: "Get quick insights and key takeaways with AI-generated book summaries"
    },
    {
      icon: <BookMarked className="w-8 h-8" />,
      title: "Personal Library",
      description: "Save and organize your collection across all devices with cloud sync"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Multimedia Content",
      description: "Enhanced reading with interactive elements and multimedia experiences"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Header />
      <HeroSection />
      
      {/* About Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About NextChapter
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            NextChapter is more than just an online bookstore—it's a revolutionary platform that redefines 
            digital reading. We combine cutting-edge AI technology with a beautifully designed interface 
            to create an unparalleled reading experience. Discover, purchase, and read books with 
            intelligent recommendations, AI-powered summaries, and multimedia-enhanced content that brings 
            stories to life.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 bg-white">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Powerful Features
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need for the perfect reading journey
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group p-8 rounded-2xl border border-gray-200 hover:border-coral hover:shadow-lg transition-all duration-300"
            >
              <div className="text-coral mb-4 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="p-8">
            <div className="text-5xl font-bold text-coral mb-2">10,000+</div>
            <div className="text-gray-600 text-lg">Books Available</div>
          </div>
          <div className="p-8">
            <div className="text-5xl font-bold text-coral mb-2">50,000+</div>
            <div className="text-gray-600 text-lg">Active Readers</div>
          </div>
          <div className="p-8">
            <div className="text-5xl font-bold text-coral mb-2">4.8★</div>
            <div className="text-gray-600 text-lg">User Rating</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-coral to-pink-500 rounded-3xl p-12 md:p-16 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Your Next Chapter?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of readers discovering their next favorite book
          </p>
          <button className="bg-white text-coral px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            Get Started Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="text-2xl font-bold mb-4">
            Next<span className="text-coral">Chapter</span>
          </div>
          <p className="text-gray-400 mb-6">
            Redefining digital reading with AI-powered intelligence
          </p>
          <div className="flex justify-center space-x-6 text-sm text-gray-400">
            <a href="#" className="hover:text-coral transition-colors">About</a>
            <a href="#" className="hover:text-coral transition-colors">Features</a>
            <a href="#" className="hover:text-coral transition-colors">Contact</a>
            <a href="#" className="hover:text-coral transition-colors">Privacy</a>
          </div>
          <div className="mt-8 text-sm text-gray-500">
            © 2025 NextChapter. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage

