
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FinancialReport {
  id: string;
  report_type: string;
  report_period_start: string;
  report_period_end: string;
  total_income: number;
  total_expenses: number;
  net_profit: number;
  generated_at: string;
  generated_by?: string;
  report_data?: any;
  status: string;
}

export interface ProfitLossData {
  total_contributions: number;
  total_interest_income: number;
  total_income: number;
  total_expenses: number;
  net_profit: number;
  profit_margin: number;
}

export interface ExpenseByCategoryData {
  category_id: string;
  category_name: string;
  total_amount: number;
  expense_count: number;
}

export const useFinancialReports = () => {
  const [reports, setReports] = useState<FinancialReport[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchReports = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('financial_reports')
        .select('*')
        .order('generated_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching financial reports:', error);
      toast({
        title: "Error",
        description: "Failed to load financial reports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateProfitLossReport = async (startDate: string, endDate: string) => {
    try {
      const { data, error } = await supabase.rpc('generate_profit_loss_report', {
        start_date: startDate,
        end_date: endDate,
      });

      if (error) throw error;
      return data?.[0] as ProfitLossData;
    } catch (error) {
      console.error('Error generating profit loss report:', error);
      toast({
        title: "Error",
        description: "Failed to generate profit loss report",
        variant: "destructive",
      });
      return null;
    }
  };

  const getExpensesByCategory = async (startDate?: string, endDate?: string) => {
    try {
      const { data, error } = await supabase.rpc('get_expenses_by_category', {
        start_date: startDate || null,
        end_date: endDate || null,
      });

      if (error) throw error;
      return data as ExpenseByCategoryData[];
    } catch (error) {
      console.error('Error fetching expenses by category:', error);
      toast({
        title: "Error",
        description: "Failed to fetch expenses by category",
        variant: "destructive",
      });
      return [];
    }
  };

  const saveReport = async (reportData: Omit<FinancialReport, 'id' | 'generated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('financial_reports')
        .insert([reportData])
        .select()
        .single();

      if (error) throw error;
      
      await fetchReports();
      toast({
        title: "Success",
        description: "Financial report saved successfully",
      });
      return { data, error: null };
    } catch (error) {
      console.error('Error saving financial report:', error);
      toast({
        title: "Error",
        description: "Failed to save financial report",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return {
    reports,
    loading,
    generateProfitLossReport,
    getExpensesByCategory,
    saveReport,
    refetch: fetchReports,
  };
};
