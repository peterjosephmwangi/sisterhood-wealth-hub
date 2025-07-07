
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMembers } from '@/hooks/useMembers';
import { useAuditTrail } from '@/hooks/useAuditTrail';

const RecordContributionDialog = ({ onContributionRecorded }: { onContributionRecorded: () => void }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    member_id: '',
    amount: '',
    payment_method: 'cash' as const,
    contribution_date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const { toast } = useToast();
  const { members } = useMembers();
  const { logActivity } = useAuditTrail();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.member_id || !formData.amount) {
      toast({
        title: "Error",
        description: "Member and amount are required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const contributionData = {
        member_id: formData.member_id,
        amount: parseFloat(formData.amount),
        payment_method: formData.payment_method,
        contribution_date: formData.contribution_date,
        notes: formData.notes.trim() || null,
        status: 'confirmed' as const
      };

      const { data, error } = await supabase
        .from('contributions')
        .insert([contributionData])
        .select()
        .single();

      if (error) throw error;

      // Log the contribution activity
      await logActivity(
        'contribution_recorded',
        'contributions',
        data.id,
        null,
        contributionData
      );

      toast({
        title: "Success",
        description: "Contribution recorded successfully",
      });

      setFormData({
        member_id: '',
        amount: '',
        payment_method: 'cash',
        contribution_date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      setOpen(false);
      onContributionRecorded();
    } catch (error) {
      console.error('Error recording contribution:', error);
      toast({
        title: "Error",
        description: "Failed to record contribution. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Record Contribution
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record New Contribution</DialogTitle>
          <DialogDescription>
            Record a member's contribution to the chama fund.
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
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (KES) *</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              placeholder="Enter amount"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_method">Payment Method</Label>
            <Select value={formData.payment_method} onValueChange={(value) => handleInputChange('payment_method', value)}>
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

          <div className="space-y-2">
            <Label htmlFor="contribution_date">Contribution Date</Label>
            <Input
              id="contribution_date"
              type="date"
              value={formData.contribution_date}
              onChange={(e) => handleInputChange('contribution_date', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Add any additional notes..."
              rows={3}
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
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Recording...' : 'Record Contribution'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RecordContributionDialog;
