import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { useAuth } from '../contexts/AuthContext'
import { User, Mail, Calendar, ArrowRight } from 'lucide-react'

function ProfilePage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {
    setLoading(true)
    const { error } = await signOut()
    if (error) {
      console.error('Sign out error:', error)
    }
    // Navigation handled by SIGNED_OUT event in AuthContext
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
              <p className="text-lg text-white/70 dark:text-dark-gray/70 leading-relaxed font-light">
                Manage your account settings and preferences.
              </p>
            </div>

            {/* Right Column - Profile Info */}
            <div className="col-span-12 md:col-span-8 border-t-2 border-white dark:border-dark-gray pt-8 md:pt-0 md:border-t-0 md:border-l-2 md:pl-12">
              <div className="max-w-2xl">
                {/* User Info Card */}
                <div className="bg-white dark:bg-dark-gray border-2 border-white dark:border-dark-gray p-8 mb-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full border-2 border-dark-gray dark:border-white flex items-center justify-center">
                      <User className="w-8 h-8 text-dark-gray dark:text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl text-dark-gray dark:text-white font-medium mb-1">
                        {user.email?.split('@')[0] || 'User'}
                      </h2>
                      <p className="text-sm text-dark-gray/60 dark:text-white/60 uppercase tracking-widest">
                        Member
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-4 border-b border-dark-gray/10 dark:border-white/10">
                      <Mail className="w-5 h-5 text-dark-gray dark:text-white" />
                      <div className="flex-1">
                        <p className="text-xs font-medium uppercase tracking-widest text-dark-gray/60 dark:text-white/60 mb-1">
                          Email
                        </p>
                        <p className="text-sm text-dark-gray dark:text-white">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pb-4 border-b border-dark-gray/10 dark:border-white/10">
                      <Calendar className="w-5 h-5 text-dark-gray dark:text-white" />
                      <div className="flex-1">
                        <p className="text-xs font-medium uppercase tracking-widest text-dark-gray/60 dark:text-white/60 mb-1">
                          Member Since
                        </p>
                        <p className="text-sm text-dark-gray dark:text-white">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          }) : 'Recently'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-4">
                  <Link
                    to="/books"
                    className="group inline-flex items-center gap-3 bg-white dark:bg-dark-gray text-dark-gray dark:text-white px-8 py-4 text-sm font-medium uppercase tracking-widest border-2 border-white dark:border-dark-gray transition-all duration-300 hover:bg-dark-gray dark:hover:bg-white hover:text-white dark:hover:text-dark-gray overflow-hidden relative"
                  >
                    <span className="relative z-10 transition-colors duration-300">Back to Books</span>
                    <ArrowRight 
                      className="w-4 h-4 relative z-10 transition-all duration-300 -translate-x-5 opacity-0 group-hover:translate-x-0 group-hover:opacity-100" 
                    />
                  </Link>

                  <button
                    onClick={handleSignOut}
                    disabled={loading}
                    className="group w-full inline-flex items-center justify-center gap-3 bg-transparent border-2 border-white dark:border-dark-gray text-white dark:text-dark-gray px-8 py-4 text-sm font-medium uppercase tracking-widest transition-all duration-300 hover:border-red-400 dark:hover:border-red-400 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="relative z-10 transition-colors duration-300">
                      {loading ? 'Signing Out...' : 'Sign Out'}
                    </span>
                  </button>
                </div>
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

