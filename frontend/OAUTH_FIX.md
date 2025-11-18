# OAuth Login Fix for Old Users 🔧

## The Problem

❌ **Old users** (created on localhost) → Redirect to `/sign-in#access_token=...` → 404 NOT_FOUND
✅ **New users** (created on Vercel) → Redirect correctly to `/personalization` → Works

### Why This Happened

When users first logged in with Google on `localhost:5173`, Supabase stored that redirect URL in their user metadata. Even after deploying to Vercel, Supabase kept trying to use the old localhost URL, causing:

```
https://nextchapter-it-314.vercel.app/sign-in#access_token=...
```

This URL doesn't exist as a route, so Vercel returns 404.

## The Solution ✅

### 1. Created Dedicated OAuth Callback Route

**New Route**: `/auth/callback`

This route:
- Handles OAuth redirects for ALL users (old and new)
- Overrides old redirect URLs stored in user metadata
- Properly checks personalization status
- Redirects to the correct page based on user state

### 2. Updated OAuth Sign-In

Changed from:
```javascript
redirectTo: `${window.location.origin}/sign-in`
```

To:
```javascript
redirectTo: `${window.location.origin}/auth/callback`
```

This forces Supabase to ALWAYS use the callback route, ignoring old metadata.

### 3. Simplified Auth Flow

**Old Flow** (problematic):
```
Google → Supabase → /sign-in#token → AuthContext redirects → Race conditions
```

**New Flow** (clean):
```
Google → Supabase → /auth/callback → OAuthCallbackPage handles everything → Correct destination
```

## Files Changed

1. **`src/pages/OAuthCallbackPage.jsx`** (NEW)
   - Dedicated page to handle OAuth callbacks
   - Checks admin status
   - Checks personalization status
   - Redirects to correct page

2. **`src/contexts/AuthContext.jsx`** (UPDATED)
   - Changed `redirectTo` to `/auth/callback`
   - Simplified auth state change handler
   - Removed complex redirect logic (now in OAuthCallbackPage)

3. **`src/App.jsx`** (UPDATED)
   - Added route: `<Route path="/auth/callback" element={<OAuthCallbackPage />} />`

4. **`src/components/ProtectedRoute.jsx`** (ENHANCED)
   - Better loading state with spinner and messages

## Supabase Configuration Required

⚠️ **CRITICAL**: Update your Supabase redirect URLs

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Navigate to: **Authentication → URL Configuration**
4. Add these to **Redirect URLs**:

```
https://nextchapter-it-314.vercel.app/auth/callback
https://nextchapter-it-314.vercel.app/reset-password
http://localhost:5173/auth/callback
http://localhost:5173/reset-password
```

5. Set **Site URL**: `https://nextchapter-it-314.vercel.app`

## Testing

### Test Old Users
1. Use an account created on localhost
2. Click "Sign in with Google"
3. Should redirect to `/auth/callback`
4. Should then redirect to `/books` (if personalization complete) or `/personalization` (if not)

### Test New Users
1. Create a new Google account or use one that never logged in before
2. Click "Sign in with Google"
3. Should redirect to `/auth/callback`
4. Should then redirect to `/personalization` (first time)

### Test Admin Users
1. Use an admin account
2. Click "Sign in with Google"
3. Should redirect to `/auth/callback`
4. Should then redirect to `/admin`

## What Happens Now

### For Old Users:
1. Click "Sign in with Google"
2. Supabase uses NEW redirect URL: `/auth/callback`
3. OAuthCallbackPage processes the authentication
4. Checks if personalization is complete
5. Redirects to `/books` or `/personalization`
6. ✅ **No more 404 errors!**

### For New Users:
1. Same flow as old users
2. Will be redirected to `/personalization` (first time)
3. After completing personalization → redirected to `/books`

### For Admin Users:
1. Same flow
2. Automatically redirected to `/admin` dashboard

## Deployment Checklist

- [x] Created `OAuthCallbackPage.jsx`
- [x] Updated `AuthContext.jsx` with new redirect URL
- [x] Added `/auth/callback` route to `App.jsx`
- [x] Enhanced `ProtectedRoute.jsx` loading state
- [ ] Update Supabase redirect URLs (YOU NEED TO DO THIS)
- [ ] Push changes to GitHub
- [ ] Redeploy on Vercel
- [ ] Test with old user account
- [ ] Test with new user account

## Why This Works

1. **Overrides Old Metadata**: By explicitly setting `redirectTo` in every OAuth call, we override any old URLs stored in user metadata

2. **Dedicated Handler**: The callback page has ONE job - handle OAuth and route correctly

3. **No Race Conditions**: We removed complex logic from AuthContext that could cause timing issues

4. **Works for Everyone**: Old users, new users, and admins all use the same clean flow

## Troubleshooting

### Still getting 404?
- Check Supabase redirect URLs are updated
- Clear browser cache and cookies
- Try incognito mode

### Stuck on loading screen?
- Check browser console for errors
- Verify Supabase environment variables in Vercel
- Check network tab for failed requests

### Redirects to wrong page?
- Check personalization status in database
- Verify admin status in `user_roles` table
- Check console logs for redirect decisions

## Success! 🎉

After deploying these changes and updating Supabase:
- ✅ Old users can log in without 404 errors
- ✅ New users get proper onboarding flow
- ✅ Admins go directly to admin dashboard
- ✅ Clean URLs without hash fragments
- ✅ No race conditions or timing issues
