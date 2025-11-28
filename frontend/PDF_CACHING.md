# PDF Caching Feature

## Overview
The PDF caching feature stores entire PDF files in the browser's Cache API after the first download from Supabase storage. This significantly improves loading times for subsequent reads of the same book.

## How It Works

### First Time Opening a Book
1. User opens a book in the reader
2. PDF is fetched from Supabase storage
3. PDF is automatically cached in the browser
4. PDF loads normally (network speed)

### Subsequent Opens
1. User opens the same book again
2. PDF is loaded from browser cache (instant)
3. No network request needed
4. Much faster loading experience

## Features

### Automatic Caching
- PDFs are automatically cached when first opened
- No user action required
- Works seamlessly in the background

### Cache Management
- Access via "Manage PDF Cache" button in the reader sidebar
- View all cached PDFs with sizes and dates
- See total cache size in MB
- Remove individual PDFs from cache
- Clear all cached PDFs at once

### Cache Expiration
- PDFs expire after 30 days
- Expired PDFs are automatically re-fetched
- Ensures users get updated versions if books change

### Storage Efficiency
- Only caches PDFs that are actually opened
- Uses browser's built-in Cache API (separate from localStorage)
- Doesn't count against localStorage quota

## Technical Details

### Implementation
- **Cache API**: Uses browser's Cache API for storage
- **Cache Name**: `nextchapter-pdf-cache-v1`
- **Expiry**: 30 days from cache date
- **Location**: `src/lib/pdfCache.js`

### Files Modified
1. `src/lib/pdfCache.js` - Core caching logic
2. `src/components/ReaderLocal.jsx` - Integrated caching into PDF loading
3. `src/components/PdfCacheManager.jsx` - UI for cache management

### Functions Available

```javascript
import { getCachedPdfUrl, clearPdfCache, getCacheStats, removeCachedPdf, preloadPdf } from '../lib/pdfCache';

// Get cached PDF URL (fetches and caches if not cached)
const pdfUrl = await getCachedPdfUrl(supabaseUrl);

// Clear all cached PDFs
await clearPdfCache();

// Get cache statistics
const stats = await getCacheStats();
// Returns: { count, totalSize, totalSizeMB, pdfs: [...] }

// Remove specific PDF from cache
await removeCachedPdf(pdfUrl);

// Preload a PDF without displaying it
await preloadPdf(pdfUrl);
```

## User Benefits

1. **Faster Loading**: Books load instantly after first read
2. **Offline Reading**: Cached books can be read without internet (if already loaded)
3. **Reduced Data Usage**: No repeated downloads of the same PDF
4. **Better Experience**: Smoother navigation between books

## Browser Compatibility

Works in all modern browsers that support:
- Cache API (Chrome, Firefox, Safari, Edge)
- Blob URLs
- Async/await

## Privacy & Storage

- Cache is stored locally in the browser
- No data sent to external servers
- User can clear cache anytime
- Cache is cleared when browser data is cleared
- Each browser/device has its own cache

## Future Enhancements

Possible improvements:
- Preload next book in reading list
- Smart cache management (keep most-read books)
- Compression for smaller cache size
- Progress indicator during first download
- Cache size limits and warnings
