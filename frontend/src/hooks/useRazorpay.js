import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { openRazorpayCheckout, createRazorpayOrder, verifyRazorpayPayment } from '../lib/razorpay';
import { supabase } from '../lib/supabaseClient';
import logger from '../lib/logger';

export const useRazorpay = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const initiatePayment = async (planDetails) => {
    if (!user) {
      setError('Please sign in to subscribe');
      return { success: false, error: 'Not authenticated' };
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Create order on backend
      logger.log('Creating Razorpay order...', planDetails);
      
      // Map plan names to IDs
      const planIdMap = {
        'Free': 'free',
        'Pro': 'pro',
        'Premium': 'premium',
      };
      
      const planId = planIdMap[planDetails.planName] || planDetails.planName.toLowerCase();
      
      const orderData = await createRazorpayOrder(
        supabase,
        planId,
        planDetails.billingCycle,
        planDetails.amount
      );

      if (!orderData.success) {
        throw new Error('Failed to create order');
      }

      logger.log('Order created:', orderData);

      // Step 2: Open Razorpay checkout
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      
      if (!razorpayKey) {
        throw new Error('Razorpay key not configured');
      }

      const options = {
        key: razorpayKey,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'NextChapter',
        description: `${planDetails.planName} - ${planDetails.billingCycle}`,
        image: '/LOGO.svg',
        order_id: orderData.order.id, // Backend-generated order ID
        prefill: {
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
          email: user.email || '',
          contact: user.user_metadata?.phone || '',
        },
        theme: {
          color: '#2a2a2a',
          backdrop_color: 'rgba(0, 0, 0, 0.5)',
        },
        notes: {
          user_id: user.id,
          plan_name: planDetails.planName,
          billing_cycle: planDetails.billingCycle,
        },
      };

      logger.log('Opening Razorpay checkout...');
      const paymentResponse = await openRazorpayCheckout(options);
      
      logger.log('Payment response:', paymentResponse);

      // Step 3: Verify payment on backend
      logger.log('Verifying payment...');
      const verificationResult = await verifyRazorpayPayment(supabase, {
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature,
      });

      if (!verificationResult.success) {
        throw new Error('Payment verification failed');
      }

      logger.log('Payment verified successfully!');
      
      setLoading(false);
      return {
        success: true,
        paymentId: paymentResponse.razorpay_payment_id,
        orderId: paymentResponse.razorpay_order_id,
        subscription: verificationResult.subscription,
      };
    } catch (err) {
      logger.error('Payment error:', err);
      setError(err.message || 'Payment failed');
      setLoading(false);
      return {
        success: false,
        error: err.message || 'Payment failed',
      };
    }
  };

  return {
    initiatePayment,
    loading,
    error,
  };
};
