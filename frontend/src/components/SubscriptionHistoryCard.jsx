import { useState, useEffect } from 'react'
import { Clock, CreditCard, CheckCircle, XCircle, Calendar, Copy, Check } from 'lucide-react'
import { getUserSubscriptionHistory } from '../lib/subscriptionUtils'
import { supabase } from '../lib/supabaseClient'

function SubscriptionHistoryCard({ userId }) {
  const [history, setHistory] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('subscriptions') // 'subscriptions' or 'payments'
  const [copiedId, setCopiedId] = useState(null)

  useEffect(() => {
    const fetchHistory = async () => {
      if (!userId) return

      setLoading(true)
      
      // Fetch subscription history
      const { data: subsData } = await getUserSubscriptionHistory(userId)
      setHistory(subsData || [])

      // Fetch payment history
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      setPayments(paymentsData || [])
      setLoading(false)
    }

    fetchHistory()
  }, [userId])

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
      case 'captured':
        return 'text-green-600 dark:text-green-400'
      case 'cancelled':
      case 'failed':
        return 'text-red-600 dark:text-red-400'
      case 'expired':
      case 'refunded':
        return 'text-orange-600 dark:text-orange-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
      case 'captured':
        return <CheckCircle className="w-4 h-4" />
      case 'cancelled':
      case 'failed':
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatAmount = (amount) => {
    return `₹${(amount / 100).toFixed(2)}`
  }

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  if (loading) {
    return (
      <div className="bg-dark-gray dark:bg-white border-2 border-white/30 dark:border-dark-gray/30 p-6 mb-4">
        <div className="animate-pulse">
          <div className="h-6 bg-white/10 dark:bg-dark-gray/10 w-48 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-white/10 dark:bg-dark-gray/10"></div>
            <div className="h-16 bg-white/10 dark:bg-dark-gray/10"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div id="subscription-history" className="bg-dark-gray dark:bg-white border-2 border-white/30 dark:border-dark-gray/30 p-6 mb-4 scroll-mt-24">
      <div className="mb-5">
        <h3 className="text-sm font-medium uppercase tracking-wider text-white dark:text-dark-gray mb-4">History</h3>
        
        {/* Tabs */}
        <div className="flex gap-4 border-b-2 border-white/20 dark:border-dark-gray/20">
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`pb-2 px-4 text-xs font-medium uppercase tracking-wider transition-colors ${
              activeTab === 'subscriptions'
                ? 'text-white dark:text-dark-gray border-b-2 border-white dark:border-dark-gray -mb-0.5'
                : 'text-white/50 dark:text-dark-gray/50'
            }`}
          >
            Subscriptions
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`pb-2 px-4 text-xs font-medium uppercase tracking-wider transition-colors ${
              activeTab === 'payments'
                ? 'text-white dark:text-dark-gray border-b-2 border-white dark:border-dark-gray -mb-0.5'
                : 'text-white/50 dark:text-dark-gray/50'
            }`}
          >
            Payments
          </button>
        </div>
      </div>

      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-3">
          {history.length === 0 ? (
            <p className="text-white/60 dark:text-dark-gray/60 text-sm">No subscription history yet.</p>
          ) : (
            history.map((sub) => (
              <div
                key={sub.id}
                className="border-2 border-white/20 dark:border-dark-gray/20 p-4 hover:border-white/40 dark:hover:border-dark-gray/40 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-base font-medium text-white dark:text-dark-gray capitalize">
                      {sub.plan_id} Plan
                    </h4>
                    <p className="text-xs text-white/60 dark:text-dark-gray/60 uppercase tracking-wider mt-1">
                      {sub.billing_cycle}
                    </p>
                  </div>
                  <div className={`flex items-center gap-2 text-xs font-medium uppercase tracking-wider ${getStatusColor(sub.status)}`}>
                    {getStatusIcon(sub.status)}
                    {sub.status}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                  <div>
                    <p className="text-white/60 dark:text-dark-gray/60 text-xs uppercase tracking-wider mb-1">
                      Started
                    </p>
                    <p className="text-white dark:text-dark-gray">
                      {formatDate(sub.started_at)}
                    </p>
                  </div>
                  {sub.expires_at && (
                    <div>
                      <p className="text-white/60 dark:text-dark-gray/60 text-xs uppercase tracking-wider mb-1">
                        {sub.status === 'active' ? 'Expires' : 'Expired'}
                      </p>
                      <p className="text-white dark:text-dark-gray">
                        {formatDate(sub.expires_at)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="space-y-3">
          {payments.length === 0 ? (
            <p className="text-white/60 dark:text-dark-gray/60 text-sm">No payment history yet.</p>
          ) : (
            payments.map((payment) => (
              <div
                key={payment.id}
                className="border-2 border-white/20 dark:border-dark-gray/20 p-4 hover:border-white/40 dark:hover:border-dark-gray/40 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-white dark:text-dark-gray" />
                    <div>
                      <h4 className="text-base font-medium text-white dark:text-dark-gray">
                        {formatAmount(payment.amount)}
                      </h4>
                      <p className="text-xs text-white/60 dark:text-dark-gray/60 uppercase tracking-wider mt-1">
                        {payment.plan_id} - {payment.billing_cycle}
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 text-xs font-medium uppercase tracking-wider ${getStatusColor(payment.status)}`}>
                    {getStatusIcon(payment.status)}
                    {payment.status}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                  <div>
                    <p className="text-white/60 dark:text-dark-gray/60 text-xs uppercase tracking-wider mb-1">
                      Date
                    </p>
                    <p className="text-white dark:text-dark-gray">
                      {formatDate(payment.created_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/60 dark:text-dark-gray/60 text-xs uppercase tracking-wider mb-1">
                      Payment ID
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-white dark:text-dark-gray text-xs font-mono truncate">
                        {payment.razorpay_payment_id || 'N/A'}
                      </p>
                      {payment.razorpay_payment_id && (
                        <button
                          onClick={() => copyToClipboard(payment.razorpay_payment_id, payment.id)}
                          className="flex-shrink-0 p-1 hover:bg-white/10 dark:hover:bg-dark-gray/10 rounded transition-colors"
                          title="Copy Payment ID"
                        >
                          {copiedId === payment.id ? (
                            <Check className="w-3 h-3 text-green-500" />
                          ) : (
                            <Copy className="w-3 h-3 text-white/60 dark:text-dark-gray/60" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default SubscriptionHistoryCard
