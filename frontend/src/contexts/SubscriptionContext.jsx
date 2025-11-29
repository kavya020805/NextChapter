import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { getUserSubscriptionPlan } from '../lib/subscriptionUtils'

const SubscriptionContext = createContext()

export function SubscriptionProvider({ children }) {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState({
    plan: 'Free',
    status: 'active',
    startDate: null,
    endDate: null,
    loading: true
  })

  useEffect(() => {
    if (user) {
      loadSubscription()
    } else {
      setSubscription({
        plan: 'Free',
        status: 'active',
        startDate: null,
        endDate: null,
        loading: false
      })
    }
  }, [user])

  const loadSubscription = async () => {
    try {
      const result = await getUserSubscriptionPlan(user.id)
      setSubscription({
        plan: result.plan,
        status: result.status,
        startDate: result.startDate,
        endDate: result.endDate,
        loading: false
      })
    } catch (error) {
      console.error('Error loading subscription:', error)
      setSubscription({
        plan: 'Free',
        status: 'active',
        startDate: null,
        endDate: null,
        loading: false
      })
    }
  }

  const refreshSubscription = async () => {
    if (user) {
      await loadSubscription()
    }
  }

  const value = {
    ...subscription,
    refreshSubscription
  }

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}
