import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Header from '../components/Header'

function AdminSubscriptionCheck() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const checkExpiredSubscriptions = async () => {
    setLoading(true)
    try {
      // Find expired subscriptions
      const { data: expired, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('status', 'active')
        .not('expires_at', 'is', null)
        .lt('expires_at', new Date().toISOString())

      if (error) throw error

      setResult({
        found: expired?.length || 0,
        subscriptions: expired
      })

      // You can manually update them here if needed
      if (expired && expired.length > 0) {
        alert(`Found ${expired.length} expired subscriptions. Update them manually in Supabase.`)
      } else {
        alert('No expired subscriptions found!')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error checking subscriptions: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-gray dark:bg-white">
      <Header />
      <div className="max-w-4xl mx-auto px-8 py-24">
        <h1 className="text-4xl text-white dark:text-dark-gray mb-8">
          Subscription Management
        </h1>
        
        <div className="bg-white dark:bg-dark-gray border-2 border-dark-gray dark:border-white p-8">
          <h2 className="text-2xl text-dark-gray dark:text-white mb-4">
            Check Expired Subscriptions
          </h2>
          
          <button
            onClick={checkExpiredSubscriptions}
            disabled={loading}
            className="px-6 py-3 bg-dark-gray dark:bg-white text-white dark:text-dark-gray border-2 border-dark-gray dark:border-white hover:bg-white dark:hover:bg-dark-gray hover:text-dark-gray dark:hover:text-white transition-all disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Check Now'}
          </button>

          {result && (
            <div className="mt-6 p-4 bg-dark-gray/5 dark:bg-white/5 border border-dark-gray/20 dark:border-white/20">
              <p className="text-dark-gray dark:text-white">
                Found {result.found} expired subscription(s)
              </p>
              {result.subscriptions && result.subscriptions.length > 0 && (
                <div className="mt-4 space-y-2">
                  {result.subscriptions.map(sub => (
                    <div key={sub.id} className="text-sm text-dark-gray/70 dark:text-white/70">
                      User: {sub.user_id} | Plan: {sub.plan_id} | Expired: {new Date(sub.expires_at).toLocaleDateString()}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="mt-8 p-4 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-500">
            <p className="text-sm text-yellow-900 dark:text-yellow-200">
              <strong>Note:</strong> This only checks for expired subscriptions. 
              You'll need to manually update them in Supabase Dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSubscriptionCheck
