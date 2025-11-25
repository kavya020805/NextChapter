import React from 'react';
import logger from '../lib/logger';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logger.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-dark-gray dark:bg-white flex items-center justify-center p-4">
          <div className="max-w-md text-center">
            <h1 className="text-4xl text-white dark:text-dark-gray mb-4">
              Oops!
            </h1>
            <p className="text-white/70 dark:text-dark-gray/70 mb-6">
              Something went wrong. Please refresh the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-white dark:bg-dark-gray text-dark-gray dark:text-white uppercase tracking-wider"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
