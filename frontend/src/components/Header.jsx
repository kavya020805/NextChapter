import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useSearchParams, useNavigate } from 'react-router-dom'
import { Menu, X, ChevronDown, LogOut, User, UserCircle, Grid3x3 } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { getUserProfile } from '../lib/personalizationUtils'

function LibraryDropdown({ location }) {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const closeTimeoutRef = useRef(null)

  const options = [
    { value: 'all', label: 'All Books', path: '/books' },
    { value: 'wishlist', label: 'Reading List', path: '/reading-list' },
    { value: 'read', label: 'Already Read', path: '/already-read' }
  ]

  const handleSelect = (option) => {
    navigate(option.path)
    setIsOpen(false)
  }

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 200) // 200ms delay before closing
  }

  const currentOption = options.find(opt => location.pathname === opt.path) || options[0]
  const currentLabel = currentOption.label

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className={`text-xs font-medium uppercase tracking-widest transition-colors flex items-center space-x-2 cursor-pointer ${
          location.pathname === '/books' ? 'text-dark-gray dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-dark-gray dark:hover:text-white'
        }`}
      >
        <span>My Shelf</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
      </button>
      {isOpen && (
        <div 
          className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-56 bg-white dark:bg-dark-gray border border-dark-gray/20 dark:border-white/20 shadow-xl z-20 overflow-hidden backdrop-blur-sm"
          style={{ 
            animation: 'slideDown 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            transformOrigin: 'top center',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
            {options.map((option, index) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option)}
                className={`w-full text-left px-5 py-3.5 text-xs font-medium uppercase tracking-widest transition-all duration-200 ease-out cursor-pointer relative ${
                  location.pathname === option.path
                    ? 'bg-dark-gray dark:bg-white text-white dark:text-dark-gray'
                    : 'text-dark-gray dark:text-white hover:bg-dark-gray/8 dark:hover:bg-white/8 hover:pl-6'
                } ${index < options.length - 1 ? 'border-b border-dark-gray/10 dark:border-white/10' : ''}`}
                style={{
                  animation: `fadeIn 0.2s ease-out ${index * 0.03}s both`
                }}
              >
                {location.pathname === option.path && (
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-1 bg-white dark:bg-dark-gray rounded-full"></span>
                )}
                {option.label}
              </button>
            ))}
        </div>
      )}
    </div>
  )
}

function LibraryDropdownMobile() {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const options = [
    { value: 'all', label: 'All Books', path: '/books' },
    { value: 'wishlist', label: 'Reading List', path: '/reading-list' },
    { value: 'read', label: 'Already Read', path: '/already-read' }
  ]

  const handleSelect = (option) => {
    navigate(option.path)
    setIsOpen(false)
  }

  const currentOption = options.find(opt => location.pathname === opt.path) || options[0]
  const currentLabel = currentOption.label

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left font-medium py-2 text-gray-700 dark:text-gray-300 hover:text-coral flex items-center justify-between transition-colors duration-200 cursor-pointer"
      >
        <span>My Shelf: {currentLabel}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
      </button>
      {isOpen && (
        <div 
          className="mt-3 space-y-1.5 pl-4 overflow-hidden border-l-2 border-coral/20 dark:border-coral/30"
          style={{ animation: 'slideDown 0.25s cubic-bezier(0.4, 0, 0.2, 1)' }}
        >
          {options.map((option, index) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option)}
              className={`w-full text-left py-2.5 px-4 text-sm transition-all duration-200 ease-out cursor-pointer relative ${
                location.pathname === option.path
                  ? 'bg-coral/15 dark:bg-coral/20 text-coral font-semibold shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-coral hover:bg-gray-100/80 dark:hover:bg-gray-700/80 hover:translate-x-1'
              }`}
              style={{
                animation: `fadeIn 0.2s ease-out ${index * 0.04}s both`
              }}
            >
              {location.pathname === option.path && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-1 h-6 bg-coral rounded-r-full"></span>
              )}
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function FilterDropdown({ location, navigate }) {
  const [isOpen, setIsOpen] = useState(false)
  const closeTimeoutRef = useRef(null)

  const genres = [
    'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction',
    'Fantasy', 'Thriller', 'Horror', 'Biography', 'History',
    'Philosophy', 'Poetry', 'Drama', 'Adventure', 'Comedy'
  ]

  const filterOptions = [
    { label: 'Trending', value: 'trending', path: '/trending' },
    { label: 'New Releases', value: 'new', path: '/books?filter=new' },
    { label: 'Highest Rated', value: 'rated', path: '/highest-rated' },
    { label: 'Recommendations', value: 'recommended', path: '/recommended' }
  ]

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 200)
  }

  const handleGenreClick = (genre) => {
    navigate(`/books?genre=${genre.toLowerCase()}`)
    setIsOpen(false)
  }

  const handleFilterClick = (option) => {
    navigate(option.path)
    setIsOpen(false)
  }

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center p-2 hover:opacity-80 transition-opacity"
        aria-label="Filter and genres menu"
      >
        <div className="grid grid-cols-3 gap-0.5 w-4 h-4">
          <div className="w-0.5 h-0.5 rounded-full bg-dark-gray dark:bg-white"></div>
          <div className="w-0.5 h-0.5 rounded-full bg-dark-gray dark:bg-white"></div>
          <div className="w-0.5 h-0.5 rounded-full bg-dark-gray dark:bg-white"></div>
          <div className="w-0.5 h-0.5 rounded-full bg-dark-gray dark:bg-white"></div>
          <div className="w-0.5 h-0.5 rounded-full bg-dark-gray dark:bg-white"></div>
          <div className="w-0.5 h-0.5 rounded-full bg-dark-gray dark:bg-white"></div>
          <div className="w-0.5 h-0.5 rounded-full bg-dark-gray dark:bg-white"></div>
          <div className="w-0.5 h-0.5 rounded-full bg-dark-gray dark:bg-white"></div>
          <div className="w-0.5 h-0.5 rounded-full bg-dark-gray dark:bg-white"></div>
        </div>
      </button>
      {isOpen && (
        <div 
          className="absolute top-full right-0 mt-3 w-96 bg-white dark:bg-dark-gray border border-dark-gray/20 dark:border-white/20 shadow-xl z-20 overflow-hidden backdrop-blur-sm"
          style={{ 
            animation: 'slideDown 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            transformOrigin: 'top right',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="grid grid-cols-2 divide-x divide-dark-gray/10 dark:divide-white/10">
            {/* Genres Column */}
            <div className="p-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-dark-gray dark:text-white mb-3 pb-2 border-b border-dark-gray/10 dark:border-white/10">
                Genres
              </h3>
              <div className="space-y-0 max-h-80 overflow-y-auto">
                {genres.map((genre, index) => {
                  const isActive = location.search.includes(`genre=${genre.toLowerCase()}`)
                  return (
                    <button
                      key={genre}
                      onClick={() => handleGenreClick(genre)}
                      className={`w-full text-left px-5 py-3.5 text-xs font-medium uppercase tracking-widest transition-all duration-200 ease-out cursor-pointer relative ${
                        isActive
                          ? 'bg-dark-gray dark:bg-white text-white dark:text-dark-gray'
                          : 'text-dark-gray dark:text-white hover:bg-dark-gray/8 dark:hover:bg-white/8 hover:pl-6'
                      }`}
                      style={{
                        animation: `fadeIn 0.2s ease-out ${index * 0.02}s both`
                      }}
                    >
                      {isActive && (
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-1 bg-white dark:bg-dark-gray rounded-full"></span>
                      )}
                      {genre}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Filter Options Column */}
            <div className="p-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-dark-gray dark:text-white mb-3 pb-2 border-b border-dark-gray/10 dark:border-white/10">
                Filters
              </h3>
              <div className="space-y-1">
                {filterOptions.map((option, index) => {
                  const isActive =
                    option.value === 'recommended'
                      ? location.pathname === '/recommended'
                      : location.search.includes(option.value)

                  return (
                    <button
                      key={option.value}
                      onClick={() => handleFilterClick(option)}
                      className={`w-full text-left px-3 py-2 text-xs font-medium uppercase tracking-widest transition-all duration-200 ease-out cursor-pointer relative ${
                        isActive
                          ? 'bg-dark-gray dark:bg-white text-white dark:text-dark-gray'
                          : 'text-dark-gray dark:text-white hover:bg-dark-gray/8 dark:hover:bg-white/8 hover:pl-4'
                      }`}
                      style={{
                        animation: `fadeIn 0.2s ease-out ${index * 0.02}s both`
                      }}
                    >
                      {isActive && (
                        <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-1 bg-white dark:bg-dark-gray rounded-full"></span>
                      )}
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ProfileDropdown({ user, onSignOut }) {
  const [isOpen, setIsOpen] = useState(false)
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null)
  const location = useLocation()

  useEffect(() => {
    const loadProfilePhoto = async () => {
      if (!user?.id) {
        setProfilePhotoUrl(null)
        return
      }
      try {
        const profile = await getUserProfile(user.id)
        if (profile?.profile_photo_url) {
          setProfilePhotoUrl(profile.profile_photo_url)
        } else {
          setProfilePhotoUrl(null)
        }
      } catch (error) {
        console.error('Error loading profile photo:', error)
        setProfilePhotoUrl(null)
      }
    }
    loadProfilePhoto()
    
    // Listen for profile updates
    const handleProfileUpdate = (event) => {
      if (event.detail?.profile_photo_url !== undefined) {
        setProfilePhotoUrl(event.detail.profile_photo_url)
      } else {
        // If no URL in event, reload from database
        loadProfilePhoto()
      }
    }
    
    window.addEventListener('profileUpdated', handleProfileUpdate)
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate)
    }
  }, [user])

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center p-1 hover:opacity-80 transition-opacity"
        aria-label="User profile menu"
      >
        {profilePhotoUrl ? (
          <img
            src={profilePhotoUrl}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover border-2 border-dark-gray/30 dark:border-white/30"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextElementSibling.style.display = 'block'
            }}
          />
        ) : null}
        <User className={`w-10 h-10 text-dark-gray dark:text-white p-2 rounded-full border-2 border-dark-gray/30 dark:border-white/30 ${profilePhotoUrl ? 'hidden' : ''}`} />
      </button>
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10 bg-dark-gray/10 dark:bg-dark-gray/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            style={{ 
              animation: 'fadeIn 0.2s ease-out',
            }}
          />
          <div 
            className="absolute top-full right-0 mt-3 w-64 bg-white dark:bg-dark-gray border border-dark-gray/20 dark:border-white/20 shadow-xl z-20 overflow-hidden backdrop-blur-sm"
            style={{ 
              animation: 'slideDown 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              transformOrigin: 'top right',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div className="px-5 py-4 border-b border-dark-gray/10 dark:border-white/10 bg-dark-gray/5 dark:bg-white/5">
              <div className="flex items-center gap-3">
                {profilePhotoUrl ? (
                  <>
                    <img
                      src={profilePhotoUrl}
                      alt="Profile"
                      className="w-12 h-12 rounded-full object-cover border-2 border-dark-gray/20 dark:border-white/20"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextElementSibling.style.display = 'flex'
                      }}
                    />
                    <div className="w-12 h-12 rounded-full bg-dark-gray dark:bg-white items-center justify-center hidden" style={{ display: 'none' }}>
                      <UserCircle className="w-7 h-7 text-white dark:text-dark-gray" />
                    </div>
                  </>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-dark-gray dark:bg-white flex items-center justify-center">
                    <UserCircle className="w-7 h-7 text-white dark:text-dark-gray" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-widest text-dark-gray dark:text-white truncate">
                    {user?.email || 'User'}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Account</p>
                </div>
              </div>
            </div>
            <div className="py-2">
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 w-full text-left px-5 py-3.5 text-xs font-medium uppercase tracking-widest transition-all duration-200 ease-out cursor-pointer relative ${
                  location.pathname === '/profile'
                    ? 'bg-dark-gray dark:bg-white text-white dark:text-dark-gray'
                    : 'text-dark-gray dark:text-white hover:bg-dark-gray/8 dark:hover:bg-white/8 hover:pl-6'
                }`}
              >
                {location.pathname === '/profile' && (
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-1 bg-white dark:bg-dark-gray rounded-full"></span>
                )}
                <User className="w-4 h-4" />
                <span>User Profile</span>
              </Link>
              <button
                onClick={() => {
                  setIsOpen(false)
                  onSignOut()
                }}
                className="flex items-center gap-3 w-full text-left px-5 py-3.5 text-xs font-medium uppercase tracking-widest text-dark-gray dark:text-white hover:bg-red-500 dark:hover:bg-red-600 hover:text-white transition-all duration-200 ease-out cursor-pointer border-t border-dark-gray/10 dark:border-white/10"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null)
  const { isDark, toggleTheme } = useTheme()
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const loadProfilePhoto = async () => {
      if (!user?.id) {
        setProfilePhotoUrl(null)
        return
      }
      try {
        const profile = await getUserProfile(user.id)
        if (profile?.profile_photo_url) {
          setProfilePhotoUrl(profile.profile_photo_url)
        } else {
          setProfilePhotoUrl(null)
        }
      } catch (error) {
        console.error('Error loading profile photo:', error)
        setProfilePhotoUrl(null)
      }
    }
    loadProfilePhoto()
    
    // Listen for profile updates
    const handleProfileUpdate = (event) => {
      if (event.detail?.profile_photo_url !== undefined) {
        setProfilePhotoUrl(event.detail.profile_photo_url)
      } else {
        // If no URL in event, reload from database
        loadProfilePhoto()
      }
    }
    
    window.addEventListener('profileUpdated', handleProfileUpdate)
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate)
    }
  }, [user])

  const handleSignOut = async () => {
    try {
      setIsMenuOpen(false)
      const { error } = await signOut()
      if (error) {
        console.error('Sign out error:', error)
        // Still try to redirect even if there's an error
      }
      // Navigation handled by SIGNED_OUT event in AuthContext
    } catch (err) {
      console.error('Sign out exception:', err)
    }
  }

  return (
    <header className="bg-white dark:bg-dark-gray border-b border-dark-gray dark:border-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="grid grid-cols-12 items-center gap-4">
          {/* Logo - Left aligned */}
          <div className="col-span-3">
            <Link to="/" className="flex items-center">
              <span 
                className="text-dark-gray dark:text-white text-4xl whitespace-nowrap" 
                style={{ fontFamily: 'MigraItalic, serif' }}
              >
                Next Chapter
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation - Centered grid */}
          <nav className="hidden md:flex items-center justify-center col-span-6 gap-12">
            <Link to="/books" className={`text-xs font-medium uppercase tracking-widest transition-colors ${location.pathname === '/books' ? 'text-dark-gray dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-dark-gray dark:hover:text-white'}`}>
              Library
            </Link>
            <LibraryDropdown location={location} />
            <Link 
              to="/subscription" 
              className={`bg-dark-gray dark:bg-white text-white dark:text-dark-gray px-6 py-2 text-xs font-medium uppercase tracking-widest hover:scale-105 subscription-glow ${
                location.pathname === '/subscription' ? 'opacity-100' : ''
              }`}
            >
              Subscription
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center justify-end col-span-3 gap-4">
            <FilterDropdown location={location} navigate={navigate} />
            
            {user ? (
              <ProfileDropdown user={user} onSignOut={handleSignOut} />
            ) : (
              <Link 
                to="/sign-in" 
                className={`text-xs font-medium uppercase tracking-widest transition-opacity hover:opacity-60 ${
                  location.pathname === '/sign-in' 
                    ? 'text-dark-gray dark:text-white opacity-100' 
                    : 'text-dark-gray dark:text-white'
                }`}
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
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
          <div className="md:hidden mt-4 pb-4 border-t border-dark-gray/20 dark:border-white/20 pt-4 animate-fade-in">
            <nav className="flex flex-col space-y-3">
              <Link to="/books" className={`font-medium py-2 transition-colors ${location.pathname === '/books' ? 'text-coral' : 'text-dark-gray/70 dark:text-white/70 hover:text-coral'}`}>
                Library
              </Link>
              <LibraryDropdownMobile />
              <Link 
                to="/subscription" 
                className="w-full bg-coral hover:bg-pink-500 text-white px-6 py-2.5 rounded-full font-medium hover:scale-105 subscription-glow text-left"
              >
                Subscription
              </Link>
              <div className="pt-2">
                {user ? (
                  <>
                    <div className="px-4 py-2 text-sm text-dark-gray/70 dark:text-white/70 border-b border-dark-gray/20 dark:border-white/20 mb-2">
                      <div className="flex items-center gap-2 mb-1">
                        {profilePhotoUrl ? (
                          <>
                            <img
                              src={profilePhotoUrl}
                              alt="Profile"
                              className="w-5 h-5 rounded-full object-cover border border-dark-gray/20 dark:border-white/20"
                              onError={(e) => {
                                e.target.style.display = 'none'
                                e.target.nextElementSibling.style.display = 'block'
                              }}
                            />
                            <UserCircle className="w-5 h-5 hidden" />
                          </>
                        ) : (
                          <UserCircle className="w-5 h-5" />
                        )}
                        <span className="font-medium truncate">{user.email}</span>
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className={`w-full text-left font-medium py-2 transition-colors flex items-center gap-2 ${
                        location.pathname === '/profile'
                          ? 'text-coral'
                          : 'text-dark-gray/70 dark:text-white/70 hover:text-coral'
                      }`}
                    >
                      <User className="w-4 h-4" />
                      User Profile
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left text-dark-gray/70 dark:text-white/70 hover:bg-red-500 dark:hover:bg-red-600 hover:text-white font-medium py-2 px-3 transition-all duration-200 ease-out flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <Link 
                    to="/sign-in" 
                    className="w-full text-left text-dark-gray/70 dark:text-white/70 hover:text-coral font-medium py-2 transition-colors"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header

