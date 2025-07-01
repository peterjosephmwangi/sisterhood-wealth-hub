
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DividendDeclaration {
  id: string;
  declaration_date: string;
  dividend_period_start: string;
  dividend_period_end: string;
  total_dividend_amount: number;
  dividend_per_share: number;
  calculation_method: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MemberDividend {
  id: string;
  dividend_declaration_id: string;
  member_id: string;
  member_contribution_amount: number;
  contribution_percentage: number;
  dividend_amount: number;
  payment_status: string;
  payment_date?: string;
  payment_method?: string;
  payment_reference?: string;
}

export interface DividendCalculation {
  member_id: string;
  member_name: string;
  member_contribution: number;
  contribution_percentage: number;
  dividend_amount: number;
}

export const useDividends = () => {
  const [dividendDeclarations, setDividendDeclarations] = useState<DividendDeclaration[]>([]);
  const [memberDividends, setMemberDividends] = useState<MemberDividend[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchDividendDeclarations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('dividend_declarations')
        .select('*')
        .order('declaration_date', { ascending: false });

      if (error) throw error;
      setDividendDeclarations(data || []);
    } catch (error) {
      console.error('Error fetching dividend declarations:', error);
      toast({
        title: "Error",
        description: "Failed to load dividend declarations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateDividends = async (
    periodStart: string,
    periodEnd: string,
    totalDividend: number
  ): Promise<DividendCalculation[]> => {
    try {
      const { data, error } = await supabase.rpc('calculate_member_dividends', {
        declaration_id: null,
        period_start: periodStart,
        period_end: periodEnd,
        total_dividend: totalDividend,
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error calculating dividends:', error);
      toast({
        title: "Error",
        description: "Failed to calculate dividends",
        variant: "destructive",
      });
      return [];
    }
  };

  const createDividendDeclaration = async (declaration: Omit<DividendDeclaration, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      
      // First create the dividend declaration
      const { data: declarationData, error: declarationError } = await supabase
        .from('dividend_declarations')
        .insert([declaration])
        .select()
        .single();

      if (declarationError) throw declarationError;

      // Calculate member dividends
      const calculations = await calculateDividends(
        declaration.dividend_period_start,
        declaration.dividend_period_end,
        declaration.total_dividend_amount
      );

      // Create member dividend records
      const memberDividendData = calculations.map(calc => ({
        dividend_declaration_id: declarationData.id,
        member_id: calc.member_id,
        member_contribution_amount: calc.member_contribution,
        contribution_percentage: calc.contribution_percentage,
        dividend_amount: calc.dividend_amount,
        payment_status: 'pending',
      }));

      const { error: memberDividendError } = await supabase
        .from('member_dividends')
        .insert(memberDividendData);

      if (memberDividendError) throw memberDividendError;

      toast({
        title: "Success",
        description: "Dividend declaration created successfully",
      });

      await fetchDividendDeclarations();
      return declarationData;
    } catch (error) {
      console.error('Error creating dividend declaration:', error);
      toast({
        title: "Error",
        description: "Failed to create dividend declaration",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateDividendStatus = async (declarationId: string, status: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('dividend_declarations')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', declarationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Dividend status updated successfully",
      });

      await fetchDividendDeclarations();
    } catch (error) {
      console.error('Error updating dividend status:', error);
      toast({
        title: "Error",
        description: "Failed to update dividend status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateMemberDividendPayment = async (
    memberDividendId: string,
    paymentStatus: string,
    paymentMethod?: string,
    paymentReference?: string
  ) => {
    try {
      const updateData: any = {
        payment_status: paymentStatus,
        updated_at: new Date().toISOString(),
      };

      if (paymentStatus === 'paid') {
        updateData.payment_date = new Date().toISOString().split('T')[0];
        if (paymentMethod) updateData.payment_method = paymentMethod;
        if (paymentReference) updateData.payment_reference = paymentReference;
      }

      const { error } = await supabase
        .from('member_dividends')
        .update(updateData)
        .eq('id', memberDividendId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment status updated successfully",
      });

      await fetchMemberDividendsByDeclaration(memberDividends[0]?.dividend_declaration_id);
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive",
      });
    }
  };

  const fetchMemberDividendsByDeclaration = async (declarationId: string) => {
    try {
      const { data, error } = await supabase
        .from('member_dividends')
        .select(`
          *,
          members (name)
        `)
        .eq('dividend_declaration_id', declarationId);

      if (error) throw error;
      setMemberDividends(data || []);
    } catch (error) {
      console.error('Error fetching member dividends:', error);
      toast({
        title: "Error",
        description: "Failed to load member dividends",
        variant: "destructive",
      });
    }
  };

  const getMemberDividendHistory = async (memberId: string) => {
    try {
      const { data, error } = await supabase.rpc('get_member_dividend_history', {
        member_uuid: memberId,
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching member dividend history:', error);
      toast({
        title: "Error",
        description: "Failed to load dividend history",
        variant: "destructive",
      });
      return [];
    }
  };

  useEffect(() => {
    fetchDividendDeclarations();
  }, []);

  return {
    dividendDeclarations,
    memberDividends,
    loading,
    fetchDividendDeclarations,
    calculateDividends,
    createDividendDeclaration,
    updateDividendStatus,
    updateMemberDividendPayment,
    fetchMemberDividendsByDeclaration,
    getMemberDividendHistory,
  };
};
