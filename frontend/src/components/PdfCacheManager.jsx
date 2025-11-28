import React, { useState, useEffect } from 'react';
import { getCacheStats, clearPdfCache, removeCachedPdf } from '../lib/pdfCache';
import { Trash2, HardDrive, X } from 'lucide-react';

const PdfCacheManager = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState({ count: 0, totalSizeMB: '0', pdfs: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadStats();
    }
  }, [isOpen]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const cacheStats = await getCacheStats();
      setStats(cacheStats);
    } catch (error) {
      console.error('Error loading cache stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear all cached PDFs? This will free up storage but PDFs will need to be downloaded again.')) {
      return;
    }

    try {
      await clearPdfCache();
      await loadStats();
      alert('Cache cleared successfully!');
    } catch (error) {
      console.error('Error clearing cache:', error);
      alert('Failed to clear cache');
    }
  };

  const handleRemovePdf = async (pdfUrl) => {
    try {
      await removeCachedPdf(pdfUrl);
      await loadStats();
    } catch (error) {
      console.error('Error removing PDF:', error);
    }
  };

  const formatUrl = (url) => {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname.split('/').pop();
      return decodeURIComponent(path || url);
    } catch {
      return url;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-gray rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <HardDrive className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <h2 className="text-xl font-medium text-gray-900 dark:text-white">PDF Cache Manager</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Loading cache information...
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Cached PDFs</div>
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {stats.count}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Size</div>
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {stats.totalSizeMB} MB
                    </div>
                  </div>
                </div>
              </div>

              {/* Clear All Button */}
              {stats.count > 0 && (
                <button
                  onClick={handleClearAll}
                  className="w-full mb-6 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All Cache
                </button>
              )}

              {/* PDF List */}
              {stats.count === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No PDFs cached yet. Open a book to cache it for faster loading.
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Cached PDFs
                  </h3>
                  {stats.pdfs.map((pdf, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {formatUrl(pdf.url)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {(pdf.size / (1024 * 1024)).toFixed(2)} MB
                          {pdf.cachedDate && (
                            <span className="ml-2">
                              • Cached {pdf.cachedDate.toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemovePdf(pdf.url)}
                        className="ml-3 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                        title="Remove from cache"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Cached PDFs are stored in your browser for faster loading. They will be automatically
            removed after 30 days or when you clear your browser data.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PdfCacheManager;
