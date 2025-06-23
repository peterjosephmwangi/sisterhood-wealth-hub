
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RecentActivity {
  member_name: string;
  action: string;
  amount: number;
  created_at: string;
  activity_type: string;
}

interface DashboardStats {
  totalContributions: number;
  activeMembers: number;
  availableLoanFund: number;
  recentActivities: RecentActivity[];
}

export const useDashboardData = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalContributions: 0,
    activeMembers: 0,
    availableLoanFund: 0,
    recentActivities: [],
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all dashboard data in parallel
      const [
        totalContributionsResult,
        activeMembersResult,
        availableLoanFundResult,
        recentActivitiesResult,
      ] = await Promise.all([
        supabase.rpc('get_total_contributions'),
        supabase.rpc('get_active_members_count'),
        supabase.rpc('get_available_loan_fund'),
        supabase.rpc('get_recent_activities'),
      ]);

      if (totalContributionsResult.error) throw totalContributionsResult.error;
      if (activeMembersResult.error) throw activeMembersResult.error;
      if (availableLoanFundResult.error) throw availableLoanFundResult.error;
      if (recentActivitiesResult.error) throw recentActivitiesResult.error;

      setStats({
        totalContributions: totalContributionsResult.data || 0,
        activeMembers: activeMembersResult.data || 0,
        availableLoanFund: availableLoanFundResult.data || 0,
        recentActivities: recentActivitiesResult.data || [],
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    stats,
    loading,
    refetch: fetchDashboardData,
  };
};
