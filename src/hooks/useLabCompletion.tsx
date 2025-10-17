import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const useLabCompletion = () => {
  const { user } = useAuth();

  const completeLab = async (labId: number) => {
    if (!user) {
      toast.error('You must be logged in to complete labs');
      return { success: false };
    }

    try {
      // Check if lab already completed
      const { data: existing } = await supabase
        .from('lab_completions')
        .select('id')
        .eq('user_id', user.id)
        .eq('lab_id', labId)
        .single();

      if (existing) {
        toast.info('Lab already completed!');
        return { success: true, alreadyCompleted: true };
      }

      // Insert lab completion
      const { error } = await supabase
        .from('lab_completions')
        .insert({
          user_id: user.id,
          lab_id: labId,
        });

      if (error) throw error;

      toast.success('Lab completed! +150 XP earned');
      return { success: true, alreadyCompleted: false };
    } catch (error) {
      console.error('Error completing lab:', error);
      toast.error('Failed to record lab completion');
      return { success: false };
    }
  };

  const getCompletedLabs = async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('lab_completions')
        .select('lab_id')
        .eq('user_id', user.id);

      if (error) throw error;

      return data?.map(item => item.lab_id) || [];
    } catch (error) {
      console.error('Error fetching completed labs:', error);
      return [];
    }
  };

  return { completeLab, getCompletedLabs };
};