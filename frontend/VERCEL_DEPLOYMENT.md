# Vercel Deployment Guide

## Fixed Issues
1. ✅ Added `vercel.json` with SPA rewrite rule (`/(.*) → /`)
2. ✅ Updated `vite.config.js` with `historyApiFallback: true`
3. ✅ Removed hardcoded localhost from moderation service
4. ✅ All redirects use `window.location.origin` (dynamic)
5. ✅ Verified all 16 page components exist
6. ✅ Verified all routes are properly configured in App.jsx

## Environment Variables Setup

In your Vercel project dashboard, add these environment variables:

### Required Variables
```
VITE_SUPABASE_URL=https://tbwtxhfqvbwlgpyqskss.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRid3R4aGZxdmJ3bGdweXFza3NzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MzI3MDMsImV4cCI6MjA3ODEwODcwM30._Zm5iJCL6zqU65KtxzO9SabE-av06BhwBC1kbeHhgWM
```

### Optional (if you have a deployed moderation API)
```
VITE_MODERATION_API_URL=https://your-moderation-api.com
```

## Steps to Deploy

1. **Push your changes to GitHub**
   ```bash
   git add .
   git commit -m "Fix Vercel deployment configuration"
   git push
   ```

2. **Configure Vercel Project Settings**
   - Go to your Vercel dashboard: https://vercel.com/dashboard
   - Select your project
   - Go to Settings → General
   - Set **Root Directory** to: `NextChapter/frontend`
   - Set **Framework Preset** to: `Vite`
   - Build Command: `npm run build` (should be auto-detected)
   - Output Directory: `dist` (should be auto-detected)

3. **Add Environment Variables**
   - Go to Settings → Environment Variables
   - Add the variables listed above
   - Make sure to add them for all environments (Production, Preview, Development)

4. **Redeploy**
   - Go to Deployments tab
   - Click the three dots on the latest deployment
   - Click "Redeploy"

## Supabase Configuration

Make sure your Supabase project has the correct redirect URLs:

1. Go to your Supabase dashboard
2. Navigate to Authentication → URL Configuration
3. Add these URLs to **Redirect URLs**:
   - `https://nextchapter-it-314.vercel.app/auth/callback` ⭐ **IMPORTANT: OAuth callback**
   - `https://nextchapter-it-314.vercel.app/reset-password`
   - `http://localhost:5173/auth/callback` (for local development)
   - `http://localhost:5173/reset-password` (for local development)

4. Set **Site URL** to: `https://nextchapter-it-314.vercel.app`

**Note**: The `/auth/callback` route is critical for OAuth to work correctly for both old and new users. It overrides any old redirect URLs stored in user metadata.

## Troubleshooting

### Website Not Reachable
- Check if environment variables are set correctly in Vercel
- Verify the build completed successfully
- Check Vercel deployment logs for errors

### OAuth Not Working
- Verify Supabase redirect URLs include your Vercel domain
- Check browser console for errors
- Ensure `window.location.origin` is resolving correctly

### 404 on Page Refresh
- This should be fixed by `vercel.json` - if still happening, verify the file is in the correct location

## Testing Locally

Before deploying, test locally:
```bash
cd NextChapter/frontend
npm run build
npm run preview
```

This simulates the production build.
