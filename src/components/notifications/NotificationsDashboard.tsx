
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, MessageSquare, Mail, Settings, BarChart3, History } from 'lucide-react';
import NotificationStats from './NotificationStats';
import NotificationTemplates from './NotificationTemplates';
import NotificationHistory from './NotificationHistory';
import MemberPreferences from './MemberPreferences';

const NotificationsDashboard = () => {
  const [activeTab, setActiveTab] = useState('stats');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-full bg-blue-50">
            <Bell className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold">Notifications Management</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Statistics
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Preferences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stats">
            <NotificationStats />
          </TabsContent>

          <TabsContent value="templates">
            <NotificationTemplates />
          </TabsContent>

          <TabsContent value="history">
            <NotificationHistory />
          </TabsContent>

          <TabsContent value="preferences">
            <MemberPreferences />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NotificationsDashboard;
