import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, Shield, Activity } from 'lucide-react';
import { useSessionManagement } from '@/hooks/useSessionManagement';

interface SessionManagerProps {
  inactivityTimeout: number;
  warningTimeout: number;
  onSettingsChange: (inactivityTimeout: number, warningTimeout: number) => void;
}

const SessionManager: React.FC<SessionManagerProps> = ({
  inactivityTimeout,
  warningTimeout,
  onSettingsChange,
}) => {
  const [tempInactivityTimeout, setTempInactivityTimeout] = useState(inactivityTimeout);
  const [tempWarningTimeout, setTempWarningTimeout] = useState(warningTimeout);
  
  const { extendSession, getMinutesUntilExpiry } = useSessionManagement({
    inactivityTimeoutMinutes: inactivityTimeout,
    warningTimeoutMinutes: warningTimeout,
    enabled: true,
  });

  const minutesUntilExpiry = getMinutesUntilExpiry();

  const handleSaveSettings = () => {
    onSettingsChange(tempInactivityTimeout, tempWarningTimeout);
  };

  const handleExtendSession = () => {
    extendSession();
  };

  const timeoutOptions = [
    { value: 5, label: '5 minutes' },
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
    { value: 120, label: '2 hours' },
    { value: 240, label: '4 hours' },
  ];

  const warningOptions = [
    { value: 1, label: '1 minute' },
    { value: 2, label: '2 minutes' },
    { value: 5, label: '5 minutes' },
    { value: 10, label: '10 minutes' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <CardTitle>Session Management</CardTitle>
          </div>
          <CardDescription>
            Configure automatic logout settings and monitor your current session.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Session Status */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-600" />
              <h4 className="text-sm font-medium">Current Session</h4>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Active
              </Badge>
              {minutesUntilExpiry !== null && (
                <span className="text-sm text-muted-foreground">
                  Expires in {minutesUntilExpiry} minutes
                </span>
              )}
            </div>

            <Button variant="outline" onClick={handleExtendSession}>
              <Clock className="h-4 w-4 mr-2" />
              Extend Session
            </Button>
          </div>

          <div className="border-t pt-6 space-y-4">
            <h4 className="text-sm font-medium">Auto-logout Settings</h4>
            
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                You will be automatically logged out after a period of inactivity. A warning will be shown before logout.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="inactivity-timeout">Inactivity Timeout</Label>
                <Select
                  value={tempInactivityTimeout.toString()}
                  onValueChange={(value) => setTempInactivityTimeout(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeout" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeoutOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="warning-timeout">Warning Time</Label>
                <Select
                  value={tempWarningTimeout.toString()}
                  onValueChange={(value) => setTempWarningTimeout(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select warning time" />
                  </SelectTrigger>
                  <SelectContent>
                    {warningOptions
                      .filter(option => option.value < tempInactivityTimeout)
                      .map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              You will receive a warning {tempWarningTimeout} minutes before automatic logout, 
              which occurs after {tempInactivityTimeout} minutes of inactivity.
            </div>

            <Button 
              onClick={handleSaveSettings}
              disabled={
                tempInactivityTimeout === inactivityTimeout && 
                tempWarningTimeout === warningTimeout
              }
            >
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionManager;