/**
 * Production-safe logger utility
 * Only logs in development mode
 */

const isDevelopment = import.meta.env.DEV;

export const logger = {
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  error: (...args) => {
    if (isDevelopment) {
      console.error(...args);
    }
    // In production, you could send to error tracking service
    // Example: Sentry.captureException(args[0]);
  },
  
  warn: (...args) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  
  info: (...args) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
  
  debug: (...args) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  }
};

// Generic error message for users (don't expose internal details)
export const getUserFriendlyError = (error) => {
  if (isDevelopment) {
    return error.message || 'An error occurred';
  }
  return 'Something went wrong. Please try again later.';
};

export default logger;
