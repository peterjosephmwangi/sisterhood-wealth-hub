
import React, { useState } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import Dashboard from '@/components/Dashboard';
import Members from '@/components/Members';
import Contributions from '@/components/Contributions';
import Meetings from '@/components/Meetings';
import Dividends from '@/components/Dividends';
import Financial from '@/components/Financial';
import NotificationSystem from '@/components/NotificationSystem';
import AuditTrail from '@/components/audit/AuditTrail';
import AdminDashboard from '@/components/admin/AdminDashboard';
import Settings from '@/components/Settings';
import { useAuth } from '@/contexts/AuthContext';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user } = useAuth();

  // Enable session timeout with default settings
  useSessionTimeout({
    timeoutMinutes: 30,
    warningMinutes: 5,
  });

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'members':
        return <Members />;
      case 'contributions':
        return <Contributions />;
      case 'meetings':
        return <Meetings />;
      case 'dividends':
        return <Dividends />;
      case 'financial':
        return <Financial />;
      case 'notifications':
        return <NotificationSystem />;
      case 'audit':
        return <AuditTrail />;
      case 'admin':
        return <AdminDashboard />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center border-b border-border bg-background px-4">
            <SidebarTrigger />
          </header>
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-7xl mx-auto">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
