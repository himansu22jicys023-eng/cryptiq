// src/hooks/useAdmin.tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface AdminStatus {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
}

export const useAdmin = (): AdminStatus => {
  const { user } = useAuth();
  const [adminStatus, setAdminStatus] = useState<AdminStatus>({
    isAdmin: false,
    isSuperAdmin: false,
    loading: true,
  });

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setAdminStatus({ isAdmin: false, isSuperAdmin: false, loading: false });
        return;
      }

      try {
        // Method 1: Check using database function (preferred)
        const { data: isAdminData, error: isAdminError } = await supabase
          .rpc('is_admin', { check_user_id: user.id });

        const { data: isSuperAdminData, error: isSuperAdminError } = await supabase
          .rpc('is_super_admin', { check_user_id: user.id });

        if (!isAdminError && !isSuperAdminError) {
          setAdminStatus({
            isAdmin: isAdminData || false,
            isSuperAdmin: isSuperAdminData || false,
            loading: false,
          });
          return;
        }

        // Method 2: Fallback - check email against hardcoded list
        // (Use this temporarily until you set up admin_roles in database)
        const adminEmails = ['admin@cryptiq.com', 'super@cryptiq.com'];
        const isAdminByEmail = adminEmails.includes(user.email || '');
        
        setAdminStatus({
          isAdmin: isAdminByEmail,
          isSuperAdmin: isAdminByEmail,
          loading: false,
        });
      } catch (error) {
        console.error('Error checking admin status:', error);
        setAdminStatus({ isAdmin: false, isSuperAdmin: false, loading: false });
      }
    };

    checkAdminStatus();
  }, [user]);

  return adminStatus;
};

// Helper function to log admin actions
export const logAdminAction = async (
  actionType: 'create' | 'update' | 'delete' | 'view',
  entityType: 'quiz' | 'user' | 'reward' | 'lab',
  entityId: string,
  details?: any
) => {
  try {
    const { data, error } = await supabase.rpc('log_admin_action', {
      p_action_type: actionType,
      p_entity_type: entityType,
      p_entity_id: entityId,
      p_details: details || null,
    });

    if (error) {
      console.error('Error logging admin action:', error);
      return { success: false, error };
    }

    return { success: true, actionId: data };
  } catch (error) {
    console.error('Error logging admin action:', error);
    return { success: false, error };
  }
};