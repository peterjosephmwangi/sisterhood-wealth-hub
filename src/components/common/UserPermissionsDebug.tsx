
import React from 'react';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

const UserPermissionsDebug: React.FC = () => {
  const { user } = useAuth();
  const { 
    userRoles, 
    canManageUsers, 
    canManageFinances, 
    canManageMeetings, 
    canViewReports,
    isAdmin,
    isTreasurer,
    isSecretary,
    isChairperson,
    isMember
  } = useUserRoles();

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="text-sm">Debug: User Permissions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <p className="text-xs text-muted-foreground">User: {user?.email}</p>
        </div>
        <div>
          <p className="text-xs font-medium mb-1">Roles:</p>
          <div className="flex flex-wrap gap-1">
            {userRoles.length === 0 ? (
              <Badge variant="secondary" className="text-xs">No roles</Badge>
            ) : (
              userRoles.map(role => (
                <Badge key={role} variant="secondary" className="text-xs">{role}</Badge>
              ))
            )}
          </div>
        </div>
        <div className="text-xs space-y-1">
          <p>Admin: {isAdmin() ? '✅' : '❌'}</p>
          <p>Treasurer: {isTreasurer() ? '✅' : '❌'}</p>
          <p>Secretary: {isSecretary() ? '✅' : '❌'}</p>
          <p>Chairperson: {isChairperson() ? '✅' : '❌'}</p>
          <p>Member: {isMember() ? '✅' : '❌'}</p>
        </div>
        <div className="text-xs space-y-1 pt-2 border-t">
          <p>Can Manage Users: {canManageUsers() ? '✅' : '❌'}</p>
          <p>Can Manage Finances: {canManageFinances() ? '✅' : '❌'}</p>
          <p>Can Manage Meetings: {canManageMeetings() ? '✅' : '❌'}</p>
          <p>Can View Reports: {canViewReports() ? '✅' : '❌'}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserPermissionsDebug;
