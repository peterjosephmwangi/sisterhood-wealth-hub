
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface OverdueLoan {
  loan_id: string;
  member_id: string;
  member_name: string;
  member_phone: string;
  loan_amount: number;
  total_amount_due: number;
  amount_repaid: number;
  balance_due: number;
  due_date: string;
  days_overdue: number;
  interest_rate: number;
}

export interface MissingContribution {
  member_id: string;
  member_name: string;
  member_phone: string;
  member_email: string;
  last_contribution_date: string | null;
  last_contribution_amount: number | null;
  days_since_last_contribution: number | null;
  total_contributions: number;
}

export interface OverduePaymentsSummary {
  overdue_loans_count: number;
  overdue_loans_total_amount: number;
  members_missing_contributions_count: number;
  total_expected_monthly_target: number;
  current_month_collected: number;
  collection_percentage: number;
}

export const useOverduePayments = () => {
  const [overdueLoans, setOverdueLoans] = useState<OverdueLoan[]>([]);
  const [missingContributions, setMissingContributions] = useState<MissingContribution[]>([]);
  const [summary, setSummary] = useState<OverduePaymentsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOverdueData = async () => {
    try {
      setLoading(true);

      // Update overdue loan statuses first
      await supabase.rpc('update_overdue_loan_status');

      // Fetch all overdue data in parallel
      const [
        overdueLoansResult,
        missingContributionsResult,
        summaryResult,
      ] = await Promise.all([
        supabase.rpc('get_overdue_loans'),
        supabase.rpc('get_members_missing_monthly_contributions'),
        supabase.rpc('get_overdue_payments_summary'),
      ]);

      if (overdueLoansResult.error) throw overdueLoansResult.error;
      if (missingContributionsResult.error) throw missingContributionsResult.error;
      if (summaryResult.error) throw summaryResult.error;

      setOverdueLoans(overdueLoansResult.data || []);
      setMissingContributions(missingContributionsResult.data || []);
      setSummary(summaryResult.data?.[0] || null);
    } catch (error) {
      console.error('Error fetching overdue payments data:', error);
      toast({
        title: "Error",
        description: "Failed to load overdue payments data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverdueData();
  }, []);

  return {
    overdueLoans,
    missingContributions,
    summary,
    loading,
    refetch: fetchOverdueData,
  };
};
