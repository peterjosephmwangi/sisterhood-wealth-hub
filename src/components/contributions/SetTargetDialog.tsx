
import React, { useState } from 'react';
import { Calendar, Target } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMonthlyTargets } from '@/hooks/useMonthlyTargets';

interface SetTargetDialogProps {
  onTargetUpdated?: () => void;
}

const SetTargetDialog = ({ onTargetUpdated }: SetTargetDialogProps) => {
  const [open, setOpen] = useState(false);
  const [targetAmount, setTargetAmount] = useState('');
  const [targetMonth, setTargetMonth] = useState(
    new Date().toISOString().substring(0, 7) // Current month in YYYY-MM format
  );
  const [loading, setLoading] = useState(false);
  const { updateTarget } = useMonthlyTargets();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!targetAmount || !targetMonth) {
      return;
    }

    try {
      setLoading(true);
      await updateTarget(targetMonth + '-01', parseFloat(targetAmount));
      
      setOpen(false);
      setTargetAmount('');
      onTargetUpdated?.();
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <Target className="w-4 h-4 mr-2" />
          Set Monthly Target
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Set Monthly Contribution Target
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="target-month">Target Month</Label>
            <Input
              id="target-month"
              type="month"
              value={targetMonth}
              onChange={(e) => setTargetMonth(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="target-amount">Target Amount (KSh)</Label>
            <Input
              id="target-amount"
              type="number"
              placeholder="120000"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              min="0"
              step="1000"
              required
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Setting...' : 'Set Target'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SetTargetDialog;
