import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth'; // We use this to get the user
import type { Database } from '@/integrations/supabase/types'; // Import your Supabase types

// Define the shape of your data
type QuizCompletion = Database['public']['Tables']['quiz_completions']['Row'];
type LabCompletion = Database['public']['Tables']['lab_completions']['Row'];
type UserStats = Database['public']['Tables']['user_stats']['Row'];

export interface UserProgress {
  stats: UserStats | null;
  quizCompletions: Pick<QuizCompletion, 'quiz_id' | 'score'>[];
  labCompletions: Pick<LabCompletion, 'lab_id'>[];
  loading: boolean;
}

export const useUserProgress = (): UserProgress => {
  const { user } = useAuth(); // Get the current authenticated user
  const [stats, setStats] = useState<UserProgress['stats']>(null);
  const [quizCompletions, setQuizCompletions] = useState<UserProgress['quizCompletions']>([]);
  const [labCompletions, setLabCompletions] = useState<UserProgress['labCompletions']>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch from user_stats table
        const { data: statsData, error: statsError } = await supabase
          .from('user_stats')
          .select('total_xp, quizzes_completed, labs_completed')
          .eq('user_id', user.id)
          .maybeSingle();

        if (statsError) throw statsError;
        // We cast to UserStats here, but only select a few fields
        setStats(statsData as UserStats | null);

        // Fetch from quiz_completions table
        const { data: quizData, error: quizError } = await supabase
          .from('quiz_completions')
          .select('quiz_id, score')
          .eq('user_id', user.id);
        
        if (quizError) throw quizError;
        setQuizCompletions(quizData || []);

        // Fetch from lab_completions table
        const { data: labData, error: labError } = await supabase
          .from('lab_completions')
          .select('lab_id')
          .eq('user_id', user.id);

        if (labError) throw labError;
        setLabCompletions(labData || []);

      } catch (error) {
        console.error('Error fetching user progress:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  return { stats, quizCompletions, labCompletions, loading };
};