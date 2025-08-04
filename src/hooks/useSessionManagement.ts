import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseSessionManagementProps {
  inactivityTimeoutMinutes?: number;
  warningTimeoutMinutes?: number;
  enabled?: boolean;
}

export const useSessionManagement = ({
  inactivityTimeoutMinutes = 30,
  warningTimeoutMinutes = 5,
  enabled = true,
}: UseSessionManagementProps = {}) => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningTimeoutRef = useRef<NodeJS.Timeout>();
  const lastActivityRef = useRef<number>(Date.now());

  const resetInactivityTimer = useCallback(() => {
    if (!enabled || !user) return;

    lastActivityRef.current = Date.now();

    // Clear existing timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    // Set warning timer
    const warningTime = (inactivityTimeoutMinutes - warningTimeoutMinutes) * 60 * 1000;
    warningTimeoutRef.current = setTimeout(() => {
      toast({
        title: "Session Warning",
        description: `Your session will expire in ${warningTimeoutMinutes} minutes due to inactivity`,
        variant: "destructive",
      });
    }, warningTime);

    // Set logout timer
    const logoutTime = inactivityTimeoutMinutes * 60 * 1000;
    timeoutRef.current = setTimeout(async () => {
      toast({
        title: "Session Expired",
        description: "You have been logged out due to inactivity",
        variant: "destructive",
      });
      await signOut();
    }, logoutTime);
  }, [enabled, user, inactivityTimeoutMinutes, warningTimeoutMinutes, signOut, toast]);

  const handleActivity = useCallback(() => {
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  const extendSession = useCallback(async () => {
    if (!user) return;

    try {
      const { error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Error refreshing session:', error);
        return;
      }
      
      resetInactivityTimer();
      toast({
        title: "Session Extended",
        description: "Your session has been extended",
      });
    } catch (error) {
      console.error('Error extending session:', error);
    }
  }, [user, resetInactivityTimer, toast]);

  const getTimeUntilExpiry = useCallback(() => {
    if (!enabled || !user) return null;
    
    const timeElapsed = Date.now() - lastActivityRef.current;
    const timeRemaining = (inactivityTimeoutMinutes * 60 * 1000) - timeElapsed;
    
    return Math.max(0, timeRemaining);
  }, [enabled, user, inactivityTimeoutMinutes]);

  const getMinutesUntilExpiry = useCallback(() => {
    const timeRemaining = getTimeUntilExpiry();
    return timeRemaining ? Math.ceil(timeRemaining / (60 * 1000)) : null;
  }, [getTimeUntilExpiry]);

  useEffect(() => {
    if (!enabled || !user) {
      // Clear timers when disabled or user logs out
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      return;
    }

    // Start the timer
    resetInactivityTimer();

    // Activity event listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      // Cleanup
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [enabled, user, handleActivity, resetInactivityTimer]);

  return {
    extendSession,
    getTimeUntilExpiry,
    getMinutesUntilExpiry,
    resetTimer: resetInactivityTimer,
  };
};