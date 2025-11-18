-- Fix Admin Access to Reported Comments
-- This script updates RLS policies to allow admins to view and manage all reported comments

-- Drop existing policy
DROP POLICY IF EXISTS "Users can manage comment reports" ON public.book_comment_reports;

-- Create new policies for comment reports
-- Policy 1: Users can view and manage their own reports
CREATE POLICY "Users can manage their own comment reports" 
ON public.book_comment_reports 
FOR ALL 
USING (auth.uid() = user_id);

-- Policy 2: Admins can view and manage all reports
CREATE POLICY "Admins can manage all comment reports" 
ON public.book_comment_reports 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.is_admin = TRUE
  )
);

-- Do the same for reply reports if the table exists
DO $
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'book_reply_reports'
  ) THEN
    -- Drop existing policy
    EXECUTE 'DROP POLICY IF EXISTS "Users can manage reply reports" ON public.book_reply_reports';
    
    -- Create new policies for reply reports
    EXECUTE 'CREATE POLICY "Users can manage their own reply reports" 
    ON public.book_reply_reports 
    FOR ALL 
    USING (auth.uid() = user_id)';
    
    EXECUTE 'CREATE POLICY "Admins can manage all reply reports" 
    ON public.book_reply_reports 
    FOR ALL 
    USING (
      EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.user_id = auth.uid() 
        AND user_profiles.is_admin = TRUE
      )
    )';
  END IF;
END $;

-- Ensure the reason column exists
DO $
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'book_comment_reports' 
        AND column_name = 'reason'
    ) THEN
        ALTER TABLE public.book_comment_reports 
        ADD COLUMN reason TEXT;
    END IF;
END $;
