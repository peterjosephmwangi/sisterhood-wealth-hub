
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type AppRole = 'admin' | 'treasurer' | 'secretary' | 'member' | 'chairperson';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
  updated_at: string;
}

export const useUserRoles = () => {
  const [userRoles, setUserRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchUserRoles = async () => {
    if (!user) {
      setUserRoles([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_current_user_roles');

      if (error) throw error;

      setUserRoles(data || []);
    } catch (error) {
      console.error('Error fetching user roles:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user roles",
        variant: "destructive",
      });
      setUserRoles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRoles();
  }, [user]);

  const hasRole = (role: AppRole): boolean => {
    return userRoles.includes(role);
  };

  const hasAnyRole = (roles: AppRole[]): boolean => {
    return roles.some(role => userRoles.includes(role));
  };

  const isAdmin = (): boolean => hasRole('admin');
  const isTreasurer = (): boolean => hasRole('treasurer');
  const isSecretary = (): boolean => hasRole('secretary');
  const isChairperson = (): boolean => hasRole('chairperson');
  const isMember = (): boolean => hasRole('member');

  const canManageUsers = (): boolean => hasAnyRole(['admin']);
  const canManageFinances = (): boolean => hasAnyRole(['admin', 'treasurer']);
  const canManageMeetings = (): boolean => hasAnyRole(['admin', 'secretary', 'chairperson']);
  const canViewReports = (): boolean => hasAnyRole(['admin', 'treasurer', 'chairperson']);

  return {
    userRoles,
    loading,
    hasRole,
    hasAnyRole,
    isAdmin,
    isTreasurer,
    isSecretary,
    isChairperson,
    isMember,
    canManageUsers,
    canManageFinances,
    canManageMeetings,
    canViewReports,
    refetch: fetchUserRoles,
  };
};
