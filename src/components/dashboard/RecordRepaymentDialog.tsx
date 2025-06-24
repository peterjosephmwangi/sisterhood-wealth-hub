
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CreditCard } from 'lucide-react';
import { useMembers } from '@/hooks/useMembers';
import { useActiveLoans } from '@/hooks/useActiveLoans';
import { useLoanRepayments } from '@/hooks/useLoanRepayments';

interface RecordRepaymentDialogProps {
  onRepaymentRecorded: () => void;
}

const RecordRepaymentDialog = ({ onRepaymentRecorded }: RecordRepaymentDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    member_id: '',
    loan_id: '',
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    notes: '',
  });

  const { members } = useMembers();
  const { activeLoans } = useActiveLoans(formData.member_id);
  const { addRepayment } = useLoanRepayments(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const selectedLoan = activeLoans.find(loan => loan.id === formData.loan_id);
  const repaymentAmount = parseFloat(formData.amount) || 0;
  const exceedsBalance = repaymentAmount > (selectedLoan?.balance || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.loan_id || !formData.amount) {
      return;
    }

    if (exceedsBalance) {
      return;
    }

    try {
      setLoading(true);
      const success = await addRepayment({
        loan_id: formData.loan_id,
        amount: parseFloat(formData.amount),
        payment_date: formData.payment_date,
        payment_method: formData.payment_method as any,
        notes: formData.notes || undefined,
      });

      if (success) {
        setFormData({
          member_id: '',
          loan_id: '',
          amount: '',
          payment_date: new Date().toISOString().split('T')[0],
          payment_method: 'cash',
          notes: '',
        });
        setOpen(false);
        onRepaymentRecorded();
      }
    } catch (error) {
      console.error('Error recording repayment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <CreditCard className="w-4 h-4 mr-2" />
          Record Loan Repayment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Record Loan Repayment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="member">Member *</Label>
            <Select value={formData.member_id} onValueChange={(value) => {
              setFormData(prev => ({ ...prev, member_id: value, loan_id: '' }));
            }}>
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

          {formData.member_id && (
            <div>
              <Label htmlFor="loan">Active Loan *</Label>
              <Select value={formData.loan_id} onValueChange={(value) => setFormData(prev => ({ ...prev, loan_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select loan" />
                </SelectTrigger>
                <SelectContent>
                  {activeLoans.map((loan) => (
                    <SelectItem key={loan.id} value={loan.id}>
                      {formatCurrency(loan.amount)} - Balance: {formatCurrency(loan.balance)} (Due: {new Date(loan.due_date).toLocaleDateString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {activeLoans.length === 0 && formData.member_id && (
                <p className="text-sm text-gray-500 mt-1">No active loans found for this member</p>
              )}
            </div>
          )}

          {selectedLoan && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-sm">Loan Details</h4>
              <div className="text-sm space-y-1">
                <p>Loan Amount: <span className="font-medium">{formatCurrency(selectedLoan.amount)}</span></p>
                <p>Total Amount (with {selectedLoan.interest_rate}% interest): <span className="font-medium">{formatCurrency(selectedLoan.total_amount)}</span></p>
                <p>Total Repaid: <span className="font-medium text-green-600">{formatCurrency(selectedLoan.total_repaid)}</span></p>
                <p>Outstanding Balance: <span className="font-medium text-red-600">{formatCurrency(selectedLoan.balance)}</span></p>
                <p>Due Date: <span className="font-medium">{new Date(selectedLoan.due_date).toLocaleDateString()}</span></p>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="amount">Repayment Amount (KSh) *</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              step="1"
              placeholder="Enter amount"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              required
            />
            {exceedsBalance && repaymentAmount > 0 && (
              <p className="text-sm text-red-600 mt-1">
                Amount exceeds outstanding balance of {formatCurrency(selectedLoan?.balance || 0)}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="payment_method">Payment Method</Label>
            <Select value={formData.payment_method} onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="m_pesa">M-Pesa</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="payment_date">Payment Date *</Label>
            <Input
              id="payment_date"
              type="date"
              value={formData.payment_date}
              onChange={(e) => setFormData(prev => ({ ...prev, payment_date: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about the repayment..."
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
              disabled={loading || !formData.loan_id || !formData.amount || exceedsBalance}
            >
              {loading ? 'Recording...' : 'Record Repayment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RecordRepaymentDialog;
