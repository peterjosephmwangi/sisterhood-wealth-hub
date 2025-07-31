
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AppRole } from './useUserRoles';

export interface UserWithRoles {
  user_id: string;
  email: string;
  full_name: string | null;
  roles: AppRole[];
}

export const useRoleManagement = () => {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchUsersWithRoles = async () => {
    try {
      setLoading(true);
      
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name');

      if (profilesError) throw profilesError;

      // Get all user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combine profiles with their roles
      const usersWithRoles = profiles?.map(profile => {
        const roles = userRoles
          ?.filter(ur => ur.user_id === profile.id)
          ?.map(ur => ur.role as AppRole) || [];

        return {
          user_id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          roles,
        };
      }) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users with roles:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users and roles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const assignRole = async (userId: string, role: AppRole) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Role ${role} assigned successfully`,
      });

      fetchUsersWithRoles();
    } catch (error: any) {
      console.error('Error assigning role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign role",
        variant: "destructive",
      });
    }
  };

  const removeRole = async (userId: string, role: AppRole) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Role ${role} removed successfully`,
      });

      fetchUsersWithRoles();
    } catch (error: any) {
      console.error('Error removing role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove role",
        variant: "destructive",
      });
    }
  };

  return {
    users,
    loading,
    fetchUsersWithRoles,
    assignRole,
    removeRole,
  };
};
