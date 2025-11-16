import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { useAuth } from '../contexts/AuthContext'
import { User, Mail, Calendar, ArrowRight, X, Edit2, Save, ArrowUpRight, Upload, Camera } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { getUserProfile } from '../lib/personalizationUtils'
import { fetchUserDashboardData } from '../lib/dashboardUtils'
import ReadingActivityCard from '../components/ReadingActivityCard'
import ReadingChallengeCard from '../components/ReadingChallengeCard'
import ReadingStatsCard from '../components/ReadingStatsCard'
import PinnedBooksCard from '../components/PinnedBooksCard'
import CurrentlyReadingCard from '../components/CurrentlyReadingCard'
import GenrePreferencesCard from '../components/GenrePreferencesCard'
import MonthlyProgressCard from '../components/MonthlyProgressCard'

function ProfilePage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState(null)
  const [subscriptionPlan, setSubscriptionPlan] = useState('Free')
  const [dashboardData, setDashboardData] = useState(null)
  
  // Form state
  const [username, setUsername] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [gender, setGender] = useState('')
  const [selectedAuthors, setSelectedAuthors] = useState([])
  const [authorInput, setAuthorInput] = useState('')
  const [authorSuggestions, setAuthorSuggestions] = useState([])
  const [loadingAuthors, setLoadingAuthors] = useState(false)
  const [showAuthorDropdown, setShowAuthorDropdown] = useState(false)
  const authorTimeoutRef = useRef(null)
  const authorDropdownRef = useRef(null)
  const [selectedGenres, setSelectedGenres] = useState([])
  const [selectedLanguages, setSelectedLanguages] = useState([])
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('')
  const [profilePhotoFile, setProfilePhotoFile] = useState(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const fileInputRef = useRef(null)

  const genres = [
    'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction',
    'Fantasy', 'Biography', 'History', 'Self-Help', 'Poetry'
  ]

  const languages = [
    'English', 'Hindi', 'Spanish', 'French', 'German', 'Mandarin'
  ]

  useEffect(() => {
    loadProfile()
    loadDashboardData()
  }, [user])

  const loadDashboardData = async () => {
    if (!user) return
    
    try {
      const data = await fetchUserDashboardData(user.id)
      setDashboardData(data)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    }
  }

  const handleDateOfBirthChange = (e) => {
    const raw = e.target.value;
    if (!raw) {
      setDateOfBirth("");
      return;
    }

    const parts = raw.split("-");
    const yearPart = (parts[0] || "").replace(/\D/g, "").slice(0, 4);
    const rest = parts.slice(1).join("-");
    const normalized = rest ? `${yearPart}-${rest}` : yearPart;

    setDateOfBirth(normalized);
  };

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

  const loadProfile = async () => {
    if (!user) return
    
    setProfileLoading(true)
    try {
      const profile = await getUserProfile(user.id)
      if (profile) {
        setProfileData(profile)
        setUsername(profile.username || '')
        setDateOfBirth(profile.date_of_birth || '')
        setGender(profile.gender || '')
        setSelectedAuthors((profile.favorite_authors || []).map(name => ({ name, key: name })))
        setSelectedGenres(profile.genres || [])
        setSelectedLanguages(profile.languages || [])
        setProfilePhotoUrl(profile.profile_photo_url || '')
        setProfilePhotoFile(null)
        // Get subscription plan from profile or default to 'Free'
        setSubscriptionPlan(profile.subscription_plan || localStorage.getItem('subscription_plan') || 'Free')
      } else {
        // If no profile, check localStorage for subscription
        const storedPlan = localStorage.getItem('subscription_plan')
        if (storedPlan) {
          setSubscriptionPlan(storedPlan)
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setProfileLoading(false)
    }
  }

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
        }))
        .slice(0, 8)
      
      setAuthorSuggestions(authors)
      setShowAuthorDropdown(authors.length > 0)
    } catch (error) {
      console.error('Error fetching authors:', error)
      setAuthorSuggestions([])
    } finally {
      setLoadingAuthors(false)
    }
  }

  const handleAuthorInputChange = (e) => {
    const value = e.target.value
    setAuthorInput(value)

    if (authorTimeoutRef.current) {
      clearTimeout(authorTimeoutRef.current)
    }

    authorTimeoutRef.current = setTimeout(() => {
      searchAuthors(value)
    }, 300)
  }

  const addAuthor = (author) => {
    if (!selectedAuthors.find(a => a.name === author.name)) {
      setSelectedAuthors([...selectedAuthors, author])
    }
    setAuthorInput('')
    setAuthorSuggestions([])
    setShowAuthorDropdown(false)
  }

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

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }

    setProfilePhotoFile(file)
    setUploadingPhoto(true)

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `profile-photos/${fileName}`

      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        // If storage bucket doesn't exist, use public URL or data URL
        console.warn('Storage upload failed, using data URL:', uploadError)
        const reader = new FileReader()
        reader.onloadend = () => {
          setProfilePhotoUrl(reader.result)
          setUploadingPhoto(false)
        }
        reader.readAsDataURL(file)
        return
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setProfilePhotoUrl(publicUrl)
    } catch (error) {
      console.error('Error uploading photo:', error)
      // Fallback to data URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePhotoUrl(reader.result)
      }
      reader.readAsDataURL(file)
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handlePhotoUrlChange = (e) => {
    setProfilePhotoUrl(e.target.value)
    setProfilePhotoFile(null)
  }

  const handleSave = async (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (!user) return
    
    setLoading(true)
    try {
      // If there's a file but no URL yet, upload it first
      let finalPhotoUrl = profilePhotoUrl
      if (profilePhotoFile && !profilePhotoUrl) {
        setUploadingPhoto(true)
        try {
          const fileExt = profilePhotoFile.name.split('.').pop()
          const fileName = `${user.id}-${Date.now()}.${fileExt}`
          const filePath = `profile-photos/${fileName}`

          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, profilePhotoFile, {
              cacheControl: '3600',
              upsert: true
            })

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('avatars')
              .getPublicUrl(filePath)
            finalPhotoUrl = publicUrl
          } else {
            // Fallback to data URL
            finalPhotoUrl = await new Promise((resolve) => {
              const reader = new FileReader()
              reader.onloadend = () => {
                resolve(reader.result)
              }
              reader.readAsDataURL(profilePhotoFile)
            })
          }
        } catch (error) {
          console.error('Error uploading photo:', error)
        } finally {
          setUploadingPhoto(false)
        }
      }

      const updateData = {
        username,
        date_of_birth: dateOfBirth,
        gender,
        favorite_authors: selectedAuthors.map(a => a.name),
        genres: selectedGenres,
        languages: selectedLanguages,
        profile_photo_url: finalPhotoUrl || null,
      }
      
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          ...updateData,
        }, { onConflict: 'user_id' })
      
      if (error) {
        console.error('Error saving profile:', error)
        alert('Failed to save profile. Please try again.')
        return
      }
      
      setIsEditing(false)
      setProfilePhotoFile(null)
      await loadProfile()
      
      // Dispatch custom event to notify header to refresh profile photo
      window.dispatchEvent(new CustomEvent('profileUpdated', { 
        detail: { profile_photo_url: finalPhotoUrl } 
      }))
      
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    setLoading(true)
    const { error } = await signOut()
    if (error) {
      console.error('Sign out error:', error)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-dark-gray dark:bg-white">
      <Header />
      
      {/* Profile Section */}
      <section className="bg-dark-gray dark:bg-white py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-12 gap-8 md:gap-16">
            {/* Left Column - Heading */}
            <div className="col-span-12 md:col-span-4">
              <div className="mb-8">
                <span className="text-xs font-medium uppercase tracking-widest text-white dark:text-dark-gray border-b-2 border-white dark:border-dark-gray pb-2 inline-block">
                  Your Account
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl text-white dark:text-dark-gray mb-8 leading-none">
                Profile
              </h1>
              <p className="text-lg text-white/70 dark:text-dark-gray/70 leading-relaxed font-light mb-8">
                Manage your account settings and preferences.
              </p>
              
              {/* Actions */}
              <div className="space-y-4 flex flex-col items-start">
                <Link
                  to="/books"
                  className="group inline-flex items-center gap-3 bg-white dark:bg-dark-gray text-dark-gray dark:text-white px-6 py-3 text-xs font-medium uppercase tracking-wider border border-white dark:border-dark-gray transition-all duration-300 hover:bg-dark-gray dark:hover:bg-white hover:text-white dark:hover:text-dark-gray overflow-hidden relative"
                >
                  <span className="relative z-10 transition-colors duration-300">Back to Books</span>
                  <ArrowRight 
                    className="w-3 h-3 relative z-10 transition-all duration-300 -translate-x-5 opacity-0 group-hover:translate-x-0 group-hover:opacity-100" 
                  />
                </Link>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    e.nativeEvent?.stopImmediatePropagation?.()
                    handleSignOut()
                  }}
                  disabled={loading}
                  className="group inline-flex items-center gap-3 bg-transparent border border-white dark:border-dark-gray text-white dark:text-dark-gray px-6 py-3 text-xs font-medium uppercase tracking-wider transition-all duration-300 hover:border-red-400 dark:hover:border-red-400 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed relative z-0"
                >
                  <span className="relative z-10 transition-colors duration-300">
                    {loading ? 'Signing Out...' : 'Sign Out'}
                  </span>
                </button>
              </div>
            </div>

            {/* Right Column - Profile Info */}
            <div className="col-span-12 md:col-span-8 border-t-2 border-white dark:border-dark-gray pt-8 md:pt-0 md:border-t-0 md:border-l-2 md:pl-12">
              <div className="max-w-full">
                {profileLoading ? (
                  <div className="text-center py-20">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-coral mb-4"></div>
                    <p className="text-white dark:text-dark-gray">Loading profile...</p>
                  </div>
                ) : (
                  <>
                    {/* User Info Card */}
                    <div className="bg-dark-gray dark:bg-white border-2 border-white/30 dark:border-dark-gray/30 p-4 mb-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {/* Profile Picture */}
                          <div className="relative">
                            {profilePhotoUrl ? (
                              <>
                                <img
                                  src={profilePhotoUrl}
                                  alt="Profile"
                                  className="w-12 h-12 rounded-full border-2 border-white/40 dark:border-dark-gray/40 object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none'
                                    const fallback = e.target.nextElementSibling
                                    if (fallback) fallback.style.display = 'flex'
                                  }}
                                />
                                <div className="w-12 h-12 rounded-full border-2 border-white/40 dark:border-dark-gray/40 flex items-center justify-center hidden">
                                  <User className="w-6 h-6 text-white dark:text-dark-gray" />
                                </div>
                              </>
                            ) : (
                              <div className="w-12 h-12 rounded-full border-2 border-white/40 dark:border-dark-gray/40 flex items-center justify-center">
                                <User className="w-6 h-6 text-white dark:text-dark-gray" />
                              </div>
                            )}
                            {isEditing && (
                              <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-dark-gray border-2 border-white dark:border-dark-gray flex items-center justify-center hover:bg-white/90 dark:hover:bg-dark-gray/90 transition-colors"
                                title="Change photo"
                              >
                                <Camera className="w-3 h-3 text-dark-gray dark:text-white" />
                              </button>
                            )}
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleFileSelect}
                              className="hidden"
                            />
                          </div>
                          <div className="flex-1">
                            <h2 className="text-xl text-white dark:text-dark-gray font-medium mb-0.5">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={username}
                                  onChange={(e) => setUsername(e.target.value)}
                                  placeholder="Username"
                                  className="w-full bg-transparent border-0 border-b-2 border-white/40 dark:border-dark-gray/40 px-0 py-0.5 text-white dark:text-dark-gray text-xl font-medium focus:outline-none focus:border-white/60 dark:focus:border-dark-gray/60 transition-colors"
                                />
                              ) : (
                                profileData?.username || user.email?.split('@')[0] || 'User'
                              )}
                            </h2>
                            <div className="flex items-center gap-1.5">
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium uppercase tracking-wider bg-white/5 dark:bg-dark-gray/5 text-white/70 dark:text-dark-gray/70 border-2 border-white/30 dark:border-dark-gray/30">
                                {subscriptionPlan}
                              </span>
                              {subscriptionPlan !== 'Premium' && (
                                <Link
                                  to="/subscription"
                                  className="flex items-center gap-1 px-2 py-1 text-xs text-white/70 dark:text-dark-gray/70 hover:text-white dark:hover:text-dark-gray border-2 border-white/40 dark:border-dark-gray/40 hover:border-white/60 dark:hover:border-dark-gray/60 rounded transition-all"
                                  title="Upgrade plan"
                                >
                                  Upgrade
                                  <ArrowUpRight className="w-3 h-3" />
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  setIsEditing(false)
                                  loadProfile()
                                }}
                                className="px-2 py-1 text-xs text-white/60 dark:text-dark-gray/60 hover:text-white dark:hover:text-dark-gray transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={async (e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  e.nativeEvent?.stopImmediatePropagation?.()
                                  await handleSave(e)
                                }}
                                disabled={loading || uploadingPhoto}
                                className="px-2 py-1 text-xs text-white/70 dark:text-dark-gray/70 hover:text-white dark:hover:text-dark-gray transition-colors disabled:opacity-50 relative z-10"
                                style={{ pointerEvents: loading || uploadingPhoto ? 'none' : 'auto' }}
                              >
                                {loading ? 'Saving...' : 'Save'}
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setIsEditing(true)}
                              className="p-2 text-white/50 dark:text-dark-gray/50 hover:text-white dark:hover:text-dark-gray transition-colors"
                              title="Edit profile"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3 pb-3 border-b-2 border-white/30 dark:border-dark-gray/30">
                          <Mail className="w-5 h-5 text-white dark:text-dark-gray opacity-60" />
                          <div className="flex-1">
                            <p className="text-xs font-medium uppercase tracking-wider text-white/60 dark:text-dark-gray/60 mb-1">
                              Email
                            </p>
                            <p className="text-sm text-white dark:text-dark-gray">
                              {user.email}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pb-3 border-b-2 border-white/30 dark:border-dark-gray/30">
                          <Calendar className="w-5 h-5 text-black dark:text-black" />
                          <div className="flex-1">
                            <p className="text-xs font-medium uppercase tracking-wider text-white/60 dark:text-dark-gray/60 mb-1">
                              Date of Birth
                            </p>
                            {isEditing ? (
                              <input
                                type="date"
                                value={dateOfBirth}
                                onChange={handleDateOfBirthChange}
                                className="w-full bg-transparent border-0 border-b-2 border-white/40 dark:border-dark-gray/40 px-0 py-0.5 text-black dark:text-dark-gray text-sm focus:outline-none focus:border-black/60 dark:focus:border-dark-gray/60 transition-colors"
                              />
                            ) : (
                              <p className="text-sm text-black dark:text-dark-gray">
                                {dateOfBirth ? new Date(dateOfBirth).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                }) : 'Not set'}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Gender */}
                        <div className="pb-3 border-b-2 border-white/30 dark:border-dark-gray/30">
                          <p className="text-xs font-medium uppercase tracking-wider text-white/60 dark:text-dark-gray/60 mb-2">
                            Gender
                          </p>
                          {isEditing ? (
                            <div className="flex gap-1.5">
                              {['Male', 'Female', 'Other'].map((option) => (
                                <button
                                  key={option}
                                  onClick={() => setGender(option)}
                                  className={`px-3 py-1.5 text-xs font-medium tracking-wide transition-all rounded ${
                                    gender === option
                                      ? 'bg-white/10 dark:bg-dark-gray/10 text-white dark:text-dark-gray border-2 border-white/50 dark:border-dark-gray/50'
                                      : 'bg-transparent text-white/50 dark:text-dark-gray/50 hover:text-white dark:hover:text-dark-gray hover:bg-white/5 dark:hover:bg-dark-gray/5 border-2 border-transparent'
                                  }`}
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-white dark:text-dark-gray">
                              {gender || 'Not set'}
                            </p>
                          )}
                        </div>

                        {/* Favorite Authors */}
                        <div className="pb-3 border-b-2 border-white/30 dark:border-dark-gray/30">
                          <p className="text-xs font-medium uppercase tracking-wider text-white/60 dark:text-dark-gray/60 mb-2">
                            Favorite Authors
                          </p>
                          {isEditing ? (
                            <div className="space-y-2">
                              {selectedAuthors.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                  {selectedAuthors.map((author) => (
                                    <div
                                      key={author.key}
                                      className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 dark:bg-dark-gray/5 text-white dark:text-dark-gray text-xs rounded"
                                    >
                                      <span>{author.name}</span>
                                      <button
                                        onClick={() => removeAuthor(author.name)}
                                        className="hover:opacity-60 transition-opacity text-white/40 dark:text-dark-gray/40"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                              <div className="relative" ref={authorDropdownRef}>
                                <input
                                  type="text"
                                  value={authorInput}
                                  onChange={handleAuthorInputChange}
                                  onFocus={() => {
                                    if (authorSuggestions.length > 0) {
                                      setShowAuthorDropdown(true)
                                    }
                                  }}
                                  placeholder="Add author..."
                                  className="w-full bg-transparent border-0 border-b-2 border-white/40 dark:border-dark-gray/40 px-0 py-1 text-white dark:text-dark-gray placeholder-white/30 dark:placeholder-dark-gray/30 focus:outline-none focus:border-white/60 dark:focus:border-dark-gray/60 text-xs transition-colors"
                                />
                                {showAuthorDropdown && (
                                  <div className="absolute z-10 w-full mt-0.5 bg-dark-gray dark:bg-white border-2 border-white/40 dark:border-dark-gray/40 shadow-sm max-h-36 overflow-y-auto">
                                    {loadingAuthors ? (
                                      <div className="px-2 py-1.5 text-xs text-white/60 dark:text-dark-gray/60">Loading...</div>
                                    ) : authorSuggestions.length > 0 ? (
                                      authorSuggestions.map((author) => (
                                        <button
                                          key={author.key}
                                          onClick={() => addAuthor(author)}
                                          className="w-full px-2 py-1.5 text-left hover:bg-white/5 dark:hover:bg-dark-gray/5 transition-colors border-b border-white/5 dark:border-dark-gray/5 last:border-b-0 text-xs text-white dark:text-dark-gray"
                                        >
                                          {author.name}
                                        </button>
                                      ))
                                    ) : (
                                      <div className="px-2 py-1.5 text-xs text-white/60 dark:text-dark-gray/60">No authors found</div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {selectedAuthors.length > 0 ? (
                                selectedAuthors.map((author) => (
                                  <span key={author.key} className="px-2.5 py-1 bg-white/5 dark:bg-dark-gray/5 text-white dark:text-dark-gray text-xs rounded">
                                    {author.name}
                                  </span>
                                ))
                              ) : (
                                <p className="text-sm text-white/60 dark:text-dark-gray/60">No authors added</p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Genres */}
                        <div className="pb-3 border-b-2 border-white/30 dark:border-dark-gray/30">
                          <p className="text-xs font-medium uppercase tracking-wider text-white/60 dark:text-dark-gray/60 mb-2">
                            Favorite Genres
                          </p>
                          {isEditing ? (
                            <div className="flex flex-wrap gap-1.5">
                              {genres.map((genre) => (
                                <button
                                  key={genre}
                                  onClick={() => handleGenreToggle(genre)}
                                  className={`px-3 py-1.5 text-xs font-medium tracking-wide transition-all rounded ${
                                    selectedGenres.includes(genre)
                                      ? 'bg-white/10 dark:bg-dark-gray/10 text-white dark:text-dark-gray border-2 border-white/50 dark:border-dark-gray/50'
                                      : 'bg-transparent text-white/50 dark:text-dark-gray/50 hover:text-white dark:hover:text-dark-gray hover:bg-white/5 dark:hover:bg-dark-gray/5 border-2 border-transparent'
                                  }`}
                                >
                                  {genre}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {selectedGenres.length > 0 ? (
                                selectedGenres.map((genre) => (
                                  <span key={genre} className="px-2.5 py-1 bg-white/5 dark:bg-dark-gray/5 text-white dark:text-dark-gray text-xs rounded">
                                    {genre}
                                  </span>
                                ))
                              ) : (
                                <p className="text-sm text-white/60 dark:text-dark-gray/60">No genres selected</p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Languages */}
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wider text-white/60 dark:text-dark-gray/60 mb-2">
                            Languages
                          </p>
                          {isEditing ? (
                            <div className="flex flex-wrap gap-1.5">
                              {languages.map((language) => (
                                <button
                                  key={language}
                                  onClick={() => handleLanguageToggle(language)}
                                  className={`px-3 py-1.5 text-xs font-medium tracking-wide transition-all rounded ${
                                    selectedLanguages.includes(language)
                                      ? 'bg-white/10 dark:bg-dark-gray/10 text-white dark:text-dark-gray border-2 border-white/50 dark:border-dark-gray/50'
                                      : 'bg-transparent text-white/50 dark:text-dark-gray/50 hover:text-white dark:hover:text-dark-gray hover:bg-white/5 dark:hover:bg-dark-gray/5 border-2 border-transparent'
                                  }`}
                                >
                                  {language}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {selectedLanguages.length > 0 ? (
                                selectedLanguages.map((language) => (
                                  <span key={language} className="px-2.5 py-1 bg-white/5 dark:bg-dark-gray/5 text-white dark:text-dark-gray text-xs rounded">
                                    {language}
                                  </span>
                                ))
                              ) : (
                                <p className="text-sm text-white/60 dark:text-dark-gray/60">No languages selected</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Reading Activity Card */}
                    <ReadingActivityCard 
                      readingSessions={dashboardData?.readingSessions || []}
                      readingStats={dashboardData?.readingStats}
                    />

                    {/* Reading Challenge Card */}
                    <ReadingChallengeCard 
                      challengeData={dashboardData?.challengeData}
                    />

                    {/* Reading Stats Card */}
                    <ReadingStatsCard 
                      readingStats={dashboardData?.readingStats}
                    />

                    {/* Pinned Books and Currently Reading Cards */}
                    <div className="mt-4 mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <PinnedBooksCard 
                        pinnedBooks={dashboardData?.pinnedBooks || []}
                      />
                      <CurrentlyReadingCard 
                        currentlyReading={dashboardData?.currentlyReading || []}
                      />
                    </div>

                    {/* Genre Preferences and Monthly Progress Cards */}
                    <div className="mt-4 mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <GenrePreferencesCard 
                        genreDistribution={dashboardData?.genreDistribution || {}}
                      />
                      <MonthlyProgressCard 
                        monthlyData={dashboardData?.monthlyProgress || []}
                        readingStats={dashboardData?.readingStats}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
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
                <Link to="/" className="text-xs text-white dark:text-dark-gray font-medium uppercase tracking-widest hover:opacity-60 transition-opacity">
                  Home
                </Link>
                <Link to="/books" className="text-xs text-white dark:text-dark-gray font-medium uppercase tracking-widest hover:opacity-60 transition-opacity">
                  Books
                </Link>
                <Link to="/subscription" className="text-xs text-white dark:text-dark-gray font-medium uppercase tracking-widest hover:opacity-60 transition-opacity">
                  Subscription
                </Link>
                <Link to="/profile" className="text-xs text-white dark:text-dark-gray font-medium uppercase tracking-widest hover:opacity-60 transition-opacity">
                  Profile
                </Link>
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

export default ProfilePage
