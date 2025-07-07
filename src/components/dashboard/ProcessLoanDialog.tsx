
import React, { useState } from 'react';
import { DollarSign } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMembers } from '@/hooks/useMembers';
import { useLoanEligibility } from '@/hooks/useLoanEligibility';
import { useAuditTrail } from '@/hooks/useAuditTrail';

const ProcessLoanDialog = ({ onLoanProcessed }: { onLoanProcessed: () => void }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    member_id: '',
    amount: '',
    interest_rate: '5',
    due_date: ''
  });
  const { toast } = useToast();
  const { members } = useMembers();
  const { eligibility } = useLoanEligibility(formData.member_id || null);
  const { logActivity } = useAuditTrail();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.member_id || !formData.amount || !formData.due_date) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    const loanAmount = parseFloat(formData.amount);
    
    if (loanAmount > eligibility.maxLoanAmount) {
      toast({
        title: "Error",
        description: `Loan amount exceeds maximum allowed of ${formatCurrency(eligibility.maxLoanAmount)}`,
        variant: "destructive",
      });
      return;
    }

    if (loanAmount > eligibility.availableLoanFund) {
      toast({
        title: "Error",
        description: `Insufficient funds available. Available: ${formatCurrency(eligibility.availableLoanFund)}`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const loanData = {
        member_id: formData.member_id,
        amount: loanAmount,
        interest_rate: parseFloat(formData.interest_rate),
        due_date: formData.due_date,
        status: 'approved'
      };

      const { data, error } = await supabase
        .from('loans')
        .insert([loanData])
        .select()
        .single();

      if (error) throw error;

      // Log the loan processing activity
      await logActivity(
        'loan_approved',
        'loans',
        data.id,
        null,
        loanData
      );

      toast({
        title: "Success",
        description: "Loan processed successfully",
      });

      setFormData({
        member_id: '',
        amount: '',
        interest_rate: '5',
        due_date: ''
      });
      setOpen(false);
      onLoanProcessed();
    } catch (error) {
      console.error('Error processing loan:', error);
      toast({
        title: "Error",
        description: "Failed to process loan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectedMember = members.find(m => m.id === formData.member_id);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <DollarSign className="w-4 h-4 mr-2" />
          Process Loan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Process New Loan</DialogTitle>
          <DialogDescription>
            Approve and process a loan for a member.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="member">Member *</Label>
            <Select value={formData.member_id} onValueChange={(value) => handleInputChange('member_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a member" />
              </SelectTrigger>
              <SelectContent>
                {members.filter(member => member.status === 'active').map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.member_id && (
            <div className="bg-gray-50 p-3 rounded-lg space-y-2">
              <h4 className="font-semibold text-sm">Loan Eligibility</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Total Contributions:</span>
                  <p className="font-medium">{formatCurrency(eligibility.totalContributions)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Max Loan Amount:</span>
                  <p className="font-medium">{formatCurrency(eligibility.maxLoanAmount)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Available Fund:</span>
                  <p className="font-medium">{formatCurrency(eligibility.availableLoanFund)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Eligible:</span>
                  <p className={`font-medium ${eligibility.isEligible ? 'text-green-600' : 'text-red-600'}`}>
                    {eligibility.isEligible ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
              {!eligibility.isEligible && (
                <div className="mt-2">
                  <span className="text-red-600 text-sm">Reasons:</span>
                  <ul className="text-red-600 text-sm list-disc list-inside">
                    {eligibility.eligibilityReasons.map((reason, index) => (
                      <li key={index}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="amount">Loan Amount (KES) *</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              placeholder="Enter loan amount"
              min="0"
              step="0.01"
              required
              disabled={!eligibility.isEligible}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interest_rate">Interest Rate (%) *</Label>
            <Input
              id="interest_rate"
              type="number"
              value={formData.interest_rate}
              onChange={(e) => handleInputChange('interest_rate', e.target.value)}
              placeholder="Enter interest rate"
              min="0"
              step="0.1"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="due_date">Due Date *</Label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) => handleInputChange('due_date', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !eligibility.isEligible}
              className="bg-blue-600 hover:bg-blue-700"
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
