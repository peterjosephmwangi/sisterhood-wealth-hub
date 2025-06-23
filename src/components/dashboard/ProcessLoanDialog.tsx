
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import { useMembers } from '@/hooks/useMembers';
import { useLoanEligibility } from '@/hooks/useLoanEligibility';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProcessLoanDialogProps {
  onLoanProcessed: () => void;
}

const ProcessLoanDialog = ({ onLoanProcessed }: ProcessLoanDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    member_id: '',
    amount: '',
    interest_rate: '10',
    due_date: '',
    notes: '',
  });
  const { members } = useMembers();
  const { eligibility, loading: eligibilityLoading } = useLoanEligibility(formData.member_id);
  const { toast } = useToast();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const selectedMember = members.find(m => m.id === formData.member_id);
  const requestedAmount = parseFloat(formData.amount) || 0;
  const exceedsLimit = requestedAmount > eligibility.maxLoanAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.member_id || !formData.amount || !formData.due_date) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!eligibility.isEligible) {
      toast({
        title: "Validation Error",
        description: "Member must have confirmed contributions before being eligible for a loan",
        variant: "destructive",
      });
      return;
    }

    if (exceedsLimit) {
      toast({
        title: "Validation Error",
        description: `Loan amount exceeds member's limit of ${formatCurrency(eligibility.maxLoanAmount)}`,
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from('loans')
        .insert({
          member_id: formData.member_id,
          amount: parseFloat(formData.amount),
          interest_rate: parseFloat(formData.interest_rate),
          due_date: formData.due_date,
          status: 'approved',
          approved_by: 'admin',
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Loan has been processed successfully",
      });

      setFormData({
        member_id: '',
        amount: '',
        interest_rate: '10',
        due_date: '',
        notes: '',
      });
      setOpen(false);
      onLoanProcessed();
    } catch (error) {
      console.error('Error processing loan:', error);
      toast({
        title: "Error",
        description: "Failed to process loan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <TrendingUp className="w-4 h-4 mr-2" />
          Process Loan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Process New Loan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="member">Member *</Label>
            <Select value={formData.member_id} onValueChange={(value) => setFormData(prev => ({ ...prev, member_id: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select member" />
              </SelectTrigger>
              <SelectContent>
                {members.filter(m => m.status === 'active').map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedMember && !eligibilityLoading && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-sm">Loan Eligibility for {selectedMember.name}</h4>
              <div className="text-sm space-y-1">
                <p>Total Contributions: <span className="font-medium text-green-600">{formatCurrency(eligibility.totalContributions)}</span></p>
                <p>Maximum Loan Amount: <span className="font-medium text-blue-600">{formatCurrency(eligibility.maxLoanAmount)}</span></p>
                <p className="text-xs text-gray-500">*Loan limit is 3x total contributions</p>
              </div>
            </div>
          )}

          {selectedMember && !eligibility.isEligible && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This member has no confirmed contributions and is not eligible for a loan.
              </AlertDescription>
            </Alert>
          )}

          <div>
            <Label htmlFor="amount">Loan Amount (KSh) *</Label>
            <Input
              id="amount"
              type="number"
              min="100"
              step="100"
              placeholder="Enter amount"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              required
            />
            {requestedAmount > 0 && exceedsLimit && (
              <p className="text-sm text-red-600 mt-1">
                Amount exceeds maximum limit of {formatCurrency(eligibility.maxLoanAmount)}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="interest_rate">Interest Rate (%)</Label>
            <Input
              id="interest_rate"
              type="number"
              min="0"
              max="50"
              step="0.5"
              placeholder="10"
              value={formData.interest_rate}
              onChange={(e) => setFormData(prev => ({ ...prev, interest_rate: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="due_date">Due Date *</Label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about the loan..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !eligibility.isEligible || exceedsLimit}
            >
              {loading ? 'Processing...' : 'Process Loan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProcessLoanDialog;
