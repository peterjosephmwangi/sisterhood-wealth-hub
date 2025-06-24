
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LoanRepayment {
  id: string;
  loan_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  notes: string | null;
  created_at: string;
}

export const useLoanRepayments = (loanId: string | null) => {
  const [repayments, setRepayments] = useState<LoanRepayment[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchRepayments = async () => {
    if (!loanId) {
      setRepayments([]);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('loan_repayments')
        .select('*')
        .eq('loan_id', loanId)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      setRepayments(data || []);
    } catch (error) {
      console.error('Error fetching loan repayments:', error);
      toast({
        title: "Error",
        description: "Failed to load loan repayments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addRepayment = async (repaymentData: {
    loan_id: string;
    amount: number;
    payment_date: string;
    payment_method: "m_pesa" | "bank_transfer" | "cash";
    notes?: string;
  }) => {
    try {
      const { error } = await supabase
        .from('loan_repayments')
        .insert(repaymentData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Loan repayment recorded successfully",
      });

      await fetchRepayments();
      return true;
    } catch (error) {
      console.error('Error adding loan repayment:', error);
      toast({
        title: "Error",
        description: "Failed to record loan repayment",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchRepayments();
  }, [loanId]);

  return {
    repayments,
    loading,
    addRepayment,
    refetch: fetchRepayments,
  };
};
