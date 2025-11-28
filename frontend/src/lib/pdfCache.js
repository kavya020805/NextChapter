// pdfCache.js
// Service for caching PDF files in the browser's Cache API
// Stores entire PDF files locally for faster subsequent loads from Supabase storage

const CACHE_NAME = 'nextchapter-pdf-cache-v1';
const CACHE_EXPIRY_DAYS = 30; // PDFs expire after 30 days

/**
 * Get cached PDF URL or fetch and cache it
 * Returns a URL that can be used with pdf.js getDocument()
 * @param {string} pdfUrl - URL of the PDF to fetch from Supabase
 * @returns {Promise<string>} - URL to use with pdf.js (either original URL or cached blob URL)
 */
export async function getCachedPdfUrl(pdfUrl) {
  if (!pdfUrl) {
    throw new Error('PDF URL is required');
  }

  // Check if Cache API is supported
  if (typeof caches === 'undefined') {
    console.warn('Cache API not supported, using direct URL');
    return pdfUrl;
  }

  try {
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Cache check timeout')), 3000)
    );

    const cacheCheckPromise = (async () => {
      // Open the cache
      const cache = await caches.open(CACHE_NAME);
      
      // Check if PDF is already cached
      const cachedResponse = await cache.match(pdfUrl);
      
      if (cachedResponse) {
        console.log('✓ Loading PDF from cache:', pdfUrl);
        
        // Check if cache is expired
        const cachedDate = cachedResponse.headers.get('x-cached-date');
        if (cachedDate) {
          const cacheAge = Date.now() - parseInt(cachedDate);
          const maxAge = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
          
          if (cacheAge > maxAge) {
            console.log('Cache expired, using direct URL and refreshing cache in background');
            // Delete expired cache in background
            cache.delete(pdfUrl).catch(err => console.warn('Failed to delete expired cache:', err));
            // Return original URL immediately
            return pdfUrl;
          }
        }
        
        // Try to create blob URL from cached response
        try {
          const blob = await cachedResponse.blob();
          const blobUrl = URL.createObjectURL(blob);
          console.log('Created blob URL from cache');
          return blobUrl;
        } catch (blobError) {
          console.warn('Failed to create blob from cache, using direct URL:', blobError);
          return pdfUrl;
        }
      }
      
      // PDF not in cache, use direct URL and cache in background
      console.log('⬇ PDF not cached, using direct URL and caching in background');
      
      // Cache in background without blocking
      fetchAndCachePdf(pdfUrl, cache)
        .then(() => {
          console.log('✅ Background caching completed for:', pdfUrl);
        })
        .catch(err => {
          console.error('❌ Background caching failed for:', pdfUrl, err);
        });
      
      // Return original URL immediately for faster loading
      return pdfUrl;
    })();

    // Race between cache check and timeout
    return await Promise.race([cacheCheckPromise, timeoutPromise]);
    
  } catch (error) {
    console.error('Error accessing PDF cache, using direct URL:', error);
    // Fallback: return original URL without caching
    return pdfUrl;
  }
}

/**
 * Fetch PDF from network and store in cache (background operation)
 * @param {string} pdfUrl - URL of the PDF
 * @param {Cache} cache - Cache instance
 * @returns {Promise<void>}
 */
async function fetchAndCachePdf(pdfUrl, cache) {
  const startTime = Date.now();
  
  try {
    console.log('📥 Fetching PDF for caching:', pdfUrl);
    
    // Add timeout for fetch
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
    
    const response = await fetch(pdfUrl, { 
      signal: controller.signal,
      mode: 'cors',
      credentials: 'omit'
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
    }
    
    console.log('📦 PDF fetched, preparing to cache...');
    
    // Clone the response before reading it
    const responseToCache = response.clone();
    
    // Add custom header with cache timestamp
    const headers = new Headers(responseToCache.headers);
    headers.set('x-cached-date', Date.now().toString());
    
    const blob = await responseToCache.blob();
    const sizeMB = (blob.size / (1024 * 1024)).toFixed(2);
    
    console.log(`💾 Storing PDF in cache (${sizeMB} MB)...`);
    
    const cachedResponse = new Response(blob, {
      status: responseToCache.status,
      statusText: responseToCache.statusText,
      headers: headers
    });
    
    // Store in cache
    await cache.put(pdfUrl, cachedResponse);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ PDF cached successfully in ${duration}s:`, pdfUrl, `(${sizeMB} MB)`);
    
  } catch (err) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    if (err.name === 'AbortError') {
      console.error(`❌ PDF caching timeout after ${duration}s:`, pdfUrl);
    } else if (err.name === 'QuotaExceededError') {
      console.error('❌ Storage quota exceeded. Cache is full. Consider clearing old PDFs.');
    } else {
      console.error(`❌ Failed to cache PDF after ${duration}s:`, pdfUrl, err.message);
    }
    
    throw err;
  }
}

/**
 * Clear all cached PDFs
 * @returns {Promise<boolean>}
 */
export async function clearPdfCache() {
  try {
    const deleted = await caches.delete(CACHE_NAME);
    console.log('PDF cache cleared:', deleted);
    return deleted;
  } catch (error) {
    console.error('Error clearing PDF cache:', error);
    return false;
  }
}

/**
 * Get cache size and statistics
 * @returns {Promise<Object>}
 */
export async function getCacheStats() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    
    let totalSize = 0;
    const pdfs = [];
    
    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        const cachedDate = response.headers.get('x-cached-date');
        
        pdfs.push({
          url: request.url,
          size: blob.size,
          cachedDate: cachedDate ? new Date(parseInt(cachedDate)) : null
        });
        
        totalSize += blob.size;
      }
    }
    
    return {
      count: pdfs.length,
      totalSize: totalSize,
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
      pdfs: pdfs
    };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return { count: 0, totalSize: 0, totalSizeMB: '0', pdfs: [] };
  }
}

/**
 * Remove a specific PDF from cache
 * @param {string} pdfUrl - URL of the PDF to remove
 * @returns {Promise<boolean>}
 */
export async function removeCachedPdf(pdfUrl) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const deleted = await cache.delete(pdfUrl);
    console.log('PDF removed from cache:', pdfUrl, deleted);
    return deleted;
  } catch (error) {
    console.error('Error removing PDF from cache:', error);
    return false;
  }
}

/**
 * Preload a PDF into cache without displaying it
 * @param {string} pdfUrl - URL of the PDF to preload
 * @returns {Promise<void>}
 */
export async function preloadPdf(pdfUrl) {
  try {
    await getCachedPdfUrl(pdfUrl);
    console.log('PDF preloaded successfully:', pdfUrl);
  } catch (error) {
    console.error('Error preloading PDF:', error);
    throw error;
  }
}
