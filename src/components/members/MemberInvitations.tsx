
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Calendar, 
  Clock, 
  RotateCcw, 
  X, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useMemberInvitations } from '@/hooks/useMemberInvitations';
import { format, isAfter } from 'date-fns';
import RoleGuard from '@/components/common/RoleGuard';

const MemberInvitations = () => {
  const { 
    invitations, 
    loading, 
    fetchInvitations, 
    resendInvitation, 
    cancelInvitation 
  } = useMemberInvitations();

  useEffect(() => {
    fetchInvitations();
  }, []);

  const getStatusBadge = (invitation: any) => {
    const isExpired = isAfter(new Date(), new Date(invitation.expires_at));
    
    if (invitation.status === 'accepted') {
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Accepted</Badge>;
    }
    
    if (invitation.status === 'expired' || isExpired) {
      return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Expired</Badge>;
    }
    
    return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
  };

  const canResend = (invitation: any) => {
    return invitation.status === 'pending' && isAfter(new Date(), new Date(invitation.expires_at));
  };

  const canCancel = (invitation: any) => {
    return invitation.status === 'pending' && !isAfter(new Date(), new Date(invitation.expires_at));
  };

  return (
    <RoleGuard requiredRole="admin">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Member Invitations
          </CardTitle>
          <CardDescription>
            Manage pending and completed member invitations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading invitations...</p>
              </div>
            </div>
          ) : invitations.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No invitations sent yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{invitation.member_data.name}</h3>
                        {getStatusBadge(invitation)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Email: {invitation.email}
                      </p>
                      <p className="text-sm text-muted-foreground mb-1">
                        Phone: {invitation.member_data.phone}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Sent: {format(new Date(invitation.created_at), 'MMM d, yyyy')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Expires: {format(new Date(invitation.expires_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {canResend(invitation) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resendInvitation(invitation.id)}
                          disabled={loading}
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Resend
                        </Button>
                      )}
                      {canCancel(invitation) && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => cancelInvitation(invitation.id)}
                          disabled={loading}
                        >
                          <X className="w-3 h-3 mr-1" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </RoleGuard>
  );
};

export default MemberInvitations;
