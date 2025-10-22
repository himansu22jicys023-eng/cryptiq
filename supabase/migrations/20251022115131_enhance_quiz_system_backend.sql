/*
  # Enhanced Quiz System Backend

  ## Overview
  Comprehensive backend for quiz system with categories, tags, analytics, and advanced features.

  ## New Tables
  
  ### `quiz_categories`
  Quiz category management
  - `id` (integer, primary key) - Category identifier
  - `name` (text, unique) - Category name
  - `description` (text) - Category description
  - `icon` (text) - Icon name/identifier
  - `sort_order` (integer) - Display order
  - `created_at` (timestamptz) - Creation timestamp

  ### `quiz_tags`
  Tags for quiz organization
  - `id` (integer, primary key) - Tag identifier
  - `name` (text, unique) - Tag name
  - `created_at` (timestamptz) - Creation timestamp

  ### `quiz_tag_mappings`
  Many-to-many relationship between quizzes and tags
  - `quiz_id` (integer, foreign key) - References quizzes
  - `tag_id` (integer, foreign key) - References quiz_tags
  - Primary key on (quiz_id, tag_id)

  ### `quiz_attempts`
  Detailed tracking of each quiz attempt
  - `id` (uuid, primary key) - Attempt identifier
  - `user_id` (uuid, foreign key) - References auth.users
  - `quiz_id` (integer, foreign key) - References quizzes
  - `score` (integer) - Score achieved (0-100)
  - `time_taken_seconds` (integer) - Time taken to complete
  - `answers` (jsonb) - User's answers with details
  - `completed_at` (timestamptz) - Completion timestamp
  - `created_at` (timestamptz) - Attempt start timestamp

  ### `quiz_analytics`
  Aggregated analytics per quiz
  - `quiz_id` (integer, primary key, foreign key) - References quizzes
  - `total_attempts` (integer) - Total number of attempts
  - `total_completions` (integer) - Total number of completions
  - `average_score` (numeric) - Average score across all attempts
  - `average_time_seconds` (integer) - Average completion time
  - `pass_rate` (numeric) - Percentage of attempts with 70%+
  - `last_updated` (timestamptz) - Last analytics update
  - `created_at` (timestamptz) - Record creation timestamp

  ### `quiz_leaderboard`
  Leaderboard rankings
  - `id` (uuid, primary key) - Leaderboard entry identifier
  - `user_id` (uuid, foreign key) - References auth.users
  - `quiz_id` (integer, foreign key) - References quizzes
  - `best_score` (integer) - User's best score
  - `best_time_seconds` (integer) - User's best time
  - `total_attempts` (integer) - User's total attempts
  - `rank` (integer) - Current ranking
  - `created_at` (timestamptz) - Entry creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Enhancements to Existing Tables

  ### `quizzes` table additions
  - `category_id` (integer, foreign key) - References quiz_categories
  - `passing_score` (integer) - Minimum score to pass (default 70)
  - `time_limit_seconds` (integer) - Optional time limit
  - `is_active` (boolean) - Whether quiz is currently active
  - `published_at` (timestamptz) - Publication timestamp

  ### `quiz_completions` table additions
  - `time_taken_seconds` (integer) - Time taken to complete
  - `attempt_number` (integer) - Which attempt this was
  - `is_best_score` (boolean) - Whether this is user's best score

  ## Security
  All tables have RLS enabled with appropriate policies.

  ## Functions
  - `get_quiz_analytics(quiz_id)` - Get analytics for a quiz
  - `get_user_quiz_stats(user_id)` - Get user's quiz statistics
  - `update_quiz_analytics()` - Trigger function to update analytics
  - `update_leaderboard()` - Trigger function to update leaderboard
*/

-- Create quiz_categories table
CREATE TABLE IF NOT EXISTS quiz_categories (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name text UNIQUE NOT NULL,
  description text,
  icon text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create quiz_tags table
CREATE TABLE IF NOT EXISTS quiz_tags (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create quiz_tag_mappings table
CREATE TABLE IF NOT EXISTS quiz_tag_mappings (
  quiz_id integer NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  tag_id integer NOT NULL REFERENCES quiz_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (quiz_id, tag_id)
);

-- Create quiz_attempts table
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id integer NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score >= 0 AND score <= 100),
  time_taken_seconds integer,
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create quiz_analytics table
CREATE TABLE IF NOT EXISTS quiz_analytics (
  quiz_id integer PRIMARY KEY REFERENCES quizzes(id) ON DELETE CASCADE,
  total_attempts integer DEFAULT 0,
  total_completions integer DEFAULT 0,
  average_score numeric(5,2) DEFAULT 0,
  average_time_seconds integer DEFAULT 0,
  pass_rate numeric(5,2) DEFAULT 0,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create quiz_leaderboard table
CREATE TABLE IF NOT EXISTS quiz_leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id integer NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  best_score integer NOT NULL CHECK (best_score >= 0 AND best_score <= 100),
  best_time_seconds integer,
  total_attempts integer DEFAULT 1,
  rank integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, quiz_id)
);

-- Add columns to quizzes table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quizzes' AND column_name = 'category_id') THEN
    ALTER TABLE quizzes ADD COLUMN category_id integer REFERENCES quiz_categories(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quizzes' AND column_name = 'passing_score') THEN
    ALTER TABLE quizzes ADD COLUMN passing_score integer DEFAULT 70 CHECK (passing_score >= 0 AND passing_score <= 100);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quizzes' AND column_name = 'time_limit_seconds') THEN
    ALTER TABLE quizzes ADD COLUMN time_limit_seconds integer;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quizzes' AND column_name = 'is_active') THEN
    ALTER TABLE quizzes ADD COLUMN is_active boolean DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quizzes' AND column_name = 'published_at') THEN
    ALTER TABLE quizzes ADD COLUMN published_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Add columns to quiz_completions table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quiz_completions' AND column_name = 'time_taken_seconds') THEN
    ALTER TABLE quiz_completions ADD COLUMN time_taken_seconds integer;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quiz_completions' AND column_name = 'attempt_number') THEN
    ALTER TABLE quiz_completions ADD COLUMN attempt_number integer DEFAULT 1;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quiz_completions' AND column_name = 'is_best_score') THEN
    ALTER TABLE quiz_completions ADD COLUMN is_best_score boolean DEFAULT false;
  END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE quiz_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_tag_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_leaderboard ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quiz_categories (public read)
CREATE POLICY "Anyone can view quiz categories"
  ON quiz_categories
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for quiz_tags (public read)
CREATE POLICY "Anyone can view quiz tags"
  ON quiz_tags
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for quiz_tag_mappings (public read)
CREATE POLICY "Anyone can view quiz tag mappings"
  ON quiz_tag_mappings
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for quiz_attempts
CREATE POLICY "Users can view own attempts"
  ON quiz_attempts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attempts"
  ON quiz_attempts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for quiz_analytics (public read)
CREATE POLICY "Anyone can view quiz analytics"
  ON quiz_analytics
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for quiz_leaderboard (public read)
CREATE POLICY "Anyone can view leaderboard"
  ON quiz_leaderboard
  FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_score ON quiz_attempts(score DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_leaderboard_quiz_id ON quiz_leaderboard(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_leaderboard_rank ON quiz_leaderboard(rank);
CREATE INDEX IF NOT EXISTS idx_quiz_tag_mappings_quiz_id ON quiz_tag_mappings(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_tag_mappings_tag_id ON quiz_tag_mappings(tag_id);

-- Insert default categories
INSERT INTO quiz_categories (name, description, icon, sort_order)
VALUES
  ('Blockchain Fundamentals', 'Core blockchain concepts and technology', 'layers', 1),
  ('Cryptocurrencies', 'Digital currencies and tokens', 'coins', 2),
  ('Smart Contracts', 'Self-executing contracts on blockchain', 'file-code', 3),
  ('DeFi', 'Decentralized Finance protocols', 'trending-up', 4),
  ('NFTs & Web3', 'Non-fungible tokens and Web3 applications', 'image', 5),
  ('Security', 'Blockchain security and best practices', 'shield', 6)
ON CONFLICT (name) DO NOTHING;

-- Insert default tags
INSERT INTO quiz_tags (name)
VALUES
  ('beginner'),
  ('intermediate'),
  ('advanced'),
  ('bitcoin'),
  ('ethereum'),
  ('solidity'),
  ('defi'),
  ('nft'),
  ('security'),
  ('trading')
ON CONFLICT (name) DO NOTHING;

-- Update existing quizzes with categories
UPDATE quizzes SET category_id = (SELECT id FROM quiz_categories WHERE name = 'Blockchain Fundamentals') WHERE id = 1;
UPDATE quizzes SET category_id = (SELECT id FROM quiz_categories WHERE name = 'Cryptocurrencies') WHERE id = 2;
UPDATE quizzes SET category_id = (SELECT id FROM quiz_categories WHERE name = 'Smart Contracts') WHERE id = 3;
UPDATE quizzes SET category_id = (SELECT id FROM quiz_categories WHERE name = 'DeFi') WHERE id = 4;
UPDATE quizzes SET category_id = (SELECT id FROM quiz_categories WHERE name = 'NFTs & Web3') WHERE id = 5;
UPDATE quizzes SET category_id = (SELECT id FROM quiz_categories WHERE name = 'Security') WHERE id = 6;

-- Function to get quiz analytics
CREATE OR REPLACE FUNCTION get_quiz_analytics(p_quiz_id integer)
RETURNS TABLE (
  quiz_id integer,
  total_attempts bigint,
  total_completions bigint,
  average_score numeric,
  average_time_seconds numeric,
  pass_rate numeric,
  best_score integer,
  worst_score integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p_quiz_id,
    COUNT(*)::bigint as total_attempts,
    COUNT(*)::bigint as total_completions,
    ROUND(AVG(qa.score)::numeric, 2) as average_score,
    ROUND(AVG(qa.time_taken_seconds)::numeric, 0) as average_time_seconds,
    ROUND((COUNT(*) FILTER (WHERE qa.score >= 70)::numeric / COUNT(*)::numeric * 100), 2) as pass_rate,
    MAX(qa.score) as best_score,
    MIN(qa.score) as worst_score
  FROM quiz_attempts qa
  WHERE qa.quiz_id = p_quiz_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user quiz stats
CREATE OR REPLACE FUNCTION get_user_quiz_stats(p_user_id uuid)
RETURNS TABLE (
  total_quizzes_taken bigint,
  total_quizzes_passed bigint,
  average_score numeric,
  total_xp_earned integer,
  best_quiz_score integer,
  total_time_spent_hours numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT qa.quiz_id)::bigint as total_quizzes_taken,
    COUNT(DISTINCT qa.quiz_id) FILTER (WHERE qa.score >= 70)::bigint as total_quizzes_passed,
    ROUND(AVG(qa.score)::numeric, 2) as average_score,
    COALESCE(SUM(DISTINCT q.xp_reward), 0) as total_xp_earned,
    MAX(qa.score) as best_quiz_score,
    ROUND((SUM(qa.time_taken_seconds)::numeric / 3600), 2) as total_time_spent_hours
  FROM quiz_attempts qa
  LEFT JOIN quizzes q ON qa.quiz_id = q.id
  WHERE qa.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update quiz analytics (triggered)
CREATE OR REPLACE FUNCTION update_quiz_analytics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO quiz_analytics (
    quiz_id,
    total_attempts,
    total_completions,
    average_score,
    average_time_seconds,
    pass_rate,
    last_updated
  )
  SELECT 
    NEW.quiz_id,
    COUNT(*)::integer,
    COUNT(*)::integer,
    ROUND(AVG(score)::numeric, 2),
    ROUND(AVG(time_taken_seconds))::integer,
    ROUND((COUNT(*) FILTER (WHERE score >= 70)::numeric / COUNT(*)::numeric * 100), 2),
    now()
  FROM quiz_attempts
  WHERE quiz_id = NEW.quiz_id
  ON CONFLICT (quiz_id) 
  DO UPDATE SET
    total_attempts = EXCLUDED.total_attempts,
    total_completions = EXCLUDED.total_completions,
    average_score = EXCLUDED.average_score,
    average_time_seconds = EXCLUDED.average_time_seconds,
    pass_rate = EXCLUDED.pass_rate,
    last_updated = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update leaderboard (triggered)
CREATE OR REPLACE FUNCTION update_leaderboard()
RETURNS TRIGGER AS $$
DECLARE
  v_best_score integer;
  v_best_time integer;
  v_total_attempts integer;
BEGIN
  SELECT 
    MAX(score),
    MIN(time_taken_seconds) FILTER (WHERE score = MAX(score)),
    COUNT(*)
  INTO v_best_score, v_best_time, v_total_attempts
  FROM quiz_attempts
  WHERE user_id = NEW.user_id AND quiz_id = NEW.quiz_id;
  
  INSERT INTO quiz_leaderboard (
    user_id,
    quiz_id,
    best_score,
    best_time_seconds,
    total_attempts,
    updated_at
  )
  VALUES (
    NEW.user_id,
    NEW.quiz_id,
    v_best_score,
    v_best_time,
    v_total_attempts,
    now()
  )
  ON CONFLICT (user_id, quiz_id)
  DO UPDATE SET
    best_score = GREATEST(quiz_leaderboard.best_score, v_best_score),
    best_time_seconds = LEAST(
      COALESCE(quiz_leaderboard.best_time_seconds, 999999),
      COALESCE(v_best_time, 999999)
    ),
    total_attempts = v_total_attempts,
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_update_quiz_analytics ON quiz_attempts;
CREATE TRIGGER trigger_update_quiz_analytics
  AFTER INSERT ON quiz_attempts
  FOR EACH ROW
  EXECUTE FUNCTION update_quiz_analytics();

DROP TRIGGER IF EXISTS trigger_update_leaderboard ON quiz_attempts;
CREATE TRIGGER trigger_update_leaderboard
  AFTER INSERT ON quiz_attempts
  FOR EACH ROW
  EXECUTE FUNCTION update_leaderboard();

-- Function to update leaderboard ranks
CREATE OR REPLACE FUNCTION update_leaderboard_ranks()
RETURNS void AS $$
BEGIN
  WITH ranked AS (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        PARTITION BY quiz_id 
        ORDER BY best_score DESC, best_time_seconds ASC NULLS LAST
      ) as new_rank
    FROM quiz_leaderboard
  )
  UPDATE quiz_leaderboard
  SET rank = ranked.new_rank
  FROM ranked
  WHERE quiz_leaderboard.id = ranked.id;
END;
$$ LANGUAGE plpgsql;
