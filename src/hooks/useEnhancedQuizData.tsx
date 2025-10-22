import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Quiz {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  xp_reward: number;
  jiet_reward: number;
  duration_minutes: number;
  question_count: number;
  passing_score: number;
  time_limit_seconds: number | null;
  is_locked: boolean;
  is_active: boolean;
  category: {
    id: number;
    name: string;
    icon: string;
  } | null;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  sort_order: number;
}

interface QuizProgress {
  quiz_id: number;
  completed: boolean;
  best_score: number;
  best_time_seconds: number | null;
  total_attempts: number;
  jiet_rewarded: boolean;
  last_attempt: string | null;
  rank: number | null;
  percentile: number | null;
}

interface QuizAttemptResult {
  attempt_id: string;
  attempt_number: number;
  is_best_score: boolean;
  passed: boolean;
  xp_earned: number;
}

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  best_score: number;
  best_time_seconds: number;
  total_attempts: number;
}

interface UserStats {
  total_quizzes_taken: number;
  total_quizzes_passed: number;
  average_score: number;
  total_xp_earned: number;
  best_quiz_score: number;
  total_time_spent_hours: number;
}

interface QuizAnalytics {
  quiz_id: number;
  total_attempts: number;
  total_completions: number;
  average_score: number;
  average_time_seconds: number;
  pass_rate: number;
  best_score: number;
  worst_score: number;
}

export const useEnhancedQuizData = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [userProgress, setUserProgress] = useState<Map<number, QuizProgress>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: quizzesData, error: quizzesError } = await supabase
        .from('quizzes')
        .select(`
          *,
          category:quiz_categories(id, name, icon)
        `)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (quizzesError) throw quizzesError;

      setQuizzes(quizzesData || []);

      if (user) {
        const { data: progressData, error: progressError } = await supabase
          .rpc('get_all_user_quizzes_progress', { p_user_id: user.id });

        if (progressError) {
          console.error('Error loading progress:', progressError);
        } else if (progressData) {
          const progressMap = new Map<number, QuizProgress>();
          progressData.forEach((progress: QuizProgress) => {
            progressMap.set(progress.quiz_id, progress);
          });
          setUserProgress(progressMap);
        }
      }
    } catch (err) {
      console.error('Error loading quizzes:', err);
      setError(err instanceof Error ? err.message : 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadQuizzes();
  }, [loadQuizzes]);

  const getQuizWithQuestions = async (quizId: number): Promise<Quiz & { questions: QuizQuestion[] }> => {
    try {
      const { data, error } = await supabase
        .rpc('get_quiz_with_questions', { p_quiz_id: quizId });

      if (error) throw error;

      return data;
    } catch (err) {
      console.error('Error loading quiz questions:', err);
      throw err;
    }
  };

  const submitQuizAttempt = async (
    quizId: number,
    score: number,
    timeTakenSeconds: number,
    answers: any[]
  ): Promise<QuizAttemptResult> => {
    if (!user) {
      throw new Error('User must be authenticated to submit quiz');
    }

    try {
      const { data, error } = await supabase
        .rpc('submit_quiz_attempt', {
          p_user_id: user.id,
          p_quiz_id: quizId,
          p_score: score,
          p_time_taken_seconds: timeTakenSeconds,
          p_answers: answers
        });

      if (error) throw error;

      await loadQuizzes();

      return data;
    } catch (err) {
      console.error('Error submitting quiz attempt:', err);
      throw err;
    }
  };

  const getQuizProgress = (quizId: number): QuizProgress | undefined => {
    return userProgress.get(quizId);
  };

  const isQuizCompleted = (quizId: number): boolean => {
    const progress = userProgress.get(quizId);
    return progress?.completed || false;
  };

  const isRewardClaimed = (quizId: number): boolean => {
    const progress = userProgress.get(quizId);
    return progress?.jiet_rewarded || false;
  };

  const getQuizScore = (quizId: number): number | undefined => {
    const progress = userProgress.get(quizId);
    return progress?.best_score;
  };

  const getTotalAttempts = (quizId: number): number => {
    const progress = userProgress.get(quizId);
    return progress?.total_attempts || 0;
  };

  const getUserQuizStats = async (): Promise<UserStats> => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    try {
      const { data, error } = await supabase
        .rpc('get_user_quiz_stats', { p_user_id: user.id })
        .single();

      if (error) throw error;

      return data;
    } catch (err) {
      console.error('Error loading user stats:', err);
      throw err;
    }
  };

  const getQuizLeaderboard = async (quizId: number, limit: number = 10): Promise<LeaderboardEntry[]> => {
    try {
      const { data, error } = await supabase
        .rpc('get_quiz_leaderboard', {
          p_quiz_id: quizId,
          p_limit: limit
        });

      if (error) throw error;

      return data || [];
    } catch (err) {
      console.error('Error loading leaderboard:', err);
      throw err;
    }
  };

  const getGlobalLeaderboard = async (limit: number = 10): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .rpc('get_global_leaderboard', { p_limit: limit });

      if (error) throw error;

      return data || [];
    } catch (err) {
      console.error('Error loading global leaderboard:', err);
      throw err;
    }
  };

  const getUserRank = async (quizId: number): Promise<any> => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    try {
      const { data, error } = await supabase
        .rpc('get_user_rank', {
          p_user_id: user.id,
          p_quiz_id: quizId
        });

      if (error) throw error;

      return data;
    } catch (err) {
      console.error('Error loading user rank:', err);
      throw err;
    }
  };

  const getQuizAnalytics = async (quizId: number): Promise<QuizAnalytics> => {
    try {
      const { data, error } = await supabase
        .rpc('get_quiz_analytics', { p_quiz_id: quizId })
        .single();

      if (error) throw error;

      return data;
    } catch (err) {
      console.error('Error loading quiz analytics:', err);
      throw err;
    }
  };

  const markRewardClaimed = async (quizId: number): Promise<void> => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    try {
      const { error } = await supabase
        .from('quiz_completions')
        .update({ jiet_rewarded: true })
        .eq('user_id', user.id)
        .eq('quiz_id', quizId);

      if (error) throw error;

      await loadQuizzes();
    } catch (err) {
      console.error('Error marking reward as claimed:', err);
      throw err;
    }
  };

  const getTotalXP = (): number => {
    let totalXP = 0;
    userProgress.forEach((progress, quizId) => {
      if (progress.completed) {
        const quiz = quizzes.find(q => q.id === quizId);
        if (quiz) {
          const earnedXP = Math.round((progress.best_score / 100) * quiz.xp_reward);
          totalXP += earnedXP;
        }
      }
    });
    return totalXP;
  };

  const getAverageScore = (): number => {
    const completedQuizzes = Array.from(userProgress.values()).filter(p => p.completed);
    if (completedQuizzes.length === 0) return 0;
    const totalScore = completedQuizzes.reduce((sum, p) => sum + p.best_score, 0);
    return Math.round(totalScore / completedQuizzes.length);
  };

  const getCompletedCount = (): number => {
    return Array.from(userProgress.values()).filter(p => p.completed).length;
  };

  return {
    quizzes,
    userProgress,
    loading,
    error,
    getQuizWithQuestions,
    submitQuizAttempt,
    getQuizProgress,
    isQuizCompleted,
    isRewardClaimed,
    getQuizScore,
    getTotalAttempts,
    getUserQuizStats,
    getQuizLeaderboard,
    getGlobalLeaderboard,
    getUserRank,
    getQuizAnalytics,
    markRewardClaimed,
    getTotalXP,
    getAverageScore,
    getCompletedCount,
    refresh: loadQuizzes,
  };
};
