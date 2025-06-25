
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface InterestProfit {
  loan_id: string;
  principal_amount: number;
  interest_rate: number;
  total_interest_expected: number;
  interest_profit_earned: number;
  loan_date: string;
  due_date: string;
  status: string;
}

interface MemberInterestProfit extends InterestProfit {
  member_name: string;
}

export const useInterestProfits = () => {
  const [totalInterestProfit, setTotalInterestProfit] = useState<number>(0);
  const [memberProfits, setMemberProfits] = useState<MemberInterestProfit[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchTotalInterestProfit = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_total_interest_profit');

      if (error) throw error;
      setTotalInterestProfit(data || 0);
    } catch (error) {
      console.error('Error fetching total interest profit:', error);
      toast({
        title: "Error",
        description: "Failed to load interest profit data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberInterestProfits = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('loan_interest_profits')
        .select('*')
        .order('loan_date', { ascending: false });

      if (error) throw error;
      setMemberProfits(data || []);
    } catch (error) {
      console.error('Error fetching member interest profits:', error);
      toast({
        title: "Error",
        description: "Failed to load member interest profits",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberInterestProfit = async (memberId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .rpc('get_member_interest_profit', { member_uuid: memberId });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching member interest profit:', error);
      toast({
        title: "Error",
        description: "Failed to load member interest profit",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTotalInterestProfit();
    fetchMemberInterestProfits();
  }, []);

  return {
    totalInterestProfit,
    memberProfits,
    loading,
    refetch: () => {
      fetchTotalInterestProfit();
      fetchMemberInterestProfits();
    },
    fetchMemberInterestProfit,
  };
};
