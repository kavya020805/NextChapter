import logger from './logger';

export const handleError = (error, context = '') => {
  logger.error(`Error in ${context}:`, error);
  
  // User-friendly message
  const message = getUserFriendlyMessage(error);
  return message;
};

const getUserFriendlyMessage = (error) => {
  if (error.message?.includes('network')) {
    return 'Network error. Please check your connection.';
  }
  if (error.message?.includes('auth')) {
    return 'Authentication error. Please sign in again.';
  }
  if (error.code === '23505') {
    return 'This item already exists.';
  }
  return 'Something went wrong. Please try again.';
};

export const withErrorHandling = (fn, context) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, context);
      throw error;
    }
  };
};
