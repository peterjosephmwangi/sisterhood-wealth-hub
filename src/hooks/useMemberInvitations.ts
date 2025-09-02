
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserRoles } from './useUserRoles';
import { useAuth } from '@/contexts/AuthContext';

export interface MemberInvitation {
  id: string;
  email: string;
  invited_by: string;
  invitation_token: string;
  expires_at: string;
  status: 'pending' | 'accepted' | 'expired';
  member_data: {
    name: string;
    phone: string;
  };
  created_at: string;
  updated_at: string;
}

export const useMemberInvitations = () => {
  const [invitations, setInvitations] = useState<MemberInvitation[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { isAdmin } = useUserRoles();
  const { user } = useAuth();

  const fetchInvitations = async () => {
    if (!isAdmin()) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to view invitations",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('member_invitations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type cast the data to match our interface
      const typedData = (data || []).map(invitation => ({
        ...invitation,
        status: invitation.status as 'pending' | 'accepted' | 'expired',
        member_data: invitation.member_data as { name: string; phone: string }
      }));
      
      setInvitations(typedData);
    } catch (error) {
      console.error('Error fetching invitations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch invitations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendInvitation = async (memberData: { name: string; phone: string; email: string }) => {
    if (!isAdmin()) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to send invitations",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // First expire any old invitations for this email
      await supabase.rpc('expire_old_invitations');

      const { data, error } = await supabase
        .from('member_invitations')
        .insert({
          email: memberData.email,
          invited_by: user.id,
          member_data: {
            name: memberData.name,
            phone: memberData.phone
          }
        })
        .select()
        .single();

      if (error) throw error;

      // Send invitation email
      try {
        const emailResponse = await supabase.functions.invoke('send-invitation-email', {
          body: {
            email: memberData.email,
            name: memberData.name,
            invitationToken: data.invitation_token
          }
        });

        if (emailResponse.error) {
          console.error('Email error:', emailResponse.error);
          toast({
            title: "Invitation Created",
            description: `Invitation created for ${memberData.email}, but email failed to send. Please resend manually.`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: `Invitation sent to ${memberData.email}`,
          });
        }
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        toast({
          title: "Invitation Created",
          description: `Invitation created for ${memberData.email}, but email failed to send. Please resend manually.`,
          variant: "destructive",
        });
      }

      fetchInvitations();
      return data;
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resendInvitation = async (invitationId: string) => {
    if (!isAdmin()) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to resend invitations",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Get the invitation details first
      const { data: invitationData, error: fetchError } = await supabase
        .from('member_invitations')
        .select('*')
        .eq('id', invitationId)
        .single();

      if (fetchError) throw fetchError;

      // Update the invitation
      const { error } = await supabase
        .from('member_invitations')
        .update({ 
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', invitationId);

      if (error) throw error;

      // Resend the email
      try {
        const emailResponse = await supabase.functions.invoke('send-invitation-email', {
          body: {
            email: invitationData.email,
            name: (invitationData.member_data as { name: string; phone: string }).name,
            invitationToken: invitationData.invitation_token
          }
        });

        if (emailResponse.error) {
          console.error('Email error:', emailResponse.error);
          toast({
            title: "Invitation Updated",
            description: "Invitation expiry extended, but email failed to send",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: "Invitation resent successfully",
          });
        }
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        toast({
          title: "Invitation Updated",
          description: "Invitation expiry extended, but email failed to send",
          variant: "destructive",
        });
      }

      fetchInvitations();
    } catch (error: any) {
      console.error('Error resending invitation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to resend invitation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    if (!isAdmin()) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to cancel invitations",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('member_invitations')
        .update({ status: 'expired', updated_at: new Date().toISOString() })
        .eq('id', invitationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invitation cancelled",
      });

      fetchInvitations();
    } catch (error: any) {
      console.error('Error cancelling invitation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to cancel invitation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    invitations,
    loading,
    fetchInvitations,
    sendInvitation,
    resendInvitation,
    cancelInvitation,
  };
};
