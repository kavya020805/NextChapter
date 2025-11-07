import { useState } from 'react'
import { Menu, X } from 'lucide-react'

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="text-2xl font-bold">
            <span className="text-coral">Next</span>
            <span className="text-gray-900">Chapter</span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-gray-700 hover:text-coral font-medium transition-colors">
              Home
            </a>
            <a href="#about" className="text-gray-700 hover:text-coral font-medium transition-colors">
              About
            </a>
            <a href="#features" className="text-gray-700 hover:text-coral font-medium transition-colors">
              Features
            </a>
            <a href="#contact" className="text-gray-700 hover:text-coral font-medium transition-colors">
              Contact
            </a>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="text-gray-700 hover:text-coral font-medium transition-colors">
              Sign In
            </button>
            <button className="bg-coral hover:bg-pink-500 text-white px-6 py-2.5 rounded-full font-semibold transition-all duration-300 shadow-md hover:shadow-lg">
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-100 pt-4 animate-fade-in">
            <nav className="flex flex-col space-y-3">
              <a href="#home" className="text-gray-700 hover:text-coral font-medium py-2 transition-colors">
                Home
              </a>
              <a href="#about" className="text-gray-700 hover:text-coral font-medium py-2 transition-colors">
                About
              </a>
              <a href="#features" className="text-gray-700 hover:text-coral font-medium py-2 transition-colors">
                Features
              </a>
              <a href="#contact" className="text-gray-700 hover:text-coral font-medium py-2 transition-colors">
                Contact
              </a>
              <div className="pt-2 space-y-2">
                <button className="w-full text-left text-gray-700 hover:text-coral font-medium py-2 transition-colors">
                  Sign In
                </button>
                <button className="w-full bg-coral hover:bg-pink-500 text-white px-6 py-2.5 rounded-full font-semibold transition-all">
                  Get Started
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header

