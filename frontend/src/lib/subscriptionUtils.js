import { supabase } from './supabaseClient'

/**
 * Create a new subscription for a user
 */
export async function createSubscription(userId, subscriptionData) {
  const { planName, billingCycle, amount, paymentDetails } = subscriptionData

  // Map plan name to plan_id (lowercase)
  const planId = planName.toLowerCase()

  // Calculate expiration date based on billing cycle
  const startDate = new Date()
  const expiresAt = new Date(startDate)
  
  if (billingCycle === 'monthly') {
    expiresAt.setMonth(expiresAt.getMonth() + 1)
  } else if (billingCycle === 'yearly') {
    expiresAt.setFullYear(expiresAt.getFullYear() + 1)
  }

  // First, create payment record
  const paymentData = {
    user_id: userId,
    razorpay_order_id: paymentDetails?.razorpay_order_id || `order_${Date.now()}`,
    razorpay_payment_id: paymentDetails?.razorpay_payment_id || null,
    razorpay_signature: paymentDetails?.razorpay_signature || null,
    amount: Math.round(amount * 100), // Convert to paise
    currency: 'INR',
    status: 'captured',
    plan_id: planId,
    billing_cycle: billingCycle,
    payment_method: paymentDetails?.payment_method || 'razorpay'
  }

  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .insert(paymentData)
    .select()
    .single()

  if (paymentError) {
    console.error('Error creating payment:', paymentError)
    return { data: null, error: paymentError }
  }

  // Then create subscription
  const { data, error } = await supabase
    .from('user_subscriptions')
    .insert({
      user_id: userId,
      plan_id: planId,
      billing_cycle: billingCycle,
      status: 'active',
      started_at: startDate.toISOString(),
      expires_at: planName === 'Free' ? null : expiresAt.toISOString(),
      razorpay_subscription_id: paymentDetails?.razorpay_subscription_id || null
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating subscription:', error)
    return { data: null, error }
  }

  // Update user profile with subscription info
  await updateUserProfileSubscription(userId, planName, 'active', startDate.toISOString(), expiresAt.toISOString())

  return { data, error: null }
}

/**
 * Update user profile with subscription info
 */
async function updateUserProfileSubscription(userId, planName, status, startDate, expiresAt) {
  const { error } = await supabase
    .from('user_profiles')
    .update({
      subscription_plan: planName,
      subscription_status: status,
      subscription_start_date: startDate,
      subscription_end_date: expiresAt,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)

  if (error) {
    console.error('Error updating user profile subscription:', error)
  }
}

/**
 * Get user's current active subscription
 */
export async function getUserSubscription(userId) {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select(`
      *,
      subscription_plans (
        name,
        description,
        monthly_price,
        yearly_price,
        features
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error fetching subscription:', error)
    return { data: null, error }
  }

  return { data: data || null, error: null }
}

/**
 * Get user's subscription history
 */
export async function getUserSubscriptionHistory(userId) {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching subscription history:', error)
    return { data: [], error }
  }

  return { data: data || [], error: null }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId, userId) {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .update({ 
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', subscriptionId)
    .select()
    .single()

  if (error) {
    console.error('Error cancelling subscription:', error)
    return { data: null, error }
  }

  // Update user profile
  if (userId) {
    await updateUserProfileSubscription(userId, 'Free', 'cancelled', null, null)
  }

  return { data, error: null }
}

/**
 * Get subscription plan from user profile
 */
export async function getUserSubscriptionPlan(userId) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('subscription_plan, subscription_status, subscription_start_date, subscription_end_date')
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('Error fetching user subscription plan:', error)
    return { plan: 'Free', status: 'active', error }
  }

  return {
    plan: data?.subscription_plan || 'Free',
    status: data?.subscription_status || 'active',
    startDate: data?.subscription_start_date,
    endDate: data?.subscription_end_date,
    error: null
  }
}

/**
 * Check if user has access to a feature based on their plan
 */
export function hasFeatureAccess(userPlan, feature) {
  const featureAccess = {
    'Free': {
      basicRecommendations: true,
      advancedRecommendations: false,
      aiSummaries: false,
      unlimitedLibrary: false,
      aiChatbot: false,
      aiImageGeneration: false,
      multipleDevices: false,
      readingAnalytics: false,
      premiumAnalytics: false
    },
    'Pro': {
      basicRecommendations: true,
      advancedRecommendations: true,
      aiSummaries: true,
      unlimitedLibrary: true,
      aiChatbot: false,
      aiImageGeneration: false,
      multipleDevices: true,
      readingAnalytics: true,
      premiumAnalytics: false
    },
    'Premium': {
      basicRecommendations: true,
      advancedRecommendations: true,
      aiSummaries: true,
      unlimitedLibrary: true,
      aiChatbot: true,
      aiImageGeneration: true,
      multipleDevices: true,
      readingAnalytics: true,
      premiumAnalytics: true
    }
  }

  return featureAccess[userPlan]?.[feature] || false
}

/**
 * Format subscription end date for display
 */
export function formatSubscriptionDate(dateString) {
  if (!dateString) return 'N/A'
  
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Check if subscription is expiring soon (within 7 days)
 */
export function isSubscriptionExpiringSoon(endDate) {
  if (!endDate) return false
  
  const end = new Date(endDate)
  const now = new Date()
  const daysUntilExpiry = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
  
  return daysUntilExpiry <= 7 && daysUntilExpiry > 0
}
