import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useAdmin = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        console.log('❌ Admin check: No user logged in');
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      console.log('🔍 Checking admin status for user:', user.id);

      const { data, error } = await supabase.rpc('is_admin', {
        _user_id: user.id
      });

      if (error) {
        console.error('❌ Error checking admin status:', error);
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        setIsAdmin(false);
      } else {
        console.log('✅ Admin check result:', data);
        setIsAdmin(data === true);
      }
      setLoading(false);
    };

    if (!authLoading) {
      checkAdmin();
    }
  }, [user, authLoading]);

  return { isAdmin, loading: loading || authLoading };
};
