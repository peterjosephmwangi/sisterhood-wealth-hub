
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

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const { signOut } = useAuth();
  const { canManageUsers, canManageFinances, canViewReports, isAdmin } = useUserRoles();

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

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900">Chama Admin</h1>
            </div>
            <div className="hidden md:flex space-x-1">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    onClick={() => setActiveTab(item.id)}
                    className="flex items-center space-x-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <UserProfile />
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
