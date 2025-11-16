-- Add reason column to report tables
-- This script adds the reason column to both comment and reply report tables

-- Add reason column to book_comment_reports
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'book_comment_reports' 
        AND column_name = 'reason'
    ) THEN
        ALTER TABLE public.book_comment_reports 
        ADD COLUMN reason TEXT;
        
        -- Add comment
        COMMENT ON COLUMN public.book_comment_reports.reason IS 'The reason for reporting the comment';
    END IF;
END $$;

-- Add reason column to book_reply_reports if it exists
DO $$
BEGIN
    -- Check if table exists first
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'book_reply_reports'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'book_reply_reports' 
            AND column_name = 'reason'
        ) THEN
            ALTER TABLE public.book_reply_reports 
            ADD COLUMN reason TEXT;
            
            -- Add comment
            COMMENT ON COLUMN public.book_reply_reports.reason IS 'The reason for reporting the reply';
        END IF;
    END IF;
END $$;

-- Create book_reply_reports table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.book_reply_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id TEXT NOT NULL,
  reply_id UUID NOT NULL,
  user_id UUID NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(reply_id, user_id)
);

-- Add foreign key to book_reply_reports if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'book_reply_reports_reply_id_fkey'
        AND table_name = 'book_reply_reports'
    ) THEN
        ALTER TABLE public.book_reply_reports 
        ADD CONSTRAINT book_reply_reports_reply_id_fkey 
        FOREIGN KEY (reply_id) REFERENCES public.book_comment_replies(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_book_reply_reports_reply_id ON public.book_reply_reports(reply_id);
CREATE INDEX IF NOT EXISTS idx_book_reply_reports_user_id ON public.book_reply_reports(user_id);

-- Enable Row Level Security (RLS) for reply reports table
ALTER TABLE public.book_reply_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policy for reply reports
DROP POLICY IF EXISTS "Users can manage reply reports" ON public.book_reply_reports;
CREATE POLICY "Users can manage reply reports" ON public.book_reply_reports FOR ALL USING (auth.uid() = user_id);
