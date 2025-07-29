
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Plus } from 'lucide-react';
import { useBudgets } from '@/hooks/useBudgets';
import { CreateBudgetDialog } from './CreateBudgetDialog';

const BudgetManager = () => {
  const { budgets, loading } = useBudgets();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getUtilizationPercentage = (spent: number, allocated: number) => {
    return allocated > 0 ? (spent / allocated) * 100 : 0;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-orange-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return <div>Loading budgets...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Budget Overview</h3>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Budget
        </Button>
      </div>

      {budgets.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No budgets created yet</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {budgets.map((budget) => {
            const utilizationPercentage = getUtilizationPercentage(budget.spent_amount, budget.allocated_amount);
            
            return (
              <Card key={budget.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        <div className="flex items-center">
                          <span 
                            className="inline-block w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: budget.category?.color }}
                          />
                          {budget.category?.name}
                        </div>
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        {new Date(budget.budget_period_start).toLocaleDateString()} - {new Date(budget.budget_period_end).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{formatCurrency(budget.allocated_amount)}</p>
                      <p className="text-sm text-gray-600">Allocated</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Spent: {formatCurrency(budget.spent_amount)}</span>
                      <span>Remaining: {formatCurrency(budget.remaining_amount)}</span>
                    </div>
                    
                    <Progress 
                      value={utilizationPercentage} 
                      className="h-2"
                    />
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className={`font-semibold ${utilizationPercentage >= 90 ? 'text-red-600' : utilizationPercentage >= 75 ? 'text-orange-600' : 'text-green-600'}`}>
                        {utilizationPercentage.toFixed(1)}% utilized
                      </span>
                      <span className="text-gray-600 capitalize">{budget.status}</span>
                    </div>

                    {budget.notes && (
                      <p className="text-sm text-gray-600 mt-2">{budget.notes}</p>
                    )}

                    {utilizationPercentage >= 90 && (
                      <div className="bg-red-50 border border-red-200 rounded-md p-2">
                        <p className="text-red-700 text-sm font-medium">
                          ⚠️ Budget nearly exhausted! Consider reviewing expenses.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <CreateBudgetDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
};

export { BudgetManager };
