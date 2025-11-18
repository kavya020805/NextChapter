-- Test Script: Verify Reported Comments Access
-- Run this to diagnose why reported comments aren't showing

-- Step 1: Check if the table exists and has data
SELECT 
  'Table exists with data' as status,
  COUNT(*) as total_reports
FROM book_comment_reports;

-- Step 2: Check the actual data
SELECT 
  id,
  book_id,
  comment_id,
  user_id,
  reason,
  created_at
FROM book_comment_reports
ORDER BY created_at DESC
LIMIT 5;

-- Step 3: Check if the reason column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'book_comment_reports'
ORDER BY ordinal_position;

-- Step 4: Check current RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'book_comment_reports';

-- Step 5: Check if current user is admin
SELECT 
  user_id,
  is_admin,
  username
FROM user_profiles
WHERE user_id = auth.uid();

-- Step 6: Test the join query (same as in the app)
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
LIMIT 5;

-- Step 7: Check if there are any permission issues
-- This will show an error if RLS is blocking access
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN 'Access granted - can see reports'
    ELSE 'No reports found'
  END as access_status
FROM book_comment_reports;
