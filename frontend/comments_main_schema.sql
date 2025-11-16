-- Main Comments Schema for NextChapter Book Platform
-- This script creates the main book_comments and book_comment_replies tables

-- Table: book_comments
-- Main table for storing book comments
CREATE TABLE IF NOT EXISTS book_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  text TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  upvotes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: book_comment_replies
-- Table for storing replies to comments
CREATE TABLE IF NOT EXISTS book_comment_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES book_comments(id) ON DELETE CASCADE,
  book_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  text TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  upvotes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_book_comments_book_id ON book_comments(book_id);
CREATE INDEX IF NOT EXISTS idx_book_comments_user_id ON book_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_book_comments_created_at ON book_comments(created_at);

CREATE INDEX IF NOT EXISTS idx_book_comment_replies_comment_id ON book_comment_replies(comment_id);
CREATE INDEX IF NOT EXISTS idx_book_comment_replies_book_id ON book_comment_replies(book_id);
CREATE INDEX IF NOT EXISTS idx_book_comment_replies_user_id ON book_comment_replies(user_id);
CREATE INDEX IF NOT EXISTS idx_book_comment_replies_created_at ON book_comment_replies(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE book_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_comment_replies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for book_comments
CREATE POLICY "Users can view all comments" ON book_comments FOR SELECT USING (true);

CREATE POLICY "Users can insert comments" ON book_comments FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND auth.uid() = user_id
);

CREATE POLICY "Users can update their own comments" ON book_comments FOR UPDATE USING (
  auth.uid() = user_id
);

CREATE POLICY "Users can delete their own comments" ON book_comments FOR DELETE USING (
  auth.uid() = user_id
);

-- RLS Policies for book_comment_replies
CREATE POLICY "Users can view all replies" ON book_comment_replies FOR SELECT USING (true);

CREATE POLICY "Users can insert replies" ON book_comment_replies FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND auth.uid() = user_id
);

CREATE POLICY "Users can update their own replies" ON book_comment_replies FOR UPDATE USING (
  auth.uid() = user_id
);

CREATE POLICY "Users can delete their own replies" ON book_comment_replies FOR DELETE USING (
  auth.uid() = user_id
);
