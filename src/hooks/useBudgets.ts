
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ExpenseCategory } from './useExpenses';

export interface Budget {
  id: string;
  category_id: string;
  budget_period_start: string;
  budget_period_end: string;
  allocated_amount: number;
  spent_amount: number;
  remaining_amount: number;
  status: string;
  notes?: string;
  category?: ExpenseCategory;
}

export interface BudgetUtilization {
  category_id: string;
  category_name: string;
  allocated_amount: number;
  spent_amount: number;
  remaining_amount: number;
  utilization_percentage: number;
}

export const useBudgets = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [budgetUtilization, setBudgetUtilization] = useState<BudgetUtilization[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('budgets')
        .select(`
          *,
          category:expense_categories(*)
        `)
        .order('budget_period_start', { ascending: false });

      if (error) throw error;
      setBudgets(data || []);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      toast({
        title: "Error",
        description: "Failed to load budgets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBudgetUtilization = async (periodStart: string, periodEnd: string) => {
    try {
      const { data, error } = await supabase.rpc('get_budget_utilization', {
        budget_period_start: periodStart,
        budget_period_end: periodEnd,
      });

      if (error) throw error;
      setBudgetUtilization(data || []);
    } catch (error) {
      console.error('Error fetching budget utilization:', error);
      toast({
        title: "Error",
        description: "Failed to load budget utilization data",
        variant: "destructive",
      });
    }
  };

  const createBudget = async (budgetData: Omit<Budget, 'id' | 'spent_amount' | 'remaining_amount'>) => {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .insert([{
          ...budgetData,
          spent_amount: 0,
          remaining_amount: budgetData.allocated_amount,
        }])
        .select()
        .single();

      if (error) throw error;
      
      await fetchBudgets();
      toast({
        title: "Success",
        description: "Budget created successfully",
      });
      return { data, error: null };
    } catch (error) {
      console.error('Error creating budget:', error);
      toast({
        title: "Error",
        description: "Failed to create budget",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updateBudget = async (budgetId: string, budgetData: Partial<Budget>) => {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .update(budgetData)
        .eq('id', budgetId)
        .select()
        .single();

      if (error) throw error;
      
      await fetchBudgets();
      toast({
        title: "Success",
        description: "Budget updated successfully",
      });
      return { data, error: null };
    } catch (error) {
      console.error('Error updating budget:', error);
      toast({
        title: "Error",
        description: "Failed to update budget",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  return {
    budgets,
    budgetUtilization,
    loading,
    createBudget,
    updateBudget,
    fetchBudgetUtilization,
    refetch: fetchBudgets,
  };
};
