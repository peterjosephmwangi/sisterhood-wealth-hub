import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TwoFASettings {
  id: string;
  is_enabled: boolean;
  secret_key?: string;
  backup_codes?: string[];
  last_used_at?: string;
}

export const use2FA = () => {
  const [settings, setSettings] = useState<TwoFASettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchSettings = async () => {
    if (!user) {
      setSettings(null);
      setLoading(false);
      return;
    }

    try {
      // For now, return null until migration is run
      setSettings(null);
    } catch (error) {
      console.error('Error fetching 2FA settings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch 2FA settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSecret = async () => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Return mock data until migration is run
      return {
        secret: 'MOCK_SECRET_KEY',
        qr_code_url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      };
    } catch (error) {
      console.error('Error generating 2FA secret:', error);
      toast({
        title: "Error",
        description: "Failed to generate 2FA secret",
        variant: "destructive",
      });
      throw error;
    }
  };

  const enable2FA = async (totpCode: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Mock implementation until migration is run
      await fetchSettings();
      
      toast({
        title: "Info",
        description: "2FA setup will be available after database migration",
      });

      return { backup_codes: [] };
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      toast({
        title: "Error",
        description: "Failed to enable 2FA. Please check your code and try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const disable2FA = async () => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Mock implementation until migration is run
      await fetchSettings();
      
      toast({
        title: "Info",
        description: "2FA management will be available after database migration",
      });
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      toast({
        title: "Error",
        description: "Failed to disable 2FA",
        variant: "destructive",
      });
      throw error;
    }
  };

  const verify2FA = async (totpCode: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Mock implementation until migration is run
      return true;
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      throw error;
    }
  };

  const regenerateBackupCodes = async () => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Mock implementation until migration is run
      await fetchSettings();
      
      toast({
        title: "Info",
        description: "Backup code regeneration will be available after database migration",
      });

      return [];
    } catch (error) {
      console.error('Error regenerating backup codes:', error);
      toast({
        title: "Error",
        description: "Failed to regenerate backup codes",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [user]);

  return {
    settings,
    loading,
    generateSecret,
    enable2FA,
    disable2FA,
    verify2FA,
    regenerateBackupCodes,
    refetch: fetchSettings,
  };
};