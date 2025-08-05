
import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
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
    <div className="min-h-screen bg-gray-50">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
