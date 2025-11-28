import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Hook to automatically redirect to offline library when user goes offline
 * @param {boolean} enabled - Whether to enable auto-redirect (default: true)
 */
export function useOfflineRedirect(enabled = true) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!enabled) return;

    const handleOffline = () => {
      // Don't redirect if already on offline page or reader
      if (location.pathname === '/offline' || location.pathname.includes('/reader')) {
        return;
      }

      console.log('📴 You are offline, redirecting to offline library...');
      navigate('/offline', { replace: true });
    };

    const handleOnline = () => {
      console.log('📶 You are back online!');
      // Optionally redirect back or show a notification
    };

    // Check initial status
    if (!navigator.onLine) {
      handleOffline();
    }

    // Listen for status changes
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [enabled, navigate, location.pathname]);
}
