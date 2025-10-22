/*
  # Quiz Backend Database Functions

  ## Overview
  Comprehensive database functions for quiz operations including submission,
  retrieval, and statistics.

  ## Functions

  ### Quiz Submission and Retrieval
  - `submit_quiz_attempt` - Record a quiz attempt with full details
  - `get_quiz_with_questions` - Get complete quiz with questions
  - `get_user_quiz_progress` - Get user's progress for a specific quiz
  - `get_all_user_quizzes_progress` - Get user's progress across all quizzes

  ### Leaderboard Functions
  - `get_quiz_leaderboard` - Get top performers for a quiz
  - `get_global_leaderboard` - Get overall top performers
  - `get_user_rank` - Get user's rank for a specific quiz

  ### Analytics Functions
  - `get_quiz_question_analytics` - Get per-question statistics
  - `get_user_strengths_weaknesses` - Analyze user's topic performance
*/

-- Function to submit a quiz attempt
CREATE OR REPLACE FUNCTION submit_quiz_attempt(
  p_user_id uuid,
  p_quiz_id integer,
  p_score integer,
  p_time_taken_seconds integer,
  p_answers jsonb
)
RETURNS jsonb AS $$
DECLARE
  v_attempt_id uuid;
  v_attempt_number integer;
  v_is_best_score boolean;
  v_xp_earned integer;
  v_quiz_passing_score integer;
  v_passed boolean;
BEGIN
  -- Get attempt number
  SELECT COUNT(*) + 1 INTO v_attempt_number
  FROM quiz_attempts
  WHERE user_id = p_user_id AND quiz_id = p_quiz_id;
  
  -- Check if this is the best score
  SELECT COALESCE(MAX(score), 0) < p_score INTO v_is_best_score
  FROM quiz_attempts
  WHERE user_id = p_user_id AND quiz_id = p_quiz_id;
  
  -- Get quiz details
  SELECT xp_reward, passing_score 
  INTO v_xp_earned, v_quiz_passing_score
  FROM quizzes
  WHERE id = p_quiz_id;
  
  v_passed := p_score >= v_quiz_passing_score;
  
  -- Insert quiz attempt
  INSERT INTO quiz_attempts (
    user_id,
    quiz_id,
    score,
    time_taken_seconds,
    answers,
    completed_at
  ) VALUES (
    p_user_id,
    p_quiz_id,
    p_score,
    p_time_taken_seconds,
    p_answers,
    now()
  ) RETURNING id INTO v_attempt_id;
  
  -- Update or insert quiz completion
  INSERT INTO quiz_completions (
    user_id,
    quiz_id,
    score,
    time_taken_seconds,
    attempt_number,
    is_best_score
  ) VALUES (
    p_user_id,
    p_quiz_id,
    p_score,
    p_time_taken_seconds,
    v_attempt_number,
    v_is_best_score
  )
  ON CONFLICT (user_id, quiz_id)
  DO UPDATE SET
    score = CASE 
      WHEN EXCLUDED.score > quiz_completions.score THEN EXCLUDED.score
      ELSE quiz_completions.score
    END,
    time_taken_seconds = CASE
      WHEN EXCLUDED.score > quiz_completions.score THEN EXCLUDED.time_taken_seconds
      ELSE quiz_completions.time_taken_seconds
    END,
    attempt_number = v_attempt_number,
    is_best_score = EXCLUDED.score > quiz_completions.score,
    completed_at = now();
  
  -- Update user stats if this is a new best score
  IF v_is_best_score AND v_passed THEN
    UPDATE user_stats
    SET 
      total_xp = total_xp + v_xp_earned,
      quizzes_completed = quizzes_completed + 1,
      last_activity_date = now()
    WHERE user_id = p_user_id;
  END IF;
  
  RETURN jsonb_build_object(
    'attempt_id', v_attempt_id,
    'attempt_number', v_attempt_number,
    'is_best_score', v_is_best_score,
    'passed', v_passed,
    'xp_earned', CASE WHEN v_is_best_score AND v_passed THEN v_xp_earned ELSE 0 END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get quiz with questions
CREATE OR REPLACE FUNCTION get_quiz_with_questions(p_quiz_id integer)
RETURNS jsonb AS $$
DECLARE
  v_quiz jsonb;
  v_questions jsonb;
BEGIN
  -- Get quiz details
  SELECT jsonb_build_object(
    'id', q.id,
    'title', q.title,
    'description', q.description,
    'difficulty', q.difficulty,
    'xp_reward', q.xp_reward,
    'jiet_reward', q.jiet_reward,
    'duration_minutes', q.duration_minutes,
    'question_count', q.question_count,
    'passing_score', q.passing_score,
    'time_limit_seconds', q.time_limit_seconds,
    'is_locked', q.is_locked,
    'is_active', q.is_active,
    'category', jsonb_build_object(
      'id', qc.id,
      'name', qc.name,
      'icon', qc.icon
    )
  ) INTO v_quiz
  FROM quizzes q
  LEFT JOIN quiz_categories qc ON q.category_id = qc.id
  WHERE q.id = p_quiz_id;
  
  -- Get questions
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', qq.id,
      'question', qq.question_text,
      'options', qq.options,
      'correctAnswer', qq.correct_answer_index,
      'explanation', qq.explanation,
      'sort_order', qq.sort_order
    ) ORDER BY qq.sort_order
  ) INTO v_questions
  FROM quiz_questions qq
  WHERE qq.quiz_id = p_quiz_id;
  
  RETURN v_quiz || jsonb_build_object('questions', COALESCE(v_questions, '[]'::jsonb));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's quiz progress
CREATE OR REPLACE FUNCTION get_user_quiz_progress(
  p_user_id uuid,
  p_quiz_id integer
)
RETURNS jsonb AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'quiz_id', p_quiz_id,
    'completed', qc.id IS NOT NULL,
    'best_score', COALESCE(qc.score, 0),
    'best_time_seconds', qc.time_taken_seconds,
    'total_attempts', COALESCE(
      (SELECT COUNT(*) FROM quiz_attempts WHERE user_id = p_user_id AND quiz_id = p_quiz_id),
      0
    ),
    'jiet_rewarded', COALESCE(qc.jiet_rewarded, false),
    'last_attempt', qc.completed_at,
    'rank', ql.rank,
    'percentile', CASE 
      WHEN ql.rank IS NOT NULL THEN
        ROUND(100 - (ql.rank::numeric / NULLIF((SELECT COUNT(*) FROM quiz_leaderboard WHERE quiz_id = p_quiz_id), 0) * 100), 2)
      ELSE NULL
    END
  ) INTO v_result
  FROM quizzes q
  LEFT JOIN quiz_completions qc ON qc.quiz_id = q.id AND qc.user_id = p_user_id
  LEFT JOIN quiz_leaderboard ql ON ql.quiz_id = q.id AND ql.user_id = p_user_id
  WHERE q.id = p_quiz_id;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all user's quizzes progress
CREATE OR REPLACE FUNCTION get_all_user_quizzes_progress(p_user_id uuid)
RETURNS jsonb AS $$
BEGIN
  RETURN (
    SELECT jsonb_agg(
      jsonb_build_object(
        'quiz_id', q.id,
        'title', q.title,
        'completed', qc.id IS NOT NULL,
        'best_score', COALESCE(qc.score, 0),
        'jiet_rewarded', COALESCE(qc.jiet_rewarded, false),
        'total_attempts', COALESCE(
          (SELECT COUNT(*) FROM quiz_attempts WHERE user_id = p_user_id AND quiz_id = q.id),
          0
        )
      ) ORDER BY q.sort_order
    )
    FROM quizzes q
    LEFT JOIN quiz_completions qc ON qc.quiz_id = q.id AND qc.user_id = p_user_id
    WHERE q.is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get quiz leaderboard
CREATE OR REPLACE FUNCTION get_quiz_leaderboard(
  p_quiz_id integer,
  p_limit integer DEFAULT 10
)
RETURNS TABLE (
  rank integer,
  user_id uuid,
  username text,
  full_name text,
  avatar_url text,
  best_score integer,
  best_time_seconds integer,
  total_attempts integer
) AS $$
BEGIN
  -- Update ranks first
  PERFORM update_leaderboard_ranks();
  
  RETURN QUERY
  SELECT 
    ql.rank,
    ql.user_id,
    COALESCE(p.username, split_part(au.email, '@', 1)) as username,
    COALESCE(p.full_name, '') as full_name,
    COALESCE(p.avatar_url, '') as avatar_url,
    ql.best_score,
    ql.best_time_seconds,
    ql.total_attempts
  FROM quiz_leaderboard ql
  INNER JOIN auth.users au ON ql.user_id = au.id
  LEFT JOIN profiles p ON ql.user_id = p.user_id
  WHERE ql.quiz_id = p_quiz_id
  ORDER BY ql.rank
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get global leaderboard
CREATE OR REPLACE FUNCTION get_global_leaderboard(p_limit integer DEFAULT 10)
RETURNS TABLE (
  rank bigint,
  user_id uuid,
  username text,
  full_name text,
  avatar_url text,
  total_xp integer,
  quizzes_completed integer,
  average_score numeric
) AS $$
BEGIN
  RETURN QUERY
  WITH user_scores AS (
    SELECT 
      us.user_id,
      us.total_xp,
      us.quizzes_completed,
      COALESCE(
        ROUND(AVG(qc.score)::numeric, 2),
        0
      ) as avg_score
    FROM user_stats us
    LEFT JOIN quiz_completions qc ON us.user_id = qc.user_id
    GROUP BY us.user_id, us.total_xp, us.quizzes_completed
  )
  SELECT 
    ROW_NUMBER() OVER (ORDER BY us.total_xp DESC, us.quizzes_completed DESC) as rank,
    us.user_id,
    COALESCE(p.username, split_part(au.email, '@', 1)) as username,
    COALESCE(p.full_name, '') as full_name,
    COALESCE(p.avatar_url, '') as avatar_url,
    us.total_xp,
    us.quizzes_completed,
    us.avg_score
  FROM user_scores us
  INNER JOIN auth.users au ON us.user_id = au.id
  LEFT JOIN profiles p ON us.user_id = p.user_id
  ORDER BY us.total_xp DESC, us.quizzes_completed DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's rank for a specific quiz
CREATE OR REPLACE FUNCTION get_user_rank(
  p_user_id uuid,
  p_quiz_id integer
)
RETURNS jsonb AS $$
DECLARE
  v_result jsonb;
BEGIN
  -- Update ranks first
  PERFORM update_leaderboard_ranks();
  
  SELECT jsonb_build_object(
    'rank', ql.rank,
    'best_score', ql.best_score,
    'best_time_seconds', ql.best_time_seconds,
    'total_participants', (SELECT COUNT(*) FROM quiz_leaderboard WHERE quiz_id = p_quiz_id),
    'percentile', ROUND(100 - (ql.rank::numeric / NULLIF((SELECT COUNT(*) FROM quiz_leaderboard WHERE quiz_id = p_quiz_id), 0) * 100), 2)
  ) INTO v_result
  FROM quiz_leaderboard ql
  WHERE ql.user_id = p_user_id AND ql.quiz_id = p_quiz_id;
  
  RETURN COALESCE(v_result, jsonb_build_object('rank', null, 'message', 'No attempts yet'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get quiz question analytics
CREATE OR REPLACE FUNCTION get_quiz_question_analytics(p_quiz_id integer)
RETURNS TABLE (
  question_id uuid,
  question_text text,
  total_answers bigint,
  correct_answers bigint,
  accuracy_rate numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    qq.id as question_id,
    qq.question_text,
    COUNT(*) as total_answers,
    COUNT(*) FILTER (
      WHERE (qa.answers->>(array_position(array(SELECT jsonb_array_elements_text(jsonb_path_query_array(qa.answers, '$[*].question_id'))), qq.id::text) - 1)::jsonb->>'selected')::integer = qq.correct_answer_index
    ) as correct_answers,
    ROUND(
      COUNT(*) FILTER (
        WHERE (qa.answers->>(array_position(array(SELECT jsonb_array_elements_text(jsonb_path_query_array(qa.answers, '$[*].question_id'))), qq.id::text) - 1)::jsonb->>'selected')::integer = qq.correct_answer_index
      )::numeric / NULLIF(COUNT(*), 0) * 100,
      2
    ) as accuracy_rate
  FROM quiz_questions qq
  LEFT JOIN quiz_attempts qa ON qa.quiz_id = qq.quiz_id
  WHERE qq.quiz_id = p_quiz_id
  GROUP BY qq.id, qq.question_text, qq.sort_order
  ORDER BY qq.sort_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's strengths and weaknesses
CREATE OR REPLACE FUNCTION get_user_strengths_weaknesses(p_user_id uuid)
RETURNS TABLE (
  category_name text,
  quizzes_attempted integer,
  average_score numeric,
  total_xp_earned integer,
  performance_level text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    qc.name as category_name,
    COUNT(DISTINCT qa.quiz_id)::integer as quizzes_attempted,
    ROUND(AVG(qa.score)::numeric, 2) as average_score,
    SUM(DISTINCT CASE WHEN qa.score >= q.passing_score THEN q.xp_reward ELSE 0 END)::integer as total_xp_earned,
    CASE 
      WHEN AVG(qa.score) >= 90 THEN 'Excellent'
      WHEN AVG(qa.score) >= 75 THEN 'Good'
      WHEN AVG(qa.score) >= 60 THEN 'Fair'
      ELSE 'Needs Improvement'
    END as performance_level
  FROM quiz_attempts qa
  JOIN quizzes q ON qa.quiz_id = q.id
  LEFT JOIN quiz_categories qc ON q.category_id = qc.id
  WHERE qa.user_id = p_user_id
  GROUP BY qc.id, qc.name
  ORDER BY average_score DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
