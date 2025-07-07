
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
  onMemberUpdated: () => void;
}

const MemberContextMenu = ({ member, onMemberUpdated }: MemberContextMenuProps) => {
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

      onMemberUpdated();
    } catch (error) {
      console.error('Error reactivating member:', error);
      toast({
        title: "Error",
        description: "Failed to reactivate member",
        variant: "destructive",
      });
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
          <ContextMenuItem onClick={() => setEditDialogOpen(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Member
          </ContextMenuItem>
          <ContextMenuSeparator />
          {member.status === 'active' ? (
            <ContextMenuItem onClick={() => setSuspendDialogOpen(true)}>
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
            onClick={() => setDeleteDialogOpen(true)}
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
        onMemberUpdated={onMemberUpdated}
      />

      <SuspendMemberDialog 
        member={member}
        open={suspendDialogOpen}
        onOpenChange={setSuspendDialogOpen}
        onMemberUpdated={onMemberUpdated}
      />

      <DeleteMemberDialog 
        member={member}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onMemberUpdated={onMemberUpdated}
      />
    </>
  );
};

export default MemberContextMenu;
