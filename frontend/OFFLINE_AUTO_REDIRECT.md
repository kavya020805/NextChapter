# Automatic Offline Redirect Feature

## Overview
When users go offline, they are automatically redirected to the offline library (`/offline`) where they can access their cached books.

## How It Works

### Automatic Detection
- The app continuously monitors the browser's online/offline status
- When the user goes offline, they are automatically redirected to `/offline`
- When they come back online, a console message confirms the connection

### Smart Redirects
The redirect is smart and won't interfere with:
- ✅ Users already on the offline page
- ✅ Users reading a book (reader pages)
- ✅ Other critical pages

### Implementation

#### Hook: `useOfflineRedirect`
Location: `src/hooks/useOfflineRedirect.js`

```javascript
import { useOfflineRedirect } from '../hooks/useOfflineRedirect';

function MyPage() {
  // Enable auto-redirect
  useOfflineRedirect();
  
  // Or disable it for specific pages
  useOfflineRedirect(false);
  
  return <div>...</div>;
}
```

#### Pages with Auto-Redirect
Currently enabled on:
- ✅ Landing Page (`/`)
- ✅ Books Page (`/books`)
- ✅ Other main browsing pages (can be added)

#### Pages WITHOUT Auto-Redirect
- ❌ Offline Library (`/offline`) - already there
- ❌ Reader pages - let users continue reading
- ❌ Auth pages - don't interrupt login/signup

## User Experience

### Scenario 1: User Goes Offline While Browsing
1. User is browsing books on `/books`
2. Internet connection drops
3. User is automatically redirected to `/offline`
4. User sees their cached books
5. User can continue reading cached books

### Scenario 2: User Goes Offline While Reading
1. User is reading a book on `/reader-local?id=BOOK_001`
2. Internet connection drops
3. **No redirect** - user continues reading
4. Book loads from cache
5. Reading progress saved locally

### Scenario 3: User Comes Back Online
1. User is on `/offline`
2. Internet connection restored
3. Console shows: "📶 You are back online!"
4. User can navigate back to browse all books
5. Reading progress syncs to database

## Console Messages

When offline:
```
📴 You are offline, redirecting to offline library...
```

When back online:
```
📶 You are back online!
```

## Technical Details

### Browser API Used
- `navigator.onLine` - Check current status
- `window.addEventListener('offline')` - Detect going offline
- `window.addEventListener('online')` - Detect coming online

### Navigation
- Uses React Router's `navigate()` with `replace: true`
- Replaces history entry (back button works correctly)
- Doesn't create navigation loops

## Customization

### Disable for Specific Pages
```javascript
// Don't redirect on this page
useOfflineRedirect(false);
```

### Add to More Pages
```javascript
import { useOfflineRedirect } from '../hooks/useOfflineRedirect';

function MyNewPage() {
  useOfflineRedirect(); // Enable auto-redirect
  // ... rest of component
}
```

### Custom Offline Behavior
Modify `src/hooks/useOfflineRedirect.js` to:
- Show a notification instead of redirecting
- Redirect to a different page
- Add a delay before redirecting
- Store the previous page to return to

## Benefits

1. **Better UX** - Users don't see broken pages when offline
2. **Automatic** - No manual navigation needed
3. **Smart** - Doesn't interrupt reading or critical flows
4. **Seamless** - Works in the background
5. **Informative** - Console messages keep users informed

## Future Enhancements

Possible improvements:
- Show a toast notification before redirecting
- Remember the page user was on and return after coming online
- Add a countdown before redirect
- Cache more pages for offline viewing
- Service Worker for true offline support
