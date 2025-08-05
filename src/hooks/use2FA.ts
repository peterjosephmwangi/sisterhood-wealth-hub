import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { authenticator } from 'otplib';

interface TwoFASettings {
  id?: string;
  user_id: string;
  is_enabled: boolean;
  backup_codes: string[];
  totp_secret: string | null;
  phone_number: string | null;
  sms_enabled: boolean;
  totp_enabled: boolean;
}

export const use2FA = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<TwoFASettings | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch2FASettings = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_2fa_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setSettings(data || {
        user_id: user.id,
        is_enabled: false,
        backup_codes: [],
        totp_secret: null,
        phone_number: null,
        sms_enabled: false,
        totp_enabled: false,
      });
    } catch (error: any) {
      console.error('Error fetching 2FA settings:', error);
      toast({
        title: "Error",
        description: "Failed to load 2FA settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const enable2FA = async (method: 'totp' | 'sms', data: any) => {
    if (!user?.id) return false;

    try {
      setLoading(true);
      
      // Generate backup codes
      const { data: backupCodes, error: codesError } = await supabase
        .rpc('generate_backup_codes');

      if (codesError) throw codesError;

      const updateData = {
        user_id: user.id,
        is_enabled: true,
        backup_codes: backupCodes,
        [method === 'totp' ? 'totp_enabled' : 'sms_enabled']: true,
        [method === 'totp' ? 'totp_secret' : 'phone_number']: data,
      };

      const { error } = await supabase
        .from('user_2fa_settings')
        .upsert(updateData);

      if (error) throw error;

      await fetch2FASettings();
      
      toast({
        title: "2FA Enabled",
        description: `Two-factor authentication via ${method.toUpperCase()} has been enabled.`,
      });

      return true;
    } catch (error: any) {
      console.error('Error enabling 2FA:', error);
      toast({
        title: "Error",
        description: "Failed to enable 2FA",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async () => {
    if (!user?.id) return false;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('user_2fa_settings')
        .update({
          is_enabled: false,
          totp_enabled: false,
          sms_enabled: false,
          totp_secret: null,
          phone_number: null,
          backup_codes: [],
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await fetch2FASettings();
      
      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled.",
      });

      return true;
    } catch (error: any) {
      console.error('Error disabling 2FA:', error);
      toast({
        title: "Error",
        description: "Failed to disable 2FA",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const verifyBackupCode = async (code: string) => {
    if (!user?.id) return false;

    try {
      const { data, error } = await supabase
        .rpc('verify_backup_code', {
          p_user_id: user.id,
          p_code: code.toUpperCase(),
        });

      if (error) throw error;

      return data;
    } catch (error: any) {
      console.error('Error verifying backup code:', error);
      return false;
    }
  };

  const generateSecret = () => {
    return authenticator.generateSecret();
  };

  const generateQRCodeURL = (secret: string, userEmail: string) => {
    return authenticator.keyuri(userEmail, 'Sisterhood Wealth Hub', secret);
  };

  const verifyTOTP = (token: string, secret: string) => {
    try {
      return authenticator.verify({ token, secret });
    } catch (error) {
      return false;
    }
  };

  const regenerateBackupCodes = async () => {
    if (!user?.id || !settings?.is_enabled) return false;

    try {
      setLoading(true);
      
      const { data: backupCodes, error: codesError } = await supabase
        .rpc('generate_backup_codes');

      if (codesError) throw codesError;

      const { error } = await supabase
        .from('user_2fa_settings')
        .update({ backup_codes: backupCodes })
        .eq('user_id', user.id);

      if (error) throw error;

      await fetch2FASettings();
      
      toast({
        title: "Backup Codes Regenerated",
        description: "New backup codes have been generated. Save them securely.",
      });

      return true;
    } catch (error: any) {
      console.error('Error regenerating backup codes:', error);
      toast({
        title: "Error",
        description: "Failed to regenerate backup codes",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetch2FASettings();
    }
  }, [user]);

  return {
    settings,
    loading,
    enable2FA,
    disable2FA,
    verifyBackupCode,
    generateSecret,
    generateQRCodeURL,
    verifyTOTP,
    regenerateBackupCodes,
    refetch: fetch2FASettings,
  };
};