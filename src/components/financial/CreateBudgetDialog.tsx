
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useExpenses } from '@/hooks/useExpenses';
import { useBudgets } from '@/hooks/useBudgets';

interface CreateBudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateBudgetDialog: React.FC<CreateBudgetDialogProps> = ({ open, onOpenChange }) => {
  const { categories } = useExpenses();
  const { createBudget } = useBudgets();
  const [formData, setFormData] = useState({
    category_id: '',
    allocated_amount: '',
    budget_period_start: new Date().toISOString().split('T')[0],
    budget_period_end: '',
    notes: '',
    status: 'active',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await createBudget({
      ...formData,
      allocated_amount: parseFloat(formData.allocated_amount),
    });

    setLoading(false);

    if (!error) {
      setFormData({
        category_id: '',
        allocated_amount: '',
        budget_period_start: new Date().toISOString().split('T')[0],
        budget_period_end: '',
        notes: '',
        status: 'active',
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Budget</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center">
                      <span 
                        className="inline-block w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="allocated_amount">Budget Amount (KES) *</Label>
            <Input
              id="allocated_amount"
              type="number"
              step="0.01"
              value={formData.allocated_amount}
              onChange={(e) => setFormData({ ...formData, allocated_amount: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget_period_start">Start Date *</Label>
              <Input
                id="budget_period_start"
                type="date"
                value={formData.budget_period_start}
                onChange={(e) => setFormData({ ...formData, budget_period_start: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget_period_end">End Date *</Label>
              <Input
                id="budget_period_end"
                type="date"
                value={formData.budget_period_end}
                onChange={(e) => setFormData({ ...formData, budget_period_end: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Budget description or notes"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Budget'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export { CreateBudgetDialog };
