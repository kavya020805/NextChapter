-- Diagnostic: Check Book Genre Data
-- Run this in Supabase SQL Editor to see what's in your books table

-- 1. Check if genre column exists and has data
SELECT 
  id,
  title,
  genre,
  subjects,
  CASE 
    WHEN genre IS NOT NULL THEN 'Has genre'
    WHEN subjects IS NOT NULL THEN 'Has subjects'
    ELSE 'No genre data'
  END as genre_status
FROM books
LIMIT 10;

-- 2. Count books by genre field
SELECT 
  genre,
  COUNT(*) as count
FROM books
WHERE genre IS NOT NULL
GROUP BY genre
ORDER BY count DESC;

-- 3. Check subjects field (if it's an array)
SELECT 
  id,
  title,
  subjects,
  array_length(subjects, 1) as num_subjects
FROM books
WHERE subjects IS NOT NULL
LIMIT 10;

-- 4. Check column types
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'books'
AND column_name IN ('genre', 'subjects')
ORDER BY column_name;
