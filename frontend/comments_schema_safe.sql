-- Safe Comments Schema for NextChapter Book Platform
-- This script only creates missing tables and fixes existing ones

-- Check and create missing tables
CREATE TABLE IF NOT EXISTS public.book_reply_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id TEXT NOT NULL,
  reply_id UUID NOT NULL,
  user_id UUID NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'upvote')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(reply_id, user_id, reaction_type)
);

CREATE TABLE IF NOT EXISTS public.book_comment_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id TEXT NOT NULL,
  comment_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- Fix existing tables if needed
-- Add foreign key to book_reply_reactions if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'book_reply_reactions_reply_id_fkey'
        AND table_name = 'book_reply_reactions'
    ) THEN
        ALTER TABLE public.book_reply_reactions 
        ADD CONSTRAINT book_reply_reactions_reply_id_fkey 
        FOREIGN KEY (reply_id) REFERENCES public.book_comment_replies(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key to book_comment_reports if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'book_comment_reports_comment_id_fkey'
        AND table_name = 'book_comment_reports'
    ) THEN
        ALTER TABLE public.book_comment_reports 
        ADD CONSTRAINT book_comment_reports_comment_id_fkey 
        FOREIGN KEY (comment_id) REFERENCES public.book_comments(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_book_reply_reactions_reply_id ON public.book_reply_reactions(reply_id);
CREATE INDEX IF NOT EXISTS idx_book_reply_reactions_user_id ON public.book_reply_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_book_comment_reports_comment_id ON public.book_comment_reports(comment_id);
CREATE INDEX IF NOT EXISTS idx_book_comment_reports_user_id ON public.book_comment_reports(user_id);

-- Enable Row Level Security (RLS) for new tables
ALTER TABLE public.book_reply_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_comment_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for new tables
DROP POLICY IF EXISTS "Users can manage reply reactions" ON public.book_reply_reactions;
CREATE POLICY "Users can manage reply reactions" ON public.book_reply_reactions FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage comment reports" ON public.book_comment_reports;
CREATE POLICY "Users can manage comment reports" ON public.book_comment_reports FOR ALL USING (auth.uid() = user_id);
