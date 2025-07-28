
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Heart, BarChart3, Users, CreditCard, Calendar, TrendingUp, FileText } from 'lucide-react';
import UserProfile from '@/components/UserProfile';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'contributions', label: 'Contributions', icon: CreditCard },
    { id: 'meetings', label: 'Meetings', icon: Calendar },
    { id: 'dividends', label: 'Dividends', icon: TrendingUp },
    { id: 'audit', label: 'Audit Trail', icon: FileText },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-pink-500" />
              <span className="text-xl font-bold text-gray-900">Sisterhood Wealth Hub</span>
            </div>
            
            <div className="hidden md:flex space-x-1">
              {navItems.map(({ id, label, icon: Icon }) => (
                <Button
                  key={id}
                  variant={activeTab === id ? 'default' : 'ghost'}
                  onClick={() => setActiveTab(id)}
                  className={cn(
                    'flex items-center space-x-2 px-3 py-2',
                    activeTab === id 
                      ? 'bg-pink-100 text-pink-700 hover:bg-pink-200' 
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <UserProfile />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
