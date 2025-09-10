import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import UserProfile from './UserProfile';
import { 
  LayoutDashboard, 
  Users, 
  PiggyBank, 
  Calendar, 
  TrendingUp, 
  Calculator,
  FileText,
  Bell,
  Settings,
  Shield,
  LogOut 
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

interface AppSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function AppSidebar({ activeTab, setActiveTab }: AppSidebarProps) {
  const { signOut } = useAuth();
  const { canManageUsers, canManageFinances, canViewReports, isAdmin } = useUserRoles();
  const { state } = useSidebar();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, show: true },
    { id: 'members', label: 'Members', icon: Users, show: true },
    { id: 'contributions', label: 'Contributions', icon: PiggyBank, show: true },
    { id: 'meetings', label: 'Meetings', icon: Calendar, show: true },
    { id: 'dividends', label: 'Dividends', icon: TrendingUp, show: canViewReports() },
    { id: 'financial', label: 'Financial', icon: Calculator, show: canManageFinances() },
    { id: 'notifications', label: 'Notifications', icon: Bell, show: true },
    { id: 'audit', label: 'Audit Trail', icon: FileText, show: canViewReports() },
    { id: 'settings', label: 'Settings', icon: Settings, show: true },
    { id: 'admin', label: 'Administration', icon: Shield, show: isAdmin() },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  const visibleNavItems = navItems.filter(item => item.show);
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarHeader className="border-b border-border p-4">
        {!isCollapsed && (
          <h1 className="text-xl font-bold text-foreground">Chama Admin</h1>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => setActiveTab(item.id)}
                      className={isActive ? "bg-accent text-accent-foreground font-medium" : "hover:bg-accent/50"}
                    >
                      <Icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.label}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        <div className="space-y-2">
          {!isCollapsed && <UserProfile />}
          <Button 
            variant="outline" 
            onClick={handleSignOut}
            className="w-full justify-start"
            size={isCollapsed ? "icon" : "default"}
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2">Sign Out</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}