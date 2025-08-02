
import React, { useState } from 'react';
import { MoreVertical, UserX, Trash2, Edit, UserCheck } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuditTrail } from '@/hooks/useAuditTrail';
import { Member } from '@/hooks/useMembers';
import EditMemberDialog from './EditMemberDialog';
import SuspendMemberDialog from './SuspendMemberDialog';
import DeleteMemberDialog from './DeleteMemberDialog';

interface MemberContextMenuProps {
  member: Member;
  onAction?: (member: any, action: string) => void;
  onMemberUpdated?: () => void;
}

const MemberContextMenu = ({ member, onAction, onMemberUpdated }: MemberContextMenuProps) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const { logActivity } = useAuditTrail();

  const handleReactivate = async () => {
    try {
      const oldValues = { status: member.status };
      const newValues = { status: 'active' };

      const { error } = await supabase
        .from('members')
        .update({ status: 'active', updated_at: new Date().toISOString() })
        .eq('id', member.id);

      if (error) throw error;

      await logActivity(
        'member_reactivated',
        'members',
        member.id,
        oldValues,
        newValues
      );

      toast({
        title: "Success",
        description: "Member has been reactivated",
      });

      if (onMemberUpdated) onMemberUpdated();
      if (onAction) onAction(member, 'reactivate');
    } catch (error) {
      console.error('Error reactivating member:', error);
      toast({
        title: "Error",
        description: "Failed to reactivate member",
        variant: "destructive",
      });
    }
  };

  const handleDialogSuccess = () => {
    if (onMemberUpdated) onMemberUpdated();
  };

  const handleAction = (action: string) => {
    if (onAction) {
      onAction(member, action);
    } else {
      // Fallback to local dialog management
      switch (action) {
        case 'edit':
          setEditDialogOpen(true);
          break;
        case 'suspend':
          setSuspendDialogOpen(true);
          break;
        case 'delete':
          setDeleteDialogOpen(true);
          break;
      }
    }
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          <ContextMenuItem onClick={() => handleAction('edit')}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Member
          </ContextMenuItem>
          <ContextMenuSeparator />
          {member.status === 'active' ? (
            <ContextMenuItem onClick={() => handleAction('suspend')}>
              <UserX className="w-4 h-4 mr-2" />
              Suspend Member
            </ContextMenuItem>
          ) : member.status === 'suspended' ? (
            <ContextMenuItem onClick={handleReactivate}>
              <UserCheck className="w-4 h-4 mr-2" />
              Reactivate Member
            </ContextMenuItem>
          ) : null}
          <ContextMenuSeparator />
          <ContextMenuItem 
            onClick={() => handleAction('delete')}
            className="text-red-600 focus:text-red-600 focus:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Member
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <EditMemberDialog 
        member={member}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onMemberUpdated={handleDialogSuccess}
      />

      <SuspendMemberDialog 
        member={member}
        open={suspendDialogOpen}
        onOpenChange={setSuspendDialogOpen}
        onMemberUpdated={handleDialogSuccess}
      />

      <DeleteMemberDialog 
        member={member}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onMemberUpdated={handleDialogSuccess}
      />
    </>
  );
};

export default MemberContextMenu;
