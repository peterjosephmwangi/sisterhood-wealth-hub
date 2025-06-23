
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LoanEligibility {
  totalContributions: number;
  maxLoanAmount: number;
  isEligible: boolean;
  hasExistingLoan: boolean;
  availableLoanFund: number;
  eligibilityReasons: string[];
}

export const useLoanEligibility = (memberId: string | null) => {
  const [eligibility, setEligibility] = useState<LoanEligibility>({
    totalContributions: 0,
    maxLoanAmount: 0,
    isEligible: false,
    hasExistingLoan: false,
    availableLoanFund: 0,
    eligibilityReasons: [],
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const calculateEligibility = async () => {
    if (!memberId) {
      setEligibility({
        totalContributions: 0,
        maxLoanAmount: 0,
        isEligible: false,
        hasExistingLoan: false,
        availableLoanFund: 0,
        eligibilityReasons: ['No member selected'],
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

      // Check for existing active loans
      const { data: existingLoans, error: loansError } = await supabase
        .from('loans')
        .select('id, amount, status')
        .eq('member_id', memberId)
        .in('status', ['approved', 'active']);

      if (loansError) throw loansError;

      // Get available loan fund
      const { data: availableFund, error: fundError } = await supabase
        .rpc('get_available_loan_fund');

      if (fundError) throw fundError;

      const totalContributions = contributions?.reduce((sum, contrib) => sum + contrib.amount, 0) || 0;
      const hasExistingLoan = (existingLoans?.length || 0) > 0;
      const availableLoanFund = availableFund || 0;
      
      // Set loan limit to 3 times total contributions (common chama practice)
      const maxLoanAmount = totalContributions * 3;
      
      // Determine eligibility reasons
      const eligibilityReasons: string[] = [];
      if (totalContributions === 0) {
        eligibilityReasons.push('No confirmed contributions');
      }
      if (hasExistingLoan) {
        eligibilityReasons.push('Has existing active loan');
      }
      if (availableLoanFund <= 0) {
        eligibilityReasons.push('No funds available for lending');
      }

      const isEligible = totalContributions > 0 && !hasExistingLoan && availableLoanFund > 0;

      setEligibility({
        totalContributions,
        maxLoanAmount,
        isEligible,
        hasExistingLoan,
        availableLoanFund,
        eligibilityReasons: isEligible ? [] : eligibilityReasons,
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
