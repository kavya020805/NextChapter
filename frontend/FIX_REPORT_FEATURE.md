# Fix Report Feature - Database Schema Update Required

## Issue
The report feature is failing because the `reason` column is missing from the report tables in your Supabase database.

## Solution
Run the following SQL commands in your Supabase dashboard (SQL Editor):

### 1. Add reason column to book_comment_reports table
```sql
ALTER TABLE public.book_comment_reports ADD COLUMN reason TEXT;
```

### 2. Create book_reply_reports table with reason column
```sql
CREATE TABLE IF NOT EXISTS public.book_reply_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id TEXT NOT NULL,
  reply_id UUID NOT NULL,
  user_id UUID NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(reply_id, user_id)
);

-- Add foreign key constraint
ALTER TABLE public.book_reply_reports 
ADD CONSTRAINT book_reply_reports_reply_id_fkey 
FOREIGN KEY (reply_id) REFERENCES public.book_comment_replies(id) ON DELETE CASCADE;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_book_reply_reports_reply_id ON public.book_reply_reports(reply_id);
CREATE INDEX IF NOT EXISTS idx_book_reply_reports_user_id ON public.book_reply_reports(user_id);

-- Enable Row Level Security
ALTER TABLE public.book_reply_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
DROP POLICY IF EXISTS "Users can manage reply reports" ON public.book_reply_reports;
CREATE POLICY "Users can manage reply reports" ON public.book_reply_reports FOR ALL USING (auth.uid() = user_id);
```

## Steps to Fix
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run the first SQL command to add the reason column to book_comment_reports
4. Run the second SQL block to create the book_reply_reports table
5. Test the report feature again

## Verification
After running the SQL, the report feature should work correctly. Users will be able to:
- Select a reason for reporting comments and replies
- Submit custom reasons when "Other" is selected
- See confirmation that their report was submitted
