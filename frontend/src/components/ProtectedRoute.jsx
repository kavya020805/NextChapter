import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { isAdmin as fetchIsAdmin } from '../lib/personalizationUtils'

function ProtectedRoute({ children, requireAdmin = false, blockAdmin = false }) {
  const { user, loading } = useAuth()
  const [roleLoading, setRoleLoading] = useState(true)
  const [isAdminUser, setIsAdminUser] = useState(false)

  useEffect(() => {
    let cancelled = false

    const checkRole = async () => {
      if (!user || loading) {
        if (!cancelled) {
          setIsAdminUser(false)
          setRoleLoading(false)
        }
        return
      }

      try {
        const admin = await fetchIsAdmin(user.id)
        if (!cancelled) {
          setIsAdminUser(admin)
          setRoleLoading(false)
        }
      } catch (e) {
        if (!cancelled) {
          setIsAdminUser(false)
          setRoleLoading(false)
        }
      }
    }

    // Only check role when needed
    if (requireAdmin || blockAdmin) {
      setRoleLoading(true)
      checkRole()
    } else {
      setRoleLoading(false)
    }

    return () => {
      cancelled = true
    }
  }, [user, loading, requireAdmin, blockAdmin])

  // Show loading state while checking authentication or role
  if (loading || roleLoading) {
    return (
      <div className="min-h-screen bg-dark-gray dark:bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-coral mb-4"></div>
          <p className="text-white dark:text-dark-gray">Loading...</p>
        </div>
      </div>
    )
  }

  // If blockAdmin is true, this is a public/auth page - allow access if not logged in OR if logged in but not admin
  if (blockAdmin) {
    // If user is logged in and is admin, redirect to admin dashboard
    if (user && isAdminUser) {
      return <Navigate to="/admin" replace />
    }
    // Otherwise (no user or non-admin user), allow access to the page
    return children
  }

  // For protected routes (requireAdmin or regular protected routes)
  // Redirect to sign-in if not authenticated
  if (!user) {
    return <Navigate to="/sign-in" replace />
  }

  // If this route is admin-only and user is not admin, send to main app
  if (requireAdmin && !isAdminUser) {
    return <Navigate to="/books" replace />
  }

  // User is authenticated (and role is allowed), render the protected content
  return children
}

export default ProtectedRoute

