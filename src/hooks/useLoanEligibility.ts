
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LoanEligibility {
  totalContributions: number;
  maxLoanAmount: number;
  isEligible: boolean;
}

export const useLoanEligibility = (memberId: string | null) => {
  const [eligibility, setEligibility] = useState<LoanEligibility>({
    totalContributions: 0,
    maxLoanAmount: 0,
    isEligible: false,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const calculateEligibility = async () => {
    if (!memberId) {
      setEligibility({
        totalContributions: 0,
        maxLoanAmount: 0,
        isEligible: false,
      });
      return;
    }

    try {
      setLoading(true);

      // Get member's total contributions
      const { data: contributions, error: contributionsError } = await supabase
        .from('contributions')
        .select('amount')
        .eq('member_id', memberId)
        .eq('status', 'confirmed');

      if (contributionsError) throw contributionsError;

      const totalContributions = contributions?.reduce((sum, contrib) => sum + contrib.amount, 0) || 0;
      
      // Set loan limit to 3 times total contributions (common chama practice)
      const maxLoanAmount = totalContributions * 3;
      const isEligible = totalContributions > 0;

      setEligibility({
        totalContributions,
        maxLoanAmount,
        isEligible,
      });
    } catch (error) {
      console.error('Error calculating loan eligibility:', error);
      toast({
        title: "Error",
        description: "Failed to calculate loan eligibility",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateEligibility();
  }, [memberId]);

  return {
    eligibility,
    loading,
    refetch: calculateEligibility,
  };
};
