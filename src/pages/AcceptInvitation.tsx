
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AcceptInvitation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [invitationValid, setInvitationValid] = useState(false);
  const [invitationData, setInvitationData] = useState<any>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const invitationToken = searchParams.get('token');

  useEffect(() => {
    if (invitationToken) {
      verifyInvitation();
    } else {
      setVerifying(false);
    }
  }, [invitationToken]);

  const verifyInvitation = async () => {
    try {
      setVerifying(true);
      console.log('Verifying invitation with token:', invitationToken);
      
      const { data, error } = await supabase
        .rpc('verify_invitation_token', { 
          invitation_token_param: invitationToken 
        });

      console.log('Invitation verification result:', { data, error });

      if (error || !data || data.length === 0) {
        console.log('Invitation validation failed:', error);
        setInvitationValid(false);
      } else {
        const result = data[0];
        console.log('Invitation verification response:', result);
        
        if (result.is_valid) {
          console.log('Invitation is valid:', result.invitation_data);
          setInvitationValid(true);
          setInvitationData(result.invitation_data);
        } else {
          console.log('Invitation is not valid');
          setInvitationValid(false);
        }
      }
    } catch (error) {
      console.error('Error verifying invitation:', error);
      setInvitationValid(false);
    } finally {
      setVerifying(false);
    }
  };

  const handleAcceptInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Step 1: Accept the invitation and create member record
      const { data: invitationResult, error: invitationError } = await supabase.rpc('accept_member_invitation', {
        invitation_token: invitationToken,
        user_password: password
      });

      if (invitationError) throw invitationError;
      
      const result = invitationResult as any;
      
      if (!result.success) {
        throw new Error(result.error);
      }

      // Step 2: Create auth user using Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: result.email,
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: result.full_name
          }
        }
      });

      if (authError) throw authError;

      // Step 3: Complete the invitation process (create profile and assign role)
      if (authData.user) {
        const { error: completeError } = await supabase.rpc('complete_member_invitation', {
          member_email: result.email
        });

        if (completeError) {
          console.error('Error completing invitation:', completeError);
          // Don't throw here as the user is created, just log the error
        }
      }

      toast({
        title: "Welcome!",
        description: "Your account has been created successfully. You can now sign in.",
      });

      navigate('/auth');
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-pink-500 mb-4" />
            <p className="text-muted-foreground">Verifying invitation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitationValid || !invitationToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Invalid Invitation
            </CardTitle>
            <CardDescription>
              This invitation link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/auth')} 
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
            >
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-3 rounded-full">
              <Heart className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Welcome to Sisterhood Wealth Hub
          </CardTitle>
          <CardDescription>
            You've been invited to join as {invitationData?.member_data?.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAcceptInvitation} className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">Invitation Details</p>
                  <p className="text-sm text-green-700">
                    Email: {invitationData?.email}
                  </p>
                  <p className="text-sm text-green-700">
                    Phone: {invitationData?.member_data?.phone}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Create Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                minLength={6}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                minLength={6}
              />
            </div>
            
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Accept Invitation & Create Account'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcceptInvitation;
