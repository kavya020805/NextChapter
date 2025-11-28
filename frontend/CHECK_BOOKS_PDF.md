# Debugging "Loading PDF..." Issue

## The Problem
Some books get stuck at "Loading PDF..." - this is usually because:
1. The book doesn't have a PDF file path in the database
2. The PDF file doesn't exist in Supabase storage
3. The PDF URL is malformed

## How to Debug

### Step 1: Check Console Logs
When a book is stuck, check the browser console (F12) for:

```
Book data: {
  id: "...",
  title: "...",
  pdf_file: null,        ← If this is null
  pdf_path: null,        ← AND this is null  
  pdf_filename: null,    ← AND this is null
  resolved: undefined    ← Then this will be undefined
}
```

If `resolved` is `undefined` or `null`, the book has no PDF path in the database.

### Step 2: Check Database
Run this query in your Supabase SQL editor:

```sql
-- Find books without PDF paths
SELECT id, title, pdf_file, pdf_path, pdf_filename
FROM books
WHERE pdf_file IS NULL 
  AND pdf_path IS NULL 
  AND pdf_filename IS NULL;
```

### Step 3: Check Supabase Storage
1. Go to Supabase Dashboard → Storage → Book-storage
2. Check if the PDF file actually exists
3. Verify the file name matches what's in the database

## Common Issues & Solutions

### Issue 1: Missing PDF Path in Database
**Symptom**: `resolved: undefined` in console

**Solution**: Update the database with the correct PDF path:
```sql
UPDATE books 
SET pdf_file = 'path/to/file.pdf'
WHERE id = 'book-id';
```

### Issue 2: Wrong File Path
**Symptom**: `❌ Failed to fetch PDF: 404`

**Solution**: 
- Check the actual file name in Supabase storage
- Update database to match exact file name (case-sensitive!)

### Issue 3: File Not in Storage
**Symptom**: 404 error when trying to load PDF

**Solution**:
- Upload the PDF to Supabase storage
- Make sure it's in the `Book-storage` bucket
- Update database with correct path

### Issue 4: Storage Permissions
**Symptom**: 403 Forbidden error

**Solution**:
- Go to Supabase → Storage → Book-storage → Policies
- Make sure there's a policy allowing public read access:
  ```sql
  CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'Book-storage');
  ```

## Quick Fix Script

Run this in browser console to check all books:

```javascript
// Check which books have PDF issues
const { supabase } = await import('/src/lib/supabaseClient.js');

const { data: books } = await supabase
  .from('books')
  .select('id, title, pdf_file, pdf_path, pdf_filename');

const problematic = books.filter(b => 
  !b.pdf_file && !b.pdf_path && !b.pdf_filename
);

console.log('Books without PDF paths:', problematic.length);
console.table(problematic);
```

## Prevention

To prevent this in the future:
1. Always set `pdf_file` when adding new books
2. Verify the file exists in storage before adding to database
3. Use consistent naming (e.g., always use `pdf_file` column)
4. Add a database constraint to ensure at least one PDF field is set

## Need More Help?

If books are still stuck:
1. Share the console output when opening a stuck book
2. Share the book ID or title
3. Check if the PDF file exists in Supabase storage
