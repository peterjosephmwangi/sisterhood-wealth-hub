
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuditTrail } from '@/hooks/useAuditTrail';
import { Member } from '@/hooks/useMembers';
import { Trash2 } from 'lucide-react';

interface DeleteMemberDialogProps {
  member: Member;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMemberUpdated: () => void;
}

const DeleteMemberDialog = ({ member, open, onOpenChange, onMemberUpdated }: DeleteMemberDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [confirmName, setConfirmName] = useState('');
  const { toast } = useToast();
  const { logActivity } = useAuditTrail();

  const handleDelete = async () => {
    if (confirmName !== member.name) {
      toast({
        title: "Error",
        description: "Please type the member's name exactly to confirm deletion",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const oldValues = {
        id: member.id,
        name: member.name,
        phone: member.phone,
        email: member.email,
        status: member.status
      };

      // Log the deletion before actually deleting
      await logActivity(
        'member_deleted',
        'members',
        member.id,
        oldValues,
        null
      );

      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', member.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${member.name} has been permanently deleted`,
      });

      setConfirmName('');
      onOpenChange(false);
      onMemberUpdated();
    } catch (error) {
      console.error('Error deleting member:', error);
      toast({
        title: "Error",
        description: "Failed to delete member. They may have associated records that prevent deletion.",
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
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="w-5 h-5" />
            Delete Member Account
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete <strong>{member.name}</strong>'s account and remove all associated data.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-red-800 mb-2">Warning</h4>
            <p className="text-sm text-red-700">
              Deleting this member will remove their contributions, loan records, and all other associated data. This action is irreversible.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-name">
              Type <strong>{member.name}</strong> to confirm deletion:
            </Label>
            <Input
              id="confirm-name"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={member.name}
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
              onClick={handleDelete}
              disabled={loading || confirmName !== member.name}
              variant="destructive"
            >
              {loading ? 'Deleting...' : 'Delete Member'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteMemberDialog;
