import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Shield, Clock, User } from 'lucide-react';
import TwoFactorSetup from '@/components/auth/TwoFactorSetup';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import SessionTimeoutDialog from '@/components/auth/SessionTimeoutDialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const Settings: React.FC = () => {
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState(30);
  const [warningMinutes, setWarningMinutes] = useState(5);
  const [showTimeoutDialog, setShowTimeoutDialog] = useState(false);
  const [autoLogoutEnabled, setAutoLogoutEnabled] = useState(true);

  const { extendSession } = useSessionTimeout({
    timeoutMinutes: autoLogoutEnabled ? sessionTimeoutMinutes : 0,
    warningMinutes,
    onWarning: () => setShowTimeoutDialog(true),
    onTimeout: () => setShowTimeoutDialog(false),
  });

  const handleExtendSession = () => {
    extendSession();
    setShowTimeoutDialog(false);
  };

  const handleLogout = () => {
    setShowTimeoutDialog(false);
    // Logout is handled by the session timeout hook
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account security and preferences
          </p>
        </div>

        <Tabs defaultValue="security" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="session" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Session
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Configure security features to protect your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TwoFactorSetup />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="session" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Session Management</CardTitle>
                <CardDescription>
                  Control how long you stay logged in and when you're automatically signed out
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-logout">Automatic Logout</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically sign out after a period of inactivity
                    </p>
                  </div>
                  <Switch
                    id="auto-logout"
                    checked={autoLogoutEnabled}
                    onCheckedChange={setAutoLogoutEnabled}
                  />
                </div>

                {autoLogoutEnabled && (
                  <>
                    <Separator />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="session-timeout">Session Timeout</Label>
                        <Select 
                          value={sessionTimeoutMinutes.toString()} 
                          onValueChange={(value) => setSessionTimeoutMinutes(parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="60">1 hour</SelectItem>
                            <SelectItem value="120">2 hours</SelectItem>
                            <SelectItem value="240">4 hours</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          How long to wait before automatic logout
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="warning-time">Warning Time</Label>
                        <Select 
                          value={warningMinutes.toString()} 
                          onValueChange={(value) => setWarningMinutes(parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 minute</SelectItem>
                            <SelectItem value="2">2 minutes</SelectItem>
                            <SelectItem value="5">5 minutes</SelectItem>
                            <SelectItem value="10">10 minutes</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          When to show the warning before logout
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="text-sm font-medium mb-2">Current Settings</h4>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>• You will be warned {warningMinutes} minutes before logout</p>
                        <p>• Automatic logout after {sessionTimeoutMinutes} minutes of inactivity</p>
                        <p>• Activity is tracked from mouse movement, clicks, and keyboard input</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  Manage your personal information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Profile settings coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <SessionTimeoutDialog
        open={showTimeoutDialog}
        onExtend={handleExtendSession}
        onLogout={handleLogout}
        warningMinutes={warningMinutes}
      />
    </div>
  );
};

export default Settings;