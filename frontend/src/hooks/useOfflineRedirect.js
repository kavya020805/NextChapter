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

    // Check initial status immediately on mount
    const checkInitialStatus = () => {
      if (!navigator.onLine) {
        console.log('📴 Starting offline, redirecting to offline library...');
        handleOffline();
      }
    };

    // Check status immediately
    checkInitialStatus();

    // Also check after a short delay to catch slow network detection
    const timeoutId = setTimeout(checkInitialStatus, 100);

    // Listen for status changes
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [enabled, navigate, location.pathname]);
}
