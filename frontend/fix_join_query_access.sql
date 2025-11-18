-- Fix: Allow Admins to Access Related Tables for Reported Comments
-- This fixes the join query that fetches book_comments and books data

-- 1. Allow admins to SELECT from book_comments (needed for the join)
DO $
BEGIN
  -- Check if policy already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'book_comments' 
    AND policyname = 'Admins can view all comments'
  ) THEN
    CREATE POLICY "Admins can view all comments" 
    ON book_comments 
    FOR SELECT 
    USING (
      EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.user_id = auth.uid() 
        AND user_profiles.is_admin = TRUE
      )
    );
  END IF;
END $;

-- 2. Allow admins to SELECT from books (needed for the join)
DO $
BEGIN
  -- Check if policy already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'books' 
    AND policyname = 'Admins can view all books'
  ) THEN
    CREATE POLICY "Admins can view all books" 
    ON books 
    FOR SELECT 
    USING (
      EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.user_id = auth.uid() 
        AND user_profiles.is_admin = TRUE
      )
    );
  END IF;
END $;

-- 3. Test the join query
SELECT 
  bcr.id,
  bcr.comment_id,
  bcr.book_id,
  bcr.reason,
  bcr.created_at,
  bc.text as comment_text,
  b.title as book_title
FROM book_comment_reports bcr
LEFT JOIN book_comments bc ON bcr.comment_id = bc.id
LEFT JOIN books b ON bcr.book_id = b.id
ORDER BY bcr.created_at DESC
LIMIT 10;

-- If the above query returns 3 rows with data, the fix worked!
