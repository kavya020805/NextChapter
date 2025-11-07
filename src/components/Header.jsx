import { useState } from 'react'
import { Search, User, ChevronDown, Menu, X } from 'lucide-react'

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMyStuffOpen, setIsMyStuffOpen] = useState(false)
  const [isBrowseOpen, setIsBrowseOpen] = useState(false)

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <div className="text-2xl font-bold text-coral">
              Next<span className="text-gray-800">Chapter</span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <button className="text-gray-700 hover:text-coral font-medium transition-colors">
                Home
              </button>
              
              <div className="relative">
                <button 
                  className="text-gray-700 hover:text-coral font-medium flex items-center gap-1 transition-colors"
                  onClick={() => setIsMyStuffOpen(!isMyStuffOpen)}
                >
                  MyStuff
                  <ChevronDown className="w-4 h-4" />
                </button>
                {isMyStuffOpen && (
                  <div className="absolute top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2 w-48">
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700">Reading List</button>
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700">Favorites</button>
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700">History</button>
                  </div>
                )}
              </div>

              <div className="relative">
                <button 
                  className="text-gray-700 hover:text-coral font-medium flex items-center gap-2 transition-colors"
                  onClick={() => setIsBrowseOpen(!isBrowseOpen)}
                >
                  <div className="grid grid-cols-2 gap-0.5">
                    <div className="w-1.5 h-1.5 bg-gray-700 rounded-sm"></div>
                    <div className="w-1.5 h-1.5 bg-gray-700 rounded-sm"></div>
                    <div className="w-1.5 h-1.5 bg-gray-700 rounded-sm"></div>
                    <div className="w-1.5 h-1.5 bg-gray-700 rounded-sm"></div>
                  </div>
                  Browse
                  <ChevronDown className="w-4 h-4" />
                </button>
                {isBrowseOpen && (
                  <div className="absolute top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2 w-48">
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700">All Books</button>
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700">New Releases</button>
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700">Trending</button>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Search and Profile */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 w-72">
              <Search className="w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search books, authors..."
                className="bg-transparent border-none outline-none ml-2 w-full text-sm"
              />
            </div>

            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <User className="w-5 h-5 text-gray-700" />
            </button>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
            <nav className="flex flex-col space-y-2">
              <button className="text-left py-2 text-gray-700 hover:text-coral">Home</button>
              <button className="text-left py-2 text-gray-700 hover:text-coral">MyStuff</button>
              <button className="text-left py-2 text-gray-700 hover:text-coral">Browse</button>
            </nav>
            <div className="mt-4 flex items-center bg-gray-100 rounded-full px-4 py-2">
              <Search className="w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none outline-none ml-2 w-full text-sm"
              />
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header

