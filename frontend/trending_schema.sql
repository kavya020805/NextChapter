-- Trending Books Feature - Database Schema
-- This schema creates the necessary tables to track book metrics for trending calculations
-- 
-- Formula: trendingScore = (1.0 * NewReads) + (0.5 * WishlistAdds) + 
--                            (2.0 * RecentAvgRating * RecentRatingCount) + 
--                            (0.1 * AvgScrollDepth%) + (1.5 * NewDiscussions)

-- Table: book_reads
-- Tracks when users mark books as read
CREATE TABLE IF NOT EXISTS book_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(book_id, user_id)
);

-- Table: book_wishlist
-- Tracks when users add books to their wishlist
CREATE TABLE IF NOT EXISTS book_wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(book_id, user_id)
);

-- Table: book_ratings
-- Tracks user ratings for books
CREATE TABLE IF NOT EXISTS book_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  rated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(book_id, user_id)
);

-- Table: book_discussions
-- Tracks discussions/threads about books
CREATE TABLE IF NOT EXISTS book_discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: book_scroll_depth
-- Tracks how far users scroll through books (for engagement metrics)
CREATE TABLE IF NOT EXISTS book_scroll_depth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scroll_depth_percentage NUMERIC(5, 2) NOT NULL CHECK (scroll_depth_percentage >= 0 AND scroll_depth_percentage <= 100),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_book_reads_book_id ON book_reads(book_id);
CREATE INDEX IF NOT EXISTS idx_book_reads_read_at ON book_reads(read_at);
CREATE INDEX IF NOT EXISTS idx_book_reads_user_id ON book_reads(user_id);

CREATE INDEX IF NOT EXISTS idx_book_wishlist_book_id ON book_wishlist(book_id);
CREATE INDEX IF NOT EXISTS idx_book_wishlist_added_at ON book_wishlist(added_at);
CREATE INDEX IF NOT EXISTS idx_book_wishlist_user_id ON book_wishlist(user_id);

CREATE INDEX IF NOT EXISTS idx_book_ratings_book_id ON book_ratings(book_id);
CREATE INDEX IF NOT EXISTS idx_book_ratings_rated_at ON book_ratings(rated_at);
CREATE INDEX IF NOT EXISTS idx_book_ratings_user_id ON book_ratings(user_id);

CREATE INDEX IF NOT EXISTS idx_book_discussions_book_id ON book_discussions(book_id);
CREATE INDEX IF NOT EXISTS idx_book_discussions_created_at ON book_discussions(created_at);
CREATE INDEX IF NOT EXISTS idx_book_discussions_user_id ON book_discussions(user_id);

CREATE INDEX IF NOT EXISTS idx_book_scroll_depth_book_id ON book_scroll_depth(book_id);
CREATE INDEX IF NOT EXISTS idx_book_scroll_depth_user_id ON book_scroll_depth(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE book_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_scroll_depth ENABLE ROW LEVEL SECURITY;

-- RLS Policies for book_reads
CREATE POLICY "Users can view all book reads"
  ON book_reads FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own book reads"
  ON book_reads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own book reads"
  ON book_reads FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own book reads"
  ON book_reads FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for book_wishlist
CREATE POLICY "Users can view all wishlist items"
  ON book_wishlist FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own wishlist items"
  ON book_wishlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wishlist items"
  ON book_wishlist FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlist items"
  ON book_wishlist FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for book_ratings
CREATE POLICY "Users can view all book ratings"
  ON book_ratings FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own book ratings"
  ON book_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own book ratings"
  ON book_ratings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own book ratings"
  ON book_ratings FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for book_discussions
CREATE POLICY "Users can view all book discussions"
  ON book_discussions FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own book discussions"
  ON book_discussions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own book discussions"
  ON book_discussions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own book discussions"
  ON book_discussions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for book_scroll_depth
CREATE POLICY "Users can view all scroll depth data"
  ON book_scroll_depth FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own scroll depth data"
  ON book_scroll_depth FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scroll depth data"
  ON book_scroll_depth FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scroll depth data"
  ON book_scroll_depth FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at for book_ratings
CREATE TRIGGER update_book_ratings_updated_at
  BEFORE UPDATE ON book_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to automatically update updated_at for book_discussions
CREATE TRIGGER update_book_discussions_updated_at
  BEFORE UPDATE ON book_discussions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

