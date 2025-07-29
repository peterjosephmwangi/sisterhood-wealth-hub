
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, TrendingDown, DollarSign, AlertCircle } from 'lucide-react';

const FinancialOverview = () => {
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [pendingExpenses, setPendingExpenses] = useState(0);
  const [activeBudgets, setActiveBudgets] = useState(0);
  const [loading, setLoading] = useState(true);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      
      // Get current month dates
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const [totalExpensesResult, monthlyExpensesResult, pendingExpensesResult, budgetsResult] = await Promise.all([
        supabase.rpc('get_total_expenses'),
        supabase.rpc('get_total_expenses', {
          start_date: currentMonthStart.toISOString().split('T')[0],
          end_date: currentMonthEnd.toISOString().split('T')[0],
        }),
        supabase
          .from('expenses')
          .select('amount')
          .eq('status', 'pending'),
        supabase
          .from('budgets')
          .select('id')
          .eq('status', 'active')
      ]);

      setTotalExpenses(totalExpensesResult.data || 0);
      setMonthlyExpenses(monthlyExpensesResult.data || 0);
      
      const pendingTotal = pendingExpensesResult.data?.reduce((sum, expense) => sum + (expense.amount || 0), 0) || 0;
      setPendingExpenses(pendingTotal);
      
      setActiveBudgets(budgetsResult.data?.length || 0);
    } catch (error) {
      console.error('Error fetching financial overview:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const stats = [
    {
      title: 'Total Expenses',
      value: formatCurrency(totalExpenses),
      description: 'All time expenses',
      icon: DollarSign,
      color: 'text-blue-600',
    },
    {
      title: 'This Month',
      value: formatCurrency(monthlyExpenses),
      description: 'Current month expenses',
      icon: TrendingUp,
      color: 'text-green-600',
    },
    {
      title: 'Pending Approval',
      value: formatCurrency(pendingExpenses),
      description: 'Awaiting approval',
      icon: AlertCircle,
      color: 'text-orange-600',
    },
    {
      title: 'Active Budgets',
      value: activeBudgets.toString(),
      description: 'Currently active budgets',
      icon: TrendingDown,
      color: 'text-purple-600',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export { FinancialOverview };
