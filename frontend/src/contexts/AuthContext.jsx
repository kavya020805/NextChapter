import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { hasCompletedPersonalization } from '../lib/personalizationUtils'
import { reportLoginActivity } from '../lib/loginActivity'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Log URL info on mount for debugging OAuth
    console.log('🌐 AuthContext mounted')
    console.log('   📍 Current URL:', window.location.href)
    console.log('   🔗 Hash present:', window.location.hash ? 'YES' : 'NO')
    if (window.location.hash) {
      console.log('   📋 Hash contents:', window.location.hash.substring(0, 50) + '...')
    }
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔍 Initial session check:', session?.user?.email || 'No session')
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes (including OAuth redirects)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔐 Auth state changed:', event, 'User:', session?.user?.email || 'none')
      console.log('📍 Current location:', window.location.pathname)
      console.log('🔗 Current URL hash:', window.location.hash ? 'Present' : 'None')
      
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      
      // Handle OAuth sign-in - redirect based on personalization status
      if (event === 'SIGNED_IN' && session) {
        reportLoginActivity(session)
        console.log('✅ SIGNED_IN event detected')
        const currentPath = window.location.pathname
        console.log('🎯 Checking if should redirect from:', currentPath)
        
        // Only redirect from sign-in/sign-up pages, NOT from landing page
        if (currentPath === '/sign-in' || currentPath === '/sign-up') {
          // Check personalization status
          hasCompletedPersonalization(session.user.id).then(completed => {
            if (!completed) {
              console.log('🚀 Redirecting to /personalization')
              window.location.href = '/personalization'
            } else {
              console.log('🚀 Redirecting to /books')
              window.location.href = '/books'
            }
          })
        } else {
          console.log('⚠️ Not redirecting - current path is:', currentPath)
        }
        
        // Clean up hash after OAuth sign-in
        if (window.location.hash) {
          setTimeout(() => {
            const cleanUrl = window.location.pathname + window.location.search
            window.history.replaceState(null, '', cleanUrl)
          }, 150)
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 SIGNED_OUT event detected')
        const currentPath = window.location.pathname
        console.log('📍 Current path after sign out:', currentPath)
        
        // Always redirect to landing page after sign out
        console.log('🚀 Redirecting to landing page after sign out')
        window.location.href = '/'
      } else {
        console.log('⚠️ Not SIGNED_IN - event:', event, 'session:', session ? 'exists' : 'null')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (data?.session) {
      reportLoginActivity(data.session)
    }
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { data, error }
  }

  const updatePassword = async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    return { data, error }
  }

  const signInWithOAuth = async (provider) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        // Redirect to sign-in page (public) to avoid race condition with ProtectedRoute
        // The AuthContext will then redirect to /books after authentication
        redirectTo: `${window.location.origin}/sign-in`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
    return { data, error }
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    signInWithOAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

