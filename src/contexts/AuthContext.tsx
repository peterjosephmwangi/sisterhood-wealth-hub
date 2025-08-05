
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string, totpCode?: string) => Promise<{ error: any; requires2FA?: boolean }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string, totpCode?: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      // Check if user has 2FA enabled
      const { data: userSettings } = await supabase
        .from('user_2fa_settings')
        .select('*')
        .eq('user_id', data.user.id)
        .eq('is_enabled', true)
        .single();

      if (userSettings && !totpCode) {
        // 2FA is enabled but no code provided
        return { error: null, requires2FA: true };
      }

      if (userSettings && totpCode) {
        // Verify TOTP code
        const { authenticator } = await import('otplib');
        
        if (!userSettings.totp_secret) {
          toast({
            title: "Error",
            description: "2FA not properly configured",
            variant: "destructive",
          });
          return { error: new Error("2FA not configured") };
        }

        const isValid = authenticator.verify({
          token: totpCode,
          secret: userSettings.totp_secret
        });

        if (!isValid) {
          // Check backup codes
          const { data: isBackupValid } = await supabase
            .rpc('verify_backup_code', {
              p_user_id: data.user.id,
              p_code: totpCode.toUpperCase(),
            });

          if (!isBackupValid) {
            toast({
              title: "Error",
              description: "Invalid 2FA code",
              variant: "destructive",
            });
            return { error: new Error("Invalid 2FA code") };
          }
        }

        // Log successful 2FA attempt
        await supabase
          .from('user_2fa_attempts')
          .insert({
            user_id: data.user.id,
            attempt_type: totpCode.length === 6 ? 'totp' : 'backup',
            success: true,
          });
      }
      
      return { error: null };
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName || '',
          },
        },
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Check your email for the confirmation link",
        });
      }
      
      return { error };
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
