
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuditTrail } from '@/hooks/useAuditTrail';
import { Member } from '@/hooks/useMembers';
import { AlertTriangle } from 'lucide-react';

interface SuspendMemberDialogProps {
  member: Member;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMemberUpdated: () => void;
}

const SuspendMemberDialog = ({ member, open, onOpenChange, onMemberUpdated }: SuspendMemberDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');
  const { toast } = useToast();
  const { logActivity } = useAuditTrail();

  const handleSuspend = async () => {
    setLoading(true);

    try {
      const oldValues = { status: member.status };
      const newValues = { 
        status: 'suspended',
        suspension_reason: reason.trim() || 'No reason provided'
      };

      const { error } = await supabase
        .from('members')
        .update({ 
          status: 'suspended', 
          updated_at: new Date().toISOString() 
        })
        .eq('id', member.id);

      if (error) throw error;

      await logActivity(
        'member_suspended',
        'members',
        member.id,
        oldValues,
        newValues
      );

      toast({
        title: "Success",
        description: `${member.name} has been suspended`,
      });

      setReason('');
      onOpenChange(false);
      onMemberUpdated();
    } catch (error) {
      console.error('Error suspending member:', error);
      toast({
        title: "Error",
        description: "Failed to suspend member",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Suspend Member
          </DialogTitle>
          <DialogDescription>
            This will suspend <strong>{member.name}</strong> from the chama. They will not be able to participate in activities while suspended.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="suspension-reason">Reason for Suspension (Optional)</Label>
            <Textarea
              id="suspension-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter the reason for suspending this member..."
              rows={4}
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSuspend}
              disabled={loading}
              variant="destructive"
              className="bg-orange-600 hover:bg-orange-700"
            >
              {loading ? 'Suspending...' : 'Suspend Member'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SuspendMemberDialog;
