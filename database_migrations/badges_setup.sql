-- ============================================
-- NEXTCHAPTER BADGES SYSTEM - SUPABASE SETUP
-- ============================================
-- Run this in Supabase SQL Editor to set up the badges system

-- 1. Create badges table
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create user_badges table (tracks which users have which badges)
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- 3. Insert the 5 badges
INSERT INTO badges (name, description, icon, requirement_type, requirement_value) VALUES
  ('First Chapter', 'Read your first book', 'BookOpen', 'books_read', 1),
  ('Page Turner', 'Read 500 pages', 'Bookmark', 'pages_read', 500),
  ('Bookworm', 'Read 10 books', 'Star', 'books_read', 10),
  ('Genre Explorer', 'Read books from 5 different genres', 'Globe', 'genres_explored', 5),
  ('Marathon Reader', 'Maintain a 7-day reading streak', 'Flame', 'reading_streak', 7)
ON CONFLICT (name) DO NOTHING;

-- 4. Enable Row Level Security
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies
DROP POLICY IF EXISTS "Badges are viewable by everyone" ON badges;
DROP POLICY IF EXISTS "User badges are viewable by everyone" ON user_badges;
DROP POLICY IF EXISTS "Users can earn their own badges" ON user_badges;

CREATE POLICY "Badges are viewable by everyone"
  ON badges FOR SELECT
  USING (true);

CREATE POLICY "User badges are viewable by everyone"
  ON user_badges FOR SELECT
  USING (true);

CREATE POLICY "Users can earn their own badges"
  ON user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_badges_requirement_type ON badges(requirement_type);

-- 7. Create function to check and award badges automatically
CREATE OR REPLACE FUNCTION check_and_award_badges(p_user_id UUID)
RETURNS TABLE(newly_earned_badges JSON) AS $$
DECLARE
  v_books_read INTEGER;
  v_pages_read INTEGER;
  v_reading_streak INTEGER;
  v_genres_explored INTEGER;
  v_badge RECORD;
  v_newly_earned JSON[] := '{}';
BEGIN
  -- Calculate user stats
  SELECT COUNT(DISTINCT book_id) INTO v_books_read
  FROM reading_progress
  WHERE user_id = p_user_id AND progress >= 100;

  SELECT COALESCE(SUM(pages_read), 0) INTO v_pages_read
  FROM reading_sessions
  WHERE user_id = p_user_id;

  SELECT COALESCE(MAX(streak_days), 0) INTO v_reading_streak
  FROM (
    SELECT COUNT(*) as streak_days
    FROM (
      SELECT DATE(session_date) as read_date,
             DATE(session_date) - ROW_NUMBER() OVER (ORDER BY DATE(session_date))::INTEGER as grp
      FROM reading_sessions
      WHERE user_id = p_user_id
      GROUP BY DATE(session_date)
    ) grouped
    GROUP BY grp
  ) streaks;

  SELECT COUNT(DISTINCT genre) INTO v_genres_explored
  FROM reading_progress rp
  JOIN books b ON rp.book_id = b.id
  WHERE rp.user_id = p_user_id AND b.genre IS NOT NULL;

  -- Check each badge
  FOR v_badge IN SELECT * FROM badges LOOP
    -- Skip if user already has this badge
    IF EXISTS (
      SELECT 1 FROM user_badges 
      WHERE user_id = p_user_id AND badge_id = v_badge.id
    ) THEN
      CONTINUE;
    END IF;

    -- Check if user qualifies for this badge
    IF (v_badge.requirement_type = 'books_read' AND v_books_read >= v_badge.requirement_value) OR
       (v_badge.requirement_type = 'pages_read' AND v_pages_read >= v_badge.requirement_value) OR
       (v_badge.requirement_type = 'reading_streak' AND v_reading_streak >= v_badge.requirement_value) OR
       (v_badge.requirement_type = 'genres_explored' AND v_genres_explored >= v_badge.requirement_value) THEN
      
      -- Award the badge
      INSERT INTO user_badges (user_id, badge_id)
      VALUES (p_user_id, v_badge.id)
      ON CONFLICT DO NOTHING;

      -- Add to newly earned list
      v_newly_earned := array_append(
        v_newly_earned,
        json_build_object(
          'id', v_badge.id,
          'name', v_badge.name,
          'description', v_badge.description,
          'icon', v_badge.icon
        )
      );
    END IF;
  END LOOP;

  RETURN QUERY SELECT array_to_json(v_newly_earned);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON badges TO anon, authenticated;
GRANT SELECT, INSERT ON user_badges TO authenticated;
GRANT EXECUTE ON FUNCTION check_and_award_badges TO authenticated;

-- ============================================
-- SETUP COMPLETE
-- ============================================
-- You should see: "Success. No rows returned"
-- Now refresh your profile page to see the badges!
