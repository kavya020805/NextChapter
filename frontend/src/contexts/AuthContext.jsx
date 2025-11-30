import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { hasCompletedPersonalization, isAdmin } from '../lib/personalizationUtils'
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

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔐 Auth state changed:', event, 'User:', session?.user?.email || 'none')
      console.log('📍 Current location:', window.location.pathname)
      
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      
      // Handle sign out - redirect to landing page
      if (event === 'SIGNED_OUT') {
        console.log('👋 SIGNED_OUT event detected')
        console.log('📍 Current path:', window.location.pathname)
        // Don't auto-redirect - let the page handle it
        // The reset password page will do a full page reload to /sign-in
      }
      
      // For SIGNED_IN events, let the OAuthCallbackPage handle redirects
      // This prevents race conditions and ensures proper routing
      if (event === 'SIGNED_IN' && session) {
        console.log('✅ SIGNED_IN event detected')
        // Only report login activity here, don't redirect
        // The OAuthCallbackPage or ProtectedRoute will handle navigation
        reportLoginActivity(session)
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
    // Use the full URL with protocol
    const redirectUrl = `${window.location.protocol}//${window.location.host}/reset-password`
    console.log('🔐 Sending password reset email to:', email)
    console.log('🔗 Redirect URL:', redirectUrl)
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    })
    
    if (error) {
      console.error('❌ Password reset error:', error)
    } else {
      console.log('✅ Password reset email sent successfully')
    }
    
    return { data, error }
  }
  
  const verifyOtp = async (email, token) => {
    console.log('🔐 Verifying OTP:', { email, token: token.substring(0, 4) + '****' })
    
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup', // Use 'signup' for email confirmation
    })
    
    if (error) {
      console.error('❌ OTP verification error:', error)
    } else {
      console.log('✅ OTP verified successfully:', data)
    }
    
    return { data, error }
  }
  
  const resendOtp = async (email) => {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email,
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
        // Use dedicated callback route to handle OAuth redirects
        // This overrides any old redirect URLs stored in user metadata
        redirectTo: `${window.location.origin}/auth/callback`,
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
    verifyOtp,
    resendOtp,
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

