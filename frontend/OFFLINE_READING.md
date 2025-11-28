# Offline Reading Feature

## Overview
The offline reading feature allows users to access their cached books even when they don't have an internet connection. Books are automatically cached when opened, including the PDF file and metadata (title, author, description, cover image).

## How It Works

### Automatic Caching
When a user opens a book in the reader:
1. **PDF is cached** - The entire PDF file is stored in browser cache
2. **Metadata is cached** - Book information (title, author, description, cover) is stored separately
3. **Available offline** - Book appears in the Offline Library page

### Accessing Offline Books
Users can access their cached books in two ways:

1. **Navigate to `/offline`** - Shows all cached books
2. **Use the Header menu** - Click "Offline Library" in the navigation

### Offline Detection
- The app automatically detects when the user goes offline
- A status banner shows online/offline state
- Cached books remain accessible offline
- Reading progress is saved locally and synced when back online

## Features

### Offline Library Page
- **Clean interface** - Simple navbar with logo
- **Status indicator** - Shows online/offline state
- **Book grid** - Displays all cached books with covers
- **"Cached" badge** - Visual indicator on book covers
- **Empty state** - Helpful message when no books are cached

### What's Cached
For each book:
- ✅ Complete PDF file
- ✅ Book title
- ✅ Author name
- ✅ Description
- ✅ Cover image
- ✅ Genres/categories
- ✅ Cache timestamp

### Storage
- **PDF Cache**: `nextchapter-pdf-cache-v1`
- **Metadata Cache**: `nextchapter-metadata-cache-v1`
- **Expiry**: 30 days
- **Location**: Browser Cache API (separate from localStorage)

## Technical Implementation

### Files Created/Modified

1. **`src/lib/pdfCache.js`** - Added metadata caching functions:
   - `cacheBookMetadata()` - Store book metadata
   - `getCachedBooks()` - Retrieve all cached books
   - `isBookCached()` - Check if book is cached
   - `removeCachedBook()` - Remove book from cache
   - `clearMetadataCache()` - Clear all metadata

2. **`src/pages/OfflinePage.jsx`** - New offline library page

3. **`src/components/ReaderLocal.jsx`** - Auto-cache metadata when book opens

4. **`src/App.jsx`** - Added `/offline` route

5. **`src/components/Header.jsx`** - Added "Offline Library" link

### API Functions

```javascript
import { 
  cacheBookMetadata, 
  getCachedBooks, 
  isBookCached,
  removeCachedBook 
} from '../lib/pdfCache';

// Cache book metadata
await cacheBookMetadata(bookId, {
  title: 'Book Title',
  author: 'Author Name',
  description: 'Book description',
  cover_image: 'https://...',
  genres: ['Fiction', 'Mystery']
});

// Get all cached books
const books = await getCachedBooks();
// Returns: [{ bookId, title, author, description, cover_image, cachedAt, ... }]

// Check if book is cached
const isCached = await isBookCached(bookId, pdfUrl);

// Remove book from cache
await removeCachedBook(bookId, pdfUrl);
```

## User Experience

### First Time Opening a Book
1. User opens a book
2. PDF loads from Supabase
3. PDF and metadata are cached in background
4. Book appears in Offline Library

### Opening Cached Book Offline
1. User goes offline
2. Navigates to `/offline`
3. Sees all cached books
4. Clicks on a book
5. Book opens instantly from cache
6. Can read normally

### Reading Progress
- Progress is saved locally when offline
- Syncs to database when back online
- No data loss

## Browser Compatibility

Works in all modern browsers with:
- Cache API support
- IndexedDB support
- Service Worker support (optional)

Tested on:
- ✅ Chrome/Edge (v90+)
- ✅ Firefox (v85+)
- ✅ Safari (v14+)

## Storage Limits

- **Desktop browsers**: ~50-100MB cache
- **Mobile browsers**: ~25-50MB cache
- **Automatic cleanup**: Old PDFs removed after 30 days
- **Manual cleanup**: Users can clear cache via Cache Manager

## Future Enhancements

Possible improvements:
- Service Worker for true offline support
- Background sync for reading progress
- Selective caching (choose which books to cache)
- Download progress indicator
- Offline search within cached books
- Export cached books
- Share cached books between devices

## Troubleshooting

### Books not appearing in Offline Library
- Ensure book was fully opened (not just viewed)
- Check browser cache isn't full
- Try clearing cache and re-opening book

### Cover images not loading offline
- Cover images are cached, but may fail if:
  - Image URL is external (not from Supabase)
  - Image was deleted from storage
  - Cache was cleared

### Reading progress not syncing
- Progress saves locally when offline
- Will sync automatically when back online
- Check browser console for sync errors
