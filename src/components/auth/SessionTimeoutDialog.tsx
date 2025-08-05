import React, { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';

interface SessionTimeoutDialogProps {
  open: boolean;
  onExtend: () => void;
  onLogout: () => void;
  warningMinutes?: number;
}

const SessionTimeoutDialog: React.FC<SessionTimeoutDialogProps> = ({
  open,
  onExtend,
  onLogout,
  warningMinutes = 5
}) => {
  const [timeLeft, setTimeLeft] = useState(warningMinutes * 60);
  const totalWarningTime = warningMinutes * 60;

  useEffect(() => {
    if (!open) {
      setTimeLeft(totalWarningTime);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [open, onLogout, totalWarningTime]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressValue = ((totalWarningTime - timeLeft) / totalWarningTime) * 100;

  const formatTime = (mins: number, secs: number) => {
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Session Expiring Soon</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>
              Your session will expire in <strong>{formatTime(minutes, seconds)}</strong> due to inactivity.
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Time remaining:</span>
                <span className="font-mono">{formatTime(minutes, seconds)}</span>
              </div>
              <Progress value={progressValue} className="h-2" />
            </div>
            <p className="text-sm text-muted-foreground">
              Click "Stay Logged In" to extend your session, or "Logout" to sign out now.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onLogout}>
            Logout
          </AlertDialogCancel>
          <AlertDialogAction onClick={onExtend}>
            Stay Logged In
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SessionTimeoutDialog;