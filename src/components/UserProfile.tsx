
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { LogOut, User } from 'lucide-react';

const UserProfile = () => {
  const { user, signOut } = useAuth();
  const { userRoles, loading } = useUserRoles();

  if (!user) return null;

  const userInitials = user.email?.charAt(0).toUpperCase() || 'U';

  const roleLabels: Record<string, string> = {
    admin: 'Administrator',
    treasurer: 'Treasurer',
    secretary: 'Secretary',
    chairperson: 'Chairperson',
    member: 'Member',
  };

  const roleColors: Record<string, string> = {
    admin: 'bg-red-100 text-red-800',
    treasurer: 'bg-green-100 text-green-800',
    secretary: 'bg-blue-100 text-blue-800',
    chairperson: 'bg-purple-100 text-purple-800',
    member: 'bg-gray-100 text-gray-800',
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <p className="text-sm font-medium leading-none">
              {user.user_metadata?.full_name || 'Admin'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            {!loading && userRoles.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-2">
                {userRoles.map((role) => (
                  <Badge
                    key={role}
                    variant="secondary"
                    className={`text-xs ${roleColors[role] || 'bg-gray-100 text-gray-800'}`}
                  >
                    {roleLabels[role] || role}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfile;
