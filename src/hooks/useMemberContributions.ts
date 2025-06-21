
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MemberContribution {
  member_id: string;
  total_contributions: number;
}

export const useMemberContributions = () => {
  const [memberContributions, setMemberContributions] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMemberContributions = async () => {
    try {
      setLoading(true);
      
      // Fetch all confirmed contributions grouped by member
      const { data, error } = await supabase
        .from('contributions')
        .select('member_id, amount')
        .eq('status', 'confirmed');

      if (error) throw error;

      // Calculate total contributions per member
      const contributionsMap: Record<string, number> = {};
      data?.forEach(contribution => {
        if (contributionsMap[contribution.member_id]) {
          contributionsMap[contribution.member_id] += contribution.amount;
        } else {
          contributionsMap[contribution.member_id] = contribution.amount;
        }
      });

      setMemberContributions(contributionsMap);
    } catch (error) {
      console.error('Error fetching member contributions:', error);
      toast({
        title: "Error",
        description: "Failed to load member contributions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberContributions();
  }, []);

  return {
    memberContributions,
    loading,
    refetch: fetchMemberContributions,
  };
};
