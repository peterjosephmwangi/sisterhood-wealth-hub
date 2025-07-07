
import React, { useState, useEffect } from 'react';
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

interface EditMemberDialogProps {
  member: Member;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMemberUpdated: () => void;
}

const EditMemberDialog = ({ member, open, onOpenChange, onMemberUpdated }: EditMemberDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const { toast } = useToast();
  const { logActivity } = useAuditTrail();

  useEffect(() => {
    if (open && member) {
      setFormData({
        name: member.name,
        phone: member.phone,
        email: member.email || ''
      });
    }
  }, [open, member]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast({
        title: "Error",
        description: "Name and phone number are required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const oldValues = {
        name: member.name,
        phone: member.phone,
        email: member.email
      };

      const updatedData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('members')
        .update(updatedData)
        .eq('id', member.id);

      if (error) throw error;

      await logActivity(
        'member_updated',
        'members',
        member.id,
        oldValues,
        updatedData
      );

      toast({
        title: "Success",
        description: "Member information updated successfully",
      });

      onOpenChange(false);
      onMemberUpdated();
    } catch (error) {
      console.error('Error updating member:', error);
      toast({
        title: "Error",
        description: "Failed to update member information",
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Member Information</DialogTitle>
          <DialogDescription>
            Update the member's information. Name and phone number are required.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Full Name *</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter full name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-phone">Phone Number *</Label>
            <Input
              id="edit-phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+254 7XX XXX XXX"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-email">Email Address</Label>
            <Input
              id="edit-email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="member@email.com"
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
              type="submit" 
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? 'Updating...' : 'Update Member'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditMemberDialog;
