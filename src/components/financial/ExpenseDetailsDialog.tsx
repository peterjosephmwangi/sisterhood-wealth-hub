
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Expense } from '@/hooks/useExpenses';

interface ExpenseDetailsDialogProps {
  expense: Expense | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ExpenseDetailsDialog: React.FC<ExpenseDetailsDialogProps> = ({ expense, open, onOpenChange }) => {
  if (!expense) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Expense Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-sm text-gray-600">Amount</h4>
              <p className="text-lg font-bold">{formatCurrency(expense.amount)}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-600">Status</h4>
              <Badge className={getStatusBadgeColor(expense.status)}>
                {expense.status}
              </Badge>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-gray-600">Description</h4>
            <p>{expense.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-sm text-gray-600">Category</h4>
              <div className="flex items-center">
                <span 
                  className="inline-block w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: expense.category?.color }}
                />
                {expense.category?.name}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-600">Payment Method</h4>
              <p className="capitalize">{expense.payment_method.replace('_', ' ')}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-sm text-gray-600">Expense Date</h4>
              <p>{new Date(expense.expense_date).toLocaleDateString()}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-600">Created At</h4>
              <p>{new Date(expense.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          {expense.receipt_reference && (
            <div>
              <h4 className="font-semibold text-sm text-gray-600">Receipt Reference</h4>
              <p>{expense.receipt_reference}</p>
            </div>
          )}

          {expense.approved_by && (
            <div>
              <h4 className="font-semibold text-sm text-gray-600">Approved By</h4>
              <p>{expense.approved_by}</p>
            </div>
          )}

          {expense.notes && (
            <div>
              <h4 className="font-semibold text-sm text-gray-600">Notes</h4>
              <p>{expense.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { ExpenseDetailsDialog };
