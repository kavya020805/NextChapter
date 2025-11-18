CREATE TABLE public.achievements (
  id bigint NOT NULL DEFAULT nextval('achievements_id_seq'::regclass),
  user_id uuid NOT NULL,
  code text NOT NULL,
  title text NOT NULL,
  description text,
  unlocked_at timestamp with time zone DEFAULT now(),
  CONSTRAINT achievements_pkey PRIMARY KEY (id),
  CONSTRAINT achievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.book_chunks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  book_id text NOT NULL,
  page integer NOT NULL,
  chunk_index integer NOT NULL,
  text text NOT NULL,
  embedding USER-DEFINED,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT book_chunks_pkey PRIMARY KEY (id),
  CONSTRAINT book_chunks_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id)
);
CREATE TABLE public.book_comment_reactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  book_id text NOT NULL,
  comment_id uuid NOT NULL,
  user_id uuid NOT NULL,
  reaction_type text NOT NULL CHECK (reaction_type = ANY (ARRAY['like'::text, 'upvote'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT book_comment_reactions_pkey PRIMARY KEY (id),
  CONSTRAINT book_comment_reactions_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.book_comments(id)
);
CREATE TABLE public.book_comment_replies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL,
  book_id text NOT NULL,
  user_id uuid,
  author_name text NOT NULL DEFAULT 'Anonymous'::text,
  text text NOT NULL,
  likes_count integer DEFAULT 0,
  upvotes_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT book_comment_replies_pkey PRIMARY KEY (id),
  CONSTRAINT book_comment_replies_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.book_comments(id)
);
CREATE TABLE public.book_comment_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  book_id text NOT NULL,
  comment_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  reason text,
  CONSTRAINT book_comment_reports_pkey PRIMARY KEY (id),
  CONSTRAINT book_comment_reports_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.book_comments(id)
);
CREATE TABLE public.book_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  book_id text NOT NULL,
  user_id uuid,
  author_name text NOT NULL DEFAULT 'Anonymous'::text,
  text text NOT NULL,
  likes_count integer DEFAULT 0,
  upvotes_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT book_comments_pkey PRIMARY KEY (id)
);
CREATE TABLE public.book_highlights (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  book_id text NOT NULL,
  content text NOT NULL,
  note text,
  color text DEFAULT 'yellow'::text,
  location jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT book_highlights_pkey PRIMARY KEY (id),
  CONSTRAINT book_highlights_user_fk FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT book_highlights_book_fk FOREIGN KEY (book_id) REFERENCES public.books(id)
);
CREATE TABLE public.book_ratings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  book_id text NOT NULL,
  user_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  rated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT book_ratings_pkey PRIMARY KEY (id),
  CONSTRAINT book_ratings_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id),
  CONSTRAINT book_ratings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.book_reply_reactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  book_id text NOT NULL,
  reply_id uuid NOT NULL,
  user_id uuid NOT NULL,
  reaction_type text NOT NULL CHECK (reaction_type = ANY (ARRAY['like'::text, 'upvote'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT book_reply_reactions_pkey PRIMARY KEY (id),
  CONSTRAINT book_reply_reactions_reply_id_fkey FOREIGN KEY (reply_id) REFERENCES public.book_comment_replies(id)
);
CREATE TABLE public.book_reply_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  book_id text NOT NULL,
  reply_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  reason text,
  CONSTRAINT book_reply_reports_pkey PRIMARY KEY (id),
  CONSTRAINT book_reply_reports_reply_id_fkey FOREIGN KEY (reply_id) REFERENCES public.book_comment_replies(id)
);
CREATE TABLE public.book_wishlist (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  book_id text NOT NULL,
  user_id uuid NOT NULL,
  added_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT book_wishlist_pkey PRIMARY KEY (id),
  CONSTRAINT book_wishlist_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id),
  CONSTRAINT book_wishlist_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.bookmarks (
  bookmark_id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  book_id text NOT NULL,
  page_number integer NOT NULL CHECK (page_number > 0),
  note text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT bookmarks_pkey PRIMARY KEY (bookmark_id),
  CONSTRAINT bookmarks_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT bookmarks_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id)
);
CREATE TABLE public.books (
  id text NOT NULL,
  title text NOT NULL,
  genres ARRAY,
  rating numeric,
  author text,
  year integer,
  language text,
  pdf_filename text,
  pdf_path text,
  pdf_size bigint,
  has_pdf boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  cover_image text,
  cover_filename text,
  description text,
  pages integer,
  subjects ARRAY DEFAULT '{}'::text[],
  pdf_file text,
  author_bio text,
  author_birth_year integer,
  author_death_year integer,
  CONSTRAINT books_pkey PRIMARY KEY (id)
);
CREATE TABLE public.login_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  device_id text NOT NULL,
  user_agent text,
  platform text,
  language text,
  timezone text,
  screen text,
  ip_address inet,
  city text,
  region text,
  country text,
  login_at timestamp with time zone DEFAULT now(),
  was_emailed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT login_events_pkey PRIMARY KEY (id),
  CONSTRAINT login_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.reading_activity (
  id bigint NOT NULL DEFAULT nextval('reading_activity_id_seq'::regclass),
  user_id uuid NOT NULL,
  day date NOT NULL,
  minutes integer DEFAULT 0,
  pages integer DEFAULT 0,
  sessions integer DEFAULT 0,
  CONSTRAINT reading_activity_pkey PRIMARY KEY (id),
  CONSTRAINT reading_activity_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.reading_challenges (
  id bigint NOT NULL DEFAULT nextval('reading_challenges_id_seq'::regclass),
  user_id uuid NOT NULL,
  year integer NOT NULL,
  target_books integer NOT NULL,
  completed_books integer DEFAULT 0,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT reading_challenges_pkey PRIMARY KEY (id),
  CONSTRAINT reading_challenges_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.reading_sessions (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id uuid NOT NULL,
  book_id text,
  date date NOT NULL DEFAULT CURRENT_DATE,
  minutes_read integer,
  pages_read integer,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT reading_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT reading_sessions_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id)
);
CREATE TABLE public.transactions (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id uuid,
  amount numeric NOT NULL,
  status text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT transactions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_activity (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id uuid,
  actor_name text,
  action text,
  target text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_activity_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_books (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id uuid NOT NULL,
  book_id text NOT NULL,
  current_page integer,
  progress_percentage integer,
  status text DEFAULT 'reading'::text,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_books_pkey PRIMARY KEY (id),
  CONSTRAINT user_books_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id)
);
CREATE TABLE public.user_profiles (
  user_id uuid NOT NULL,
  username text,
  date_of_birth date,
  gender text,
  favorite_authors ARRAY DEFAULT '{}'::text[],
  genres ARRAY DEFAULT '{}'::text[],
  languages ARRAY DEFAULT '{}'::text[],
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  profile_photo_url text,
  subscription_plan text DEFAULT 'Free'::text,
  is_admin boolean DEFAULT false,
  description text,
  CONSTRAINT user_profiles_pkey PRIMARY KEY (user_id),
  CONSTRAINT user_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_reading_history (
  user_id uuid,
  book_id text,
  status text,
  scroll_depth numeric,
  rating numeric,
  was_in_watchlist boolean,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  finished_at date,
  CONSTRAINT user_reading_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT user_reading_history_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id)
);


CREATE OR REPLACE VIEW public.user_dashboard AS
SELECT
  u.id AS user_id,

  -- ✅ Books completed this year
  (
    SELECT COUNT(*)
    FROM user_reading_history h
    WHERE h.user_id = u.id
      AND h.status = 'completed'
      AND h.finished_at >= DATE_TRUNC('year', CURRENT_DATE)
  ) AS books_this_year,

  -- ✅ Pages read this year
  (
    SELECT COALESCE(SUM(a.pages), 0)
    FROM reading_activity a
    WHERE a.user_id = u.id
      AND a.day >= DATE_TRUNC('year', CURRENT_DATE)
  ) AS pages_this_year,

  -- ✅ Books completed this month
  (
    SELECT COUNT(*)
    FROM user_reading_history h
    WHERE h.user_id = u.id
      AND h.status = 'completed'
      AND h.finished_at >= DATE_TRUNC('month', CURRENT_DATE)
  ) AS books_this_month,

  -- ✅ Pages read this month
  (
    SELECT COALESCE(SUM(a.pages), 0)
    FROM reading_activity a
    WHERE a.user_id = u.id
      AND a.day >= DATE_TRUNC('month', CURRENT_DATE)
  ) AS pages_this_month,

  -- ✅ Reading speed (pages per hour)
  (
    SELECT 
      CASE 
        WHEN SUM(minutes) = 0 THEN 0
        ELSE SUM(pages) / (SUM(minutes) / 60.0)
      END
    FROM reading_activity a
    WHERE a.user_id = u.id
  ) AS reading_speed,

  -- ✅ Average session length (minutes)
  (
    SELECT 
      CASE 
        WHEN SUM(sessions) = 0 THEN 0
        ELSE SUM(minutes) / SUM(sessions)
      END
    FROM reading_activity a
    WHERE a.user_id = u.id
  ) AS average_session_minutes,

  -- ✅ Active days (used for heatmap)
  (
    SELECT COUNT(*)
    FROM reading_activity a
    WHERE a.user_id = u.id
  ) AS days_active,

  -- ✅ Simple streak (last 7 days)
  (
    SELECT COUNT(*)
    FROM reading_activity a
    WHERE a.user_id = u.id
      AND a.day >= CURRENT_DATE - INTERVAL '7 days'
  ) AS current_streak

FROM auth.users u;

