import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark-gray dark:bg-white border-t-2 border-white dark:border-dark-gray py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 md:gap-12">
          {/* Left Column - Brand */}
          <div>
            <div className="text-3xl sm:text-4xl text-white dark:text-dark-gray mb-6 sm:mb-8 leading-none">
              NextChapter
            </div>
            <p className="text-xs sm:text-sm text-white/60 dark:text-dark-gray/60 font-light uppercase tracking-widest max-w-md">
              Redefining digital reading with AI-powered intelligence
            </p>
          </div>

          {/* Right Column - Links */}
          <div className="border-t-2 border-white dark:border-dark-gray pt-6 sm:pt-8 md:pt-0 md:border-t-0 md:border-l-2 md:pl-8 lg:pl-12">
            <div className="grid grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
              <Link 
                to="/contact" 
                className="text-xs text-white dark:text-dark-gray font-medium uppercase tracking-widest hover:opacity-60 transition-opacity"
              >
                Contact
              </Link>
              <Link 
                to="/privacy" 
                className="text-xs text-white dark:text-dark-gray font-medium uppercase tracking-widest hover:opacity-60 transition-opacity"
              >
                Privacy
              </Link>
              <Link 
                to="/terms" 
                className="text-xs text-white dark:text-dark-gray font-medium uppercase tracking-widest hover:opacity-60 transition-opacity"
              >
                Terms
              </Link>
              <Link 
                to="/refunds" 
                className="text-xs text-white dark:text-dark-gray font-medium uppercase tracking-widest hover:opacity-60 transition-opacity"
              >
                Refunds
              </Link>
              <Link 
                to="/shipping" 
                className="text-xs text-white dark:text-dark-gray font-medium uppercase tracking-widest hover:opacity-60 transition-opacity"
              >
                Shipping
              </Link>
              <Link 
                to="/subscription" 
                className="text-xs text-white dark:text-dark-gray font-medium uppercase tracking-widest hover:opacity-60 transition-opacity"
              >
                Pricing
              </Link>
            </div>
            <div className="text-xs text-white/40 dark:text-dark-gray/40 font-light uppercase tracking-widest">
              © 2025 NextChapter. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
