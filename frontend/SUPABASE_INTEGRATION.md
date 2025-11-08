<!-- @format -->

`# Supabase Integration Guide

## Overview

Your NextChapter app now fetches books data from Supabase instead of the local `books-data.json` file.

## What Was Changed

### Updated Files:

1. **BooksPage.jsx** - Main books listing page
2. **ReadingListPage.jsx** - User's reading list
3. **AlreadyReadPage.jsx** - Books marked as read
4. **BookDetailPage.jsx** - Individual book details

All pages now:

- Import and use the Supabase client
- Fetch data from the `books` table in your Supabase database
- Include fallback to local JSON if Supabase fails

## Supabase Configuration

### 1. Environment Variables

Make sure your `.env` file contains:

```env
VITE_SUPABASE_URL=https://tbwtxhfqvbwlgpyqskss.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 2. Database Table Structure

Your Supabase `books` table should have these columns:

**Required columns:**

- `id` (text/varchar) - Unique book identifier
- `title` (text) - Book title
- `author` (text) - Author name

**Optional columns:**

- `cover_image` (text) - URL to book cover image
- `pdf_file` (text) - PDF filename in Supabase Storage (e.g., 'book-name.pdf')
- `subjects` (text[] or jsonb) - Array of subjects/genres
- `genre` (text) - Book genre
- `description` (text) - Book description
- `language` (text) - Book language
- `downloads` (integer) - Download count

### 3. Supabase Storage Setup

Create a storage bucket for PDF files:

1. Go to Supabase Dashboard → Storage
2. Create a new bucket named `Book-storage`
3. Set bucket to **Public** (or configure appropriate policies)
4. Upload your PDF files to this bucket
5. Store the filename in the `pdf_file` column of your books table

**Example:**

- Upload file: `pride-and-prejudice.pdf` to `Book-storage` bucket
- In books table: Set `pdf_file = 'pride-and-prejudice.pdf'`

### 4. Row Level Security (RLS)

Make sure your `books` table has appropriate RLS policies:

```sql
-- Allow public read access to books
CREATE POLICY "Allow public read access" ON books
  FOR SELECT USING (true);
```

**Storage Bucket Policies:**

```sql
-- Allow public read access to Book-storage bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'Book-storage' );
```

## Testing

1. **Start your dev server:**

   ```bash
   npm run dev
   ```

2. **Check the browser console** for:

   - "Fetched books from Supabase: X" - Success message
   - Any error messages if connection fails

3. **Navigate to:**
   - `/books` - Should display all books from Supabase
   - `/reading-list` - Should show your reading list
   - `/already-read` - Should show read books
   - `/book/:id` - Should show individual book details

## Fallback Behavior

If Supabase connection fails, the app will automatically try to load from `/public/books-data.json` as a fallback. This ensures your app continues working even if there are database issues.

## Common Issues

### Issue: "No books found"

**Solution:**

- Check your `.env` file has correct Supabase credentials
- Verify the `books` table exists in your Supabase database
- Check RLS policies allow public read access
- Look at browser console for specific error messages

### Issue: Books not loading

**Solution:**

- Open browser DevTools → Network tab
- Look for failed Supabase requests
- Check if CORS is properly configured in Supabase

### Issue: "PGRST116" error

**Solution:** This means no rows were found. Check that:

- Your books table has data
- The book ID in the URL matches IDs in your database

## Next Steps

1. **Populate your database** with books data
2. **Test all pages** to ensure data loads correctly
3. **Remove the local JSON fallback** once Supabase is stable (optional)
4. **Add more features** like:
   - User-specific reading lists stored in Supabase
   - Book ratings and reviews in the database
   - Real-time updates with Supabase subscriptions

## Support

If you encounter issues:

1. Check the browser console for errors
2. Verify your Supabase dashboard shows the correct table structure
3. Test your Supabase connection using the Supabase dashboard SQL editor
