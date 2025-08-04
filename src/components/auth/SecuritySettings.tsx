import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TwoFactorSetup from './TwoFactorSetup';
import SessionManager from './SessionManager';

const SecuritySettings: React.FC = () => {
  const [sessionSettings, setSessionSettings] = useState({
    inactivityTimeout: 30, // minutes
    warningTimeout: 5, // minutes
  });

  const handleSessionSettingsChange = (inactivityTimeout: number, warningTimeout: number) => {
    setSessionSettings({ inactivityTimeout, warningTimeout });
    // You could persist these settings to localStorage or user preferences
    localStorage.setItem('sessionSettings', JSON.stringify({ inactivityTimeout, warningTimeout }));
  };

  // Load settings from localStorage on component mount
  React.useEffect(() => {
    const saved = localStorage.getItem('sessionSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessionSettings(parsed);
      } catch (error) {
        console.error('Error loading session settings:', error);
      }
    }
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Security Settings</h2>
        <p className="text-muted-foreground">
          Manage your account security and session preferences.
        </p>
      </div>

      <Tabs defaultValue="2fa" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="2fa">Two-Factor Auth</TabsTrigger>
          <TabsTrigger value="sessions">Session Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="2fa" className="space-y-6">
          <TwoFactorSetup />
        </TabsContent>
        
        <TabsContent value="sessions" className="space-y-6">
          <SessionManager
            inactivityTimeout={sessionSettings.inactivityTimeout}
            warningTimeout={sessionSettings.warningTimeout}
            onSettingsChange={handleSessionSettingsChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecuritySettings;