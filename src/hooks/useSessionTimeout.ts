import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UseSessionTimeoutOptions {
  timeoutMinutes?: number;
  warningMinutes?: number;
  onWarning?: () => void;
  onTimeout?: () => void;
}

export const useSessionTimeout = ({
  timeoutMinutes = 30,
  warningMinutes = 5,
  onWarning,
  onTimeout
}: UseSessionTimeoutOptions = {}) => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  
  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningRef = useRef<NodeJS.Timeout>();
  const lastActivityRef = useRef<number>(Date.now());

  const resetTimeout = useCallback(() => {
    if (!user) return;

    // Clear existing timeouts
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);

    const now = Date.now();
    lastActivityRef.current = now;

    // Set warning timeout
    const warningTime = (timeoutMinutes - warningMinutes) * 60 * 1000;
    warningRef.current = setTimeout(() => {
      onWarning?.();
      toast({
        title: "Session Warning",
        description: `Your session will expire in ${warningMinutes} minutes due to inactivity.`,
        variant: "destructive",
      });
    }, warningTime);

    // Set logout timeout
    const logoutTime = timeoutMinutes * 60 * 1000;
    timeoutRef.current = setTimeout(async () => {
      onTimeout?.();
      toast({
        title: "Session Expired",
        description: "You have been logged out due to inactivity.",
        variant: "destructive",
      });
      await signOut();
    }, logoutTime);
  }, [user, timeoutMinutes, warningMinutes, onWarning, onTimeout, signOut, toast]);

  const extendSession = useCallback(() => {
    resetTimeout();
    toast({
      title: "Session Extended",
      description: "Your session has been extended.",
    });
  }, [resetTimeout, toast]);

  useEffect(() => {
    if (!user) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const resetTimer = () => {
      const now = Date.now();
      // Only reset if enough time has passed to avoid too frequent resets
      if (now - lastActivityRef.current > 60000) { // 1 minute threshold
        resetTimeout();
      }
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    // Initial setup
    resetTimeout();

    return () => {
      // Cleanup
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
    };
  }, [user, resetTimeout]);

  return {
    extendSession,
    lastActivity: lastActivityRef.current
  };
};