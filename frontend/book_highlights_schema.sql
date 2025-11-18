-- Create book_highlights table for storing user highlights
-- Note: This matches the existing table structure in your database
CREATE TABLE IF NOT EXISTS public.book_highlights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  book_id TEXT NOT NULL,
  content TEXT NOT NULL,
  note TEXT NULL,
  color TEXT NULL DEFAULT 'yellow',
  location JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT book_highlights_book_fk FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE CASCADE,
  CONSTRAINT book_highlights_user_fk FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_book_highlights_user_id ON book_highlights(user_id);
CREATE INDEX IF NOT EXISTS idx_book_highlights_book_id ON book_highlights(book_id);
CREATE INDEX IF NOT EXISTS idx_book_highlights_user_book ON book_highlights(user_id, book_id);

-- Enable Row Level Security
ALTER TABLE book_highlights ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own highlights"
  ON book_highlights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own highlights"
  ON book_highlights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own highlights"
  ON book_highlights FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own highlights"
  ON book_highlights FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION set_book_highlights_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trg_book_highlights_updated_at
  BEFORE UPDATE ON book_highlights
  FOR EACH ROW
  EXECUTE FUNCTION set_book_highlights_updated_at();
