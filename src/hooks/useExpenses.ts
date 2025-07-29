
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  is_active: boolean;
}

export interface Expense {
  id: string;
  category_id: string;
  amount: number;
  description: string;
  expense_date: string;
  payment_method: 'cash' | 'mpesa' | 'bank_transfer' | 'cheque';
  receipt_reference?: string;
  approved_by?: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  created_at: string;
  category?: ExpenseCategory;
}

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('expense_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching expense categories:', error);
      toast({
        title: "Error",
        description: "Failed to load expense categories",
        variant: "destructive",
      });
    }
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          category:expense_categories(*)
        `)
        .order('expense_date', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast({
        title: "Error",
        description: "Failed to load expenses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (expenseData: Omit<Expense, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert([expenseData])
        .select()
        .single();

      if (error) throw error;
      
      await fetchExpenses();
      toast({
        title: "Success",
        description: "Expense recorded successfully",
      });
      return { data, error: null };
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        title: "Error",
        description: "Failed to record expense",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updateExpenseStatus = async (expenseId: string, status: string, approvedBy?: string) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .update({
          status,
          approved_by: approvedBy || null,
        })
        .eq('id', expenseId);

      if (error) throw error;
      
      await fetchExpenses();
      toast({
        title: "Success",
        description: `Expense ${status} successfully`,
      });
    } catch (error) {
      console.error('Error updating expense status:', error);
      toast({
        title: "Error",
        description: "Failed to update expense status",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchExpenses();
  }, []);

  return {
    expenses,
    categories,
    loading,
    addExpense,
    updateExpenseStatus,
    refetch: fetchExpenses,
  };
};
