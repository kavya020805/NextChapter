import { useState } from 'react'
import { Menu, X, Moon, Sun } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isDark, toggleTheme } = useTheme()

  return (
    <header className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="#home" className="flex items-center">
            <img 
              src={isDark ? "/Union-dark.svg" : "/Union.svg"} 
              alt="NextChapter Logo" 
              className="h-8 w-auto transition-opacity duration-300"
            />
          </a>
          
          {/* Desktop Navigation - Centered */}
          <nav className="hidden md:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
            <a href="#home" className="text-gray-700 dark:text-gray-300 hover:text-coral dark:hover:text-coral font-medium transition-colors">
              Home
            </a>
            <a href="#mylibrary" className="text-gray-700 dark:text-gray-300 hover:text-coral dark:hover:text-coral font-medium transition-colors">
              MyLibrary
            </a>
            <button className="bg-coral hover:bg-pink-500 text-white px-6 py-2 rounded-full font-semibold transition-all duration-300 shadow-md hover:shadow-lg">
              Subscription
            </button>
          </nav>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="text-gray-700 dark:text-gray-300 hover:text-coral dark:hover:text-coral font-medium transition-colors">
              Sign In
            </button>
            
            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-gray-300" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" />
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button 
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-gray-300" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" />
              )}
            </button>
            <button 
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-100 dark:border-gray-800 pt-4 animate-fade-in">
            <nav className="flex flex-col space-y-3">
              <a href="#home" className="text-gray-700 dark:text-gray-300 hover:text-coral font-medium py-2 transition-colors">
                Home
              </a>
              <a href="#mylibrary" className="text-gray-700 dark:text-gray-300 hover:text-coral font-medium py-2 transition-colors">
                MyLibrary
              </a>
              <button className="w-full bg-coral hover:bg-pink-500 text-white px-6 py-2.5 rounded-full font-semibold transition-all text-left">
                Subscription
              </button>
              <div className="pt-2">
                <button className="w-full text-left text-gray-700 dark:text-gray-300 hover:text-coral font-medium py-2 transition-colors">
                  Sign In
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

