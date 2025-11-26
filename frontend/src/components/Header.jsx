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

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2.5 text-sm uppercase tracking-wider text-dark-gray/60 dark:text-white/60 hover:text-dark-gray dark:hover:text-white flex items-center justify-between transition-colors"
      >
        <span>My Shelf</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
      </button>
      {isOpen && (
        <div className="pl-6 space-y-1 mt-1">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option)}
              className={`w-full text-left px-3 py-2 text-xs uppercase tracking-wider transition-colors ${
                location.pathname === option.path
                  ? 'text-dark-gray dark:text-white bg-dark-gray/5 dark:bg-white/5'
                  : 'text-dark-gray/50 dark:text-white/50 hover:text-dark-gray dark:hover:text-white'
              }`}
            >
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
    { label: 'New Releases', value: 'new-releases', path: '/new-releases' },
    { label: 'Highest Rated', value: 'rated', path: '/highest-rated' },
    { label: 'Recommendations', value: 'recommended', path: '/recommended' },
    { label: 'Explore', value: 'explore', path: '/explore' }
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
                      : option.value === 'explore'
                        ? location.pathname === '/explore'
                      : option.value === 'trending'
                        ? location.pathname === '/trending'
                      : option.value === 'new-releases'
                        ? location.pathname === '/new-releases'
                      : option.value === 'rated'
                        ? location.pathname === '/highest-rated'
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
  const [username, setUsername] = useState(null)
  const location = useLocation()

  useEffect(() => {
    const loadProfileData = async () => {
      if (!user?.id) {
        setProfilePhotoUrl(null)
        setUsername(null)
        return
      }
      try {
        const profile = await getUserProfile(user.id)
        if (profile?.profile_photo_url) {
          setProfilePhotoUrl(profile.profile_photo_url)
        } else {
          setProfilePhotoUrl(null)
        }
        if (profile?.username) {
          setUsername(profile.username)
        } else {
          setUsername(null)
        }
      } catch (error) {
        console.error('Error loading profile data:', error)
        setProfilePhotoUrl(null)
        setUsername(null)
      }
    }
    loadProfileData()
    
    // Listen for profile updates
    const handleProfileUpdate = (event) => {
      if (event.detail?.profile_photo_url !== undefined) {
        setProfilePhotoUrl(event.detail.profile_photo_url)
      }
      if (event.detail?.username !== undefined) {
        setUsername(event.detail.username)
      }
      // If no specific fields in event, reload from database
      if (!event.detail?.profile_photo_url && !event.detail?.username) {
        loadProfileData()
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
                    {username || user?.email?.split('@')[0] || user?.email || 'User'}
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
  const [username, setUsername] = useState(null)
  const { isDark, toggleTheme } = useTheme()
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const loadProfileData = async () => {
      if (!user?.id) {
        setProfilePhotoUrl(null)
        setUsername(null)
        return
      }
      try {
        const profile = await getUserProfile(user.id)
        if (profile?.profile_photo_url) {
          setProfilePhotoUrl(profile.profile_photo_url)
        } else {
          setProfilePhotoUrl(null)
        }
        if (profile?.username) {
          setUsername(profile.username)
        } else {
          setUsername(null)
        }
      } catch (error) {
        console.error('Error loading profile data:', error)
        setProfilePhotoUrl(null)
        setUsername(null)
      }
    }
    loadProfileData()
    
    // Listen for profile updates
    const handleProfileUpdate = (event) => {
      if (event.detail?.profile_photo_url !== undefined) {
        setProfilePhotoUrl(event.detail.profile_photo_url)
      }
      if (event.detail?.username !== undefined) {
        setUsername(event.detail.username)
      }
      // If no specific fields in event, reload from database
      if (!event.detail?.profile_photo_url && !event.detail?.username) {
        loadProfileData()
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex items-center justify-between">
          {/* Logo - Left aligned */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img
                src="/LOGO.svg"
                alt="NextChapter logo"
                className="h-7 sm:h-8 md:h-10 w-auto"
              />
            </Link>
          </div>
          
          {/* Desktop Navigation - Centered */}
          <nav className="hidden md:flex items-center justify-center flex-1 gap-8 lg:gap-12 mx-8">
            <Link to="/books" className={`text-xs font-medium uppercase tracking-widest transition-colors ${location.pathname === '/books' ? 'text-dark-gray dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-dark-gray dark:hover:text-white'}`}>
              Library
            </Link>
            <LibraryDropdown location={location} />
            <Link 
              to="/subscription" 
              className={`bg-dark-gray dark:bg-white text-white dark:text-dark-gray px-4 lg:px-6 py-2 text-xs font-medium uppercase tracking-widest hover:scale-105 subscription-glow ${
                location.pathname === '/subscription' ? 'opacity-100' : ''
              }`}
            >
              Subscription
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center justify-end gap-3 lg:gap-4">
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
          <div className="md:hidden flex items-center">
            <button 
              className="p-2 hover:bg-dark-gray/5 dark:hover:bg-white/5 transition-colors touch-manipulation"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-dark-gray dark:text-white" />
              ) : (
                <Menu className="w-6 h-6 text-dark-gray dark:text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Minimal Design */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 pb-3 border-t border-dark-gray/10 dark:border-white/10 pt-3">
            <nav className="flex flex-col space-y-1">
              {/* Library Link */}
              <Link 
                to="/books" 
                onClick={() => setIsMenuOpen(false)}
                className={`px-3 py-2.5 text-sm uppercase tracking-wider transition-colors ${
                  location.pathname === '/books' 
                    ? 'text-dark-gray dark:text-white bg-dark-gray/5 dark:bg-white/5' 
                    : 'text-dark-gray/60 dark:text-white/60 hover:text-dark-gray dark:hover:text-white'
                }`}
              >
                Library
              </Link>

              {/* My Shelf Submenu */}
              <LibraryDropdownMobile />

              {/* Subscription Link */}
              <Link 
                to="/subscription"
                onClick={() => setIsMenuOpen(false)}
                className="mx-3 mt-2 bg-dark-gray dark:bg-white text-white dark:text-dark-gray px-4 py-2.5 text-xs uppercase tracking-widest text-center font-medium transition-all hover:opacity-90"
              >
                Subscription
              </Link>

              {/* Divider */}
              <div className="h-px bg-dark-gray/10 dark:bg-white/10 my-2"></div>

              {/* User Section */}
              {user ? (
                <>
                  {/* User Info */}
                  <div className="px-3 py-2 flex items-center gap-2">
                    {profilePhotoUrl ? (
                      <img
                        src={profilePhotoUrl}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover border border-dark-gray/20 dark:border-white/20"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextElementSibling.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    <div className={`w-8 h-8 rounded-full bg-dark-gray/10 dark:bg-white/10 items-center justify-center ${profilePhotoUrl ? 'hidden' : 'flex'}`}>
                      <User className="w-4 h-4 text-dark-gray dark:text-white" />
                    </div>
                    <span className="text-xs text-dark-gray/60 dark:text-white/60 truncate flex-1">
                      {username || user.email?.split('@')[0] || user.email}
                    </span>
                  </div>

                  {/* Profile Link */}
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className={`px-3 py-2.5 text-sm uppercase tracking-wider transition-colors flex items-center gap-2 ${
                      location.pathname === '/profile'
                        ? 'text-dark-gray dark:text-white bg-dark-gray/5 dark:bg-white/5'
                        : 'text-dark-gray/60 dark:text-white/60 hover:text-dark-gray dark:hover:text-white'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>

                  {/* Logout Button */}
                  <button
                    onClick={() => {
                      setIsMenuOpen(false)
                      handleSignOut()
                    }}
                    className="px-3 py-2.5 text-sm uppercase tracking-wider text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <Link 
                  to="/sign-in"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-3 py-2.5 text-sm uppercase tracking-wider text-dark-gray/60 dark:text-white/60 hover:text-dark-gray dark:hover:text-white transition-colors"
                >
                  Sign In
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header

