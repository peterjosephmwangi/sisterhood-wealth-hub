
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { RefreshCw, Plus, X } from 'lucide-react';
import { useRoleManagement, UserWithRoles } from '@/hooks/useRoleManagement';
import { AppRole } from '@/hooks/useUserRoles';

const roleLabels: Record<AppRole, string> = {
  admin: 'Administrator',
  treasurer: 'Treasurer',
  secretary: 'Secretary',
  chairperson: 'Chairperson',
  member: 'Member',
};

const roleColors: Record<AppRole, string> = {
  admin: 'bg-red-100 text-red-800',
  treasurer: 'bg-green-100 text-green-800',
  secretary: 'bg-blue-100 text-blue-800',
  chairperson: 'bg-purple-100 text-purple-800',
  member: 'bg-gray-100 text-gray-800',
};

const RoleManagement = () => {
  const { users, loading, fetchUsersWithRoles, assignRole, removeRole } = useRoleManagement();
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<AppRole>('member');

  useEffect(() => {
    fetchUsersWithRoles();
  }, []);

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRole) return;

    const user = users.find(u => u.user_id === selectedUser);
    if (!user) return;

    // Check if user already has this role
    if (user.roles.includes(selectedRole)) {
      return;
    }

    await assignRole(selectedUser, selectedRole);
    setSelectedUser('');
  };

  const handleRemoveRole = async (userId: string, role: AppRole) => {
    await removeRole(userId, role);
  };

  const getUserInitials = (user: UserWithRoles) => {
    if (user.full_name) {
      return user.full_name.split(' ').map(n => n[0]).join('');
    }
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
          <p className="text-muted-foreground">
            Manage user roles and permissions
          </p>
        </div>
        <Button onClick={fetchUsersWithRoles} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assign Role</CardTitle>
          <CardDescription>
            Assign roles to users to grant them specific permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium">Select User</label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.user_id} value={user.user_id}>
                      {user.full_name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">Select Role</label>
              <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as AppRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(roleLabels).map(([role, label]) => (
                    <SelectItem key={role} value={role}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAssignRole} disabled={!selectedUser}>
              <Plus className="w-4 h-4 mr-2" />
              Assign Role
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users & Roles</CardTitle>
          <CardDescription>
            Overview of all users and their assigned roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.user_id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-purple-100 text-purple-600 text-xs">
                              {getUserInitials(user)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">
                            {user.full_name || 'Unknown User'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles.length === 0 ? (
                            <span className="text-muted-foreground text-sm">No roles</span>
                          ) : (
                            user.roles.map((role) => (
                              <Badge
                                key={role}
                                variant="secondary"
                                className={roleColors[role]}
                              >
                                {roleLabels[role]}
                              </Badge>
                            ))
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {user.roles.map((role) => (
                            <Button
                              key={role}
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveRole(user.user_id, role)}
                              className="h-6 w-6 p-0"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleManagement;
