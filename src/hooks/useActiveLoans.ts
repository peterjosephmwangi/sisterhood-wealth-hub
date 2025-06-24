
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ActiveLoan {
  id: string;
  amount: number;
  interest_rate: number;
  due_date: string;
  loan_date: string;
  total_amount: number;
  total_repaid: number;
  balance: number;
  status: string;
}

export const useActiveLoans = (memberId: string | null) => {
  const [activeLoans, setActiveLoans] = useState<ActiveLoan[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchActiveLoans = async () => {
    if (!memberId) {
      setActiveLoans([]);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .rpc('get_member_active_loans', { member_uuid: memberId });

      if (error) throw error;
      setActiveLoans(data || []);
    } catch (error) {
      console.error('Error fetching active loans:', error);
      toast({
        title: "Error",
        description: "Failed to load active loans",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveLoans();
  }, [memberId]);

  return {
    activeLoans,
    loading,
    refetch: fetchActiveLoans,
  };
};
