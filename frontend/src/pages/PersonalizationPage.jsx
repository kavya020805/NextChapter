import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ArrowLeft, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { hasCompletedPersonalization } from '../lib/personalizationUtils'

function PersonalizationPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  
  // Step 1 - Basic Info
  const [username, setUsername] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [gender, setGender] = useState('')
  
  // Step 2 - Favorite Authors
  const [selectedAuthors, setSelectedAuthors] = useState([])
  const [authorInput, setAuthorInput] = useState('')
  const [authorSuggestions, setAuthorSuggestions] = useState([])
  const [loadingAuthors, setLoadingAuthors] = useState(false)
  const [showAuthorDropdown, setShowAuthorDropdown] = useState(false)
  const authorTimeoutRef = useRef(null)
  const authorDropdownRef = useRef(null)
  
  // Step 3 - Genres
  const [selectedGenres, setSelectedGenres] = useState([])
  const genres = [
    'Fiction',
    'Non-Fiction',
    'Mystery',
    'Romance',
    'Science Fiction',
    'Fantasy',
    'Biography',
    'History',
    'Self-Help',
    'Poetry'
  ]
  
  // Step 4 - Languages
  const [selectedLanguages, setSelectedLanguages] = useState([])
  const languages = [
    'English',
    'Hindi',
    'Spanish',
    'French',
    'German',
    'Mandarin'
  ]

  useEffect(() => {
    // Check if user has already completed personalization
    const checkPersonalization = async () => {
      if (!user) return
      
      const completed = await hasCompletedPersonalization(user.id)
      if (completed) {
        navigate('/books')
      }
    }
    
    checkPersonalization()
  }, [navigate, user])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (authorDropdownRef.current && !authorDropdownRef.current.contains(event.target)) {
        setShowAuthorDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Search authors from Open Library API
  const searchAuthors = async (query) => {
    if (!query.trim() || query.length < 2) {
      setAuthorSuggestions([])
      setShowAuthorDropdown(false)
      return
    }

    setLoadingAuthors(true)
    try {
      const response = await fetch(
        `https://openlibrary.org/search/authors.json?q=${encodeURIComponent(query)}&limit=10`
      )
      const data = await response.json()
      
      const authors = data.docs
        .filter(author => author.name)
        .map(author => ({
          name: author.name,
          key: author.key,
          work_count: author.work_count || 0
        }))
        .slice(0, 8) // Limit to 8 suggestions
      
      setAuthorSuggestions(authors)
      setShowAuthorDropdown(authors.length > 0)
    } catch (error) {
      console.error('Error fetching authors:', error)
      setAuthorSuggestions([])
    } finally {
      setLoadingAuthors(false)
    }
  }

  // Handle author input with debouncing
  const handleAuthorInputChange = (e) => {
    const value = e.target.value
    setAuthorInput(value)

    // Clear previous timeout
    if (authorTimeoutRef.current) {
      clearTimeout(authorTimeoutRef.current)
    }

    // Set new timeout for debounced search
    authorTimeoutRef.current = setTimeout(() => {
      searchAuthors(value)
    }, 300)
  }

  // Add author to selected list
  const addAuthor = (author) => {
    if (!selectedAuthors.find(a => a.name === author.name)) {
      setSelectedAuthors([...selectedAuthors, author])
    }
    setAuthorInput('')
    setAuthorSuggestions([])
    setShowAuthorDropdown(false)
  }

  // Remove author from selected list
  const removeAuthor = (authorName) => {
    setSelectedAuthors(selectedAuthors.filter(a => a.name !== authorName))
  }

  const handleGenreToggle = (genre) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    )
  }

  const handleLanguageToggle = (language) => {
    setSelectedLanguages(prev => 
      prev.includes(language) 
        ? prev.filter(l => l !== language)
        : [...prev, language]
    )
  }

  const handleDateOfBirthChange = (e) => {
    const raw = e.target.value
    if (!raw) {
      setDateOfBirth('')
      return
    }

    const parts = raw.split('-')
    const yearPart = (parts[0] || '').replace(/\D/g, '').slice(0, 4)
    const rest = parts.slice(1).join('-')
    const normalized = rest ? `${yearPart}-${rest}` : yearPart

    setDateOfBirth(normalized)
  }

  const handleNext = async () => {
    if (currentStep === 1) {
      if (!username || !dateOfBirth || !gender) {
        alert('Please fill in all fields')
        return
      }
    }
    
    if (currentStep === 4) {
      // Save all personalization data to Supabase
      try {
        const personalizationData = {
          user_id: user.id,
          username,
          date_of_birth: dateOfBirth,
          gender,
          favorite_authors: selectedAuthors.map(a => a.name),
          genres: selectedGenres,
          languages: selectedLanguages,
          completed_at: new Date().toISOString()
        }
        
        // Upsert (insert or update) the user profile
        const { error } = await supabase
          .from('user_profiles')
          .upsert(personalizationData, { onConflict: 'user_id' })
        
        if (error) {
          console.error('Error saving personalization:', error)
          alert('Failed to save your preferences. Please try again.')
          return
        }
        
        // Navigate to books page
        navigate('/books')
      } catch (error) {
        console.error('Error:', error)
        alert('An error occurred. Please try again.')
      }
      return
    }
    
    setCurrentStep(prev => prev + 1)
  }

  const handleBack = () => {
    setCurrentStep(prev => prev - 1)
  }

  const handleSkip = () => {
    if (currentStep === 4) {
      handleNext()
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  return (
    <div className="min-h-screen bg-dark-gray dark:bg-white flex flex-col items-center justify-center px-4 py-8">
      {/* Progress Indicator */}
      <div className="w-full mb-12 flex flex-col items-center">
        <div className="flex items-center justify-center mb-4">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div 
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all ${
                  currentStep >= step 
                    ? 'bg-white dark:bg-dark-gray border-white dark:border-dark-gray text-dark-gray dark:text-white' 
                    : 'bg-transparent border-white/30 dark:border-dark-gray/30 text-white/30 dark:text-dark-gray/30'
                }`}
              >
                {step}
              </div>
              {step < 4 && (
                <div 
                  className={`w-16 h-0.5 mx-2 transition-all ${
                    currentStep > step 
                      ? 'bg-white dark:bg-dark-gray' 
                      : 'bg-white/30 dark:bg-dark-gray/30'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="text-center">
          <span className="text-xs font-medium uppercase tracking-widest text-white/60 dark:text-dark-gray/60">
            Step {currentStep} of 4
          </span>
        </div>
      </div>

      <div className="w-full max-w-2xl">

        {/* Step 1 - Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl text-white dark:text-dark-gray mb-4 leading-none">
                Let's Get Started
              </h1>
              <p className="text-white/70 dark:text-dark-gray/70 text-sm uppercase tracking-widest">
                Tell us a bit about yourself
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-medium uppercase tracking-widest text-white/60 dark:text-dark-gray/60 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full bg-transparent border-2 border-white dark:border-dark-gray px-4 py-3 text-white dark:text-dark-gray placeholder-white/40 dark:placeholder-dark-gray/40 focus:outline-none text-sm uppercase tracking-widest"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-widest text-white/60 dark:text-dark-gray/60 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={handleDateOfBirthChange}
                  className="w-full bg-transparent border-2 border-white dark:border-dark-gray px-4 py-3 text-black dark:text-dark-gray focus:outline-none text-sm uppercase tracking-widest"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-widest text-white/60 dark:text-dark-gray/60 mb-2">
                  Gender
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {['Male', 'Female', 'Other'].map((option) => (
                    <button
                      key={option}
                      onClick={() => setGender(option)}
                      className={`py-3 border-2 text-sm font-medium uppercase tracking-widest transition-all ${
                        gender === option
                          ? 'bg-white dark:bg-dark-gray border-white dark:border-dark-gray text-dark-gray dark:text-white'
                          : 'bg-transparent border-white dark:border-dark-gray text-white dark:text-dark-gray hover:bg-white/10 dark:hover:bg-dark-gray/10'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 - Favorite Authors */}
        {currentStep === 2 && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl text-white dark:text-dark-gray mb-4 leading-none">
                Favorite Authors
              </h1>
              <p className="text-white/70 dark:text-dark-gray/70 text-sm uppercase tracking-widest">
                Who are your favorite authors?
              </p>
            </div>

            <div className="space-y-4">
              {/* Selected Authors Display */}
              {selectedAuthors.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedAuthors.map((author) => (
                    <div
                      key={author.key}
                      className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-dark-gray border-2 border-white dark:border-dark-gray text-dark-gray dark:text-white text-sm"
                    >
                      <span>{author.name}</span>
                      <button
                        onClick={() => removeAuthor(author.name)}
                        className="hover:opacity-70 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Author Search Input */}
              <div className="relative" ref={authorDropdownRef}>
                <label className="block text-xs font-medium uppercase tracking-widest text-white/60 dark:text-dark-gray/60 mb-2">
                  Search Authors
                </label>
                <input
                  type="text"
                  value={authorInput}
                  onChange={handleAuthorInputChange}
                  onFocus={() => {
                    if (authorSuggestions.length > 0) {
                      setShowAuthorDropdown(true)
                    }
                  }}
                  placeholder="Start typing author name..."
                  className="w-full bg-transparent border-2 border-white dark:border-dark-gray px-4 py-3 text-white dark:text-dark-gray placeholder-white/40 dark:placeholder-dark-gray/40 focus:outline-none text-sm uppercase tracking-widest"
                />
                
                {/* Dropdown Suggestions */}
                {showAuthorDropdown && (
                  <div className="absolute z-10 w-full mt-2 bg-white dark:bg-dark-gray border-2 border-white dark:border-dark-gray max-h-64 overflow-y-auto">
                    {loadingAuthors ? (
                      <div className="px-4 py-3 text-sm text-dark-gray dark:text-white uppercase tracking-widest">
                        Loading...
                      </div>
                    ) : authorSuggestions.length > 0 ? (
                      authorSuggestions.map((author) => (
                        <button
                          key={author.key}
                          onClick={() => addAuthor(author)}
                          className="w-full px-4 py-3 text-left hover:bg-dark-gray/10 dark:hover:bg-white/10 transition-colors border-b border-dark-gray/10 dark:border-white/10 last:border-b-0"
                        >
                          <div className="text-sm text-dark-gray dark:text-white">
                            {author.name}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-dark-gray/60 dark:text-white/60 uppercase tracking-widest">
                        No authors found
                      </div>
                    )}
                  </div>
                )}
              </div>

              <p className="text-xs text-white/50 dark:text-dark-gray/50 uppercase tracking-widest">
                This helps us recommend books you'll love
              </p>
            </div>
          </div>
        )}

        {/* Step 3 - Genres */}
        {currentStep === 3 && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl text-white dark:text-dark-gray mb-4 leading-none">
                Your Genres
              </h1>
              <p className="text-white/70 dark:text-dark-gray/70 text-sm uppercase tracking-widest">
                Select your favorite genres
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {genres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => handleGenreToggle(genre)}
                  className={`py-4 border-2 text-sm font-medium uppercase tracking-widest transition-all ${
                    selectedGenres.includes(genre)
                      ? 'bg-white dark:bg-dark-gray border-white dark:border-dark-gray text-dark-gray dark:text-white'
                      : 'bg-transparent border-white dark:border-dark-gray text-white dark:text-dark-gray hover:bg-white/10 dark:hover:bg-dark-gray/10'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={handleSkip}
                className="text-xs font-medium uppercase tracking-widest text-white/60 dark:text-dark-gray/60 hover:text-white dark:hover:text-dark-gray transition-colors"
              >
                Skip this step
              </button>
            </div>
          </div>
        )}

        {/* Step 4 - Languages */}
        {currentStep === 4 && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl text-white dark:text-dark-gray mb-4 leading-none">
                Languages
              </h1>
              <p className="text-white/70 dark:text-dark-gray/70 text-sm uppercase tracking-widest">
                Which languages do you read?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {languages.map((language) => (
                <button
                  key={language}
                  onClick={() => handleLanguageToggle(language)}
                  className={`py-4 border-2 text-sm font-medium uppercase tracking-widest transition-all ${
                    selectedLanguages.includes(language)
                      ? 'bg-white dark:bg-dark-gray border-white dark:border-dark-gray text-dark-gray dark:text-white'
                      : 'bg-transparent border-white dark:border-dark-gray text-white dark:text-dark-gray hover:bg-white/10 dark:hover:bg-dark-gray/10'
                  }`}
                >
                  {language}
                </button>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={handleSkip}
                className="text-xs font-medium uppercase tracking-widest text-white/60 dark:text-dark-gray/60 hover:text-white dark:hover:text-dark-gray transition-colors"
              >
                Skip this step
              </button>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-12">
          {currentStep > 1 ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-6 py-3 bg-transparent border-2 border-white dark:border-dark-gray text-white dark:text-dark-gray text-xs font-medium uppercase tracking-widest hover:bg-white dark:hover:bg-dark-gray hover:text-dark-gray dark:hover:text-white transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-dark-gray border-2 border-white dark:border-dark-gray text-dark-gray dark:text-white text-xs font-medium uppercase tracking-widest hover:opacity-80 transition-opacity ml-auto"
          >
            {currentStep === 4 ? 'Finish' : 'Next'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default PersonalizationPage
