import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Copy, Eye, EyeOff, Shield, ShieldCheck, RefreshCw } from 'lucide-react';
import { use2FA } from '@/hooks/use2FA';
import { useToast } from '@/hooks/use-toast';

const TwoFactorSetup: React.FC = () => {
  const [totpCode, setTotpCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { settings, loading, generateSecret, generateQRCodeURL, verifyTOTP, enable2FA, disable2FA, regenerateBackupCodes } = use2FA();
  const { toast } = useToast();

  const handleGenerateSecret = () => {
    setIsGenerating(true);
    try {
      const secret = generateSecret();
      setSecretKey(secret);
      const userEmail = JSON.parse(localStorage.getItem('sb-' + 'gyffqhutawzplmcdbnvq' + '-auth-token') || '{}')?.user?.email || 'user@example.com';
      const qrUrl = generateQRCodeURL(secret, userEmail);
      setQrCodeUrl(qrUrl);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate secret",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEnable2FA = async () => {
    if (!totpCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter the 6-digit code from your authenticator app",
        variant: "destructive",
      });
      return;
    }

    // Verify the TOTP code first
    if (!verifyTOTP(totpCode, secretKey)) {
      toast({
        title: "Error",
        description: "Invalid verification code. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsEnabling(true);
    try {
      await enable2FA('totp', secretKey);
      setTotpCode('');
      setSecretKey('');
      setQrCodeUrl('');
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsEnabling(false);
    }
  };

  const handleDisable2FA = async () => {
    setIsDisabling(true);
    try {
      await disable2FA();
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsDisabling(false);
    }
  };

  const handleRegenerateBackupCodes = async () => {
    try {
      await regenerateBackupCodes();
    } catch (error) {
      // Error handled in hook
    }
  };

  const copyToClipboard = async (text: string, description: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied",
        description: `${description} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading 2FA settings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            {settings?.is_enabled ? (
              <ShieldCheck className="h-5 w-5 text-green-600" />
            ) : (
              <Shield className="h-5 w-5 text-gray-400" />
            )}
            <CardTitle>Two-Factor Authentication</CardTitle>
          </div>
          <CardDescription>
            Add an extra layer of security to your account by enabling two-factor authentication.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {settings?.is_enabled ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Enabled
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Two-factor authentication is active on your account
                </span>
              </div>
              
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Your account is protected with two-factor authentication. You'll need to enter a code from your authenticator app when signing in.
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleDisable2FA} disabled={isDisabling}>
                  {isDisabling ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                  Disable 2FA
                </Button>
                <Button variant="outline" onClick={handleRegenerateBackupCodes}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate Backup Codes
                </Button>
              </div>

              {settings.backup_codes && settings.backup_codes.length > 0 && (
                <div className="space-y-3">
                  <Separator />
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Backup Codes</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowBackupCodes(!showBackupCodes)}
                    >
                      {showBackupCodes ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      {showBackupCodes ? 'Hide' : 'Show'}
                    </Button>
                  </div>
                  
                  {showBackupCodes && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-3">
                        Store these backup codes in a safe place. Each code can only be used once.
                      </p>
                      <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                        {settings.backup_codes.map((code, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-background rounded border">
                            <span>{code}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(code, 'Backup code')}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Two-factor authentication is not enabled. Enable it to add an extra layer of security to your account.
                </AlertDescription>
              </Alert>

              {!secretKey ? (
                <Button onClick={handleGenerateSecret} disabled={isGenerating}>
                  {isGenerating ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                  Set Up 2FA
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Step 1: Scan QR Code</h4>
                    <p className="text-sm text-muted-foreground">
                      Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                    </p>
                    {qrCodeUrl && (
                      <div className="flex justify-center p-4 bg-white rounded-lg border">
                        <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Step 2: Manual Entry (Alternative)</h4>
                    <p className="text-sm text-muted-foreground">
                      If you can't scan the QR code, enter this secret key manually:
                    </p>
                    <div className="flex items-center gap-2">
                      <Input
                        value={showSecret ? secretKey : secretKey.replace(/./g, '*')}
                        readOnly
                        className="font-mono"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSecret(!showSecret)}
                      >
                        {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(secretKey, 'Secret key')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Step 3: Verify Setup</h4>
                    <p className="text-sm text-muted-foreground">
                      Enter the 6-digit code from your authenticator app to complete setup:
                    </p>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Label htmlFor="totp-code">Verification Code</Label>
                        <Input
                          id="totp-code"
                          value={totpCode}
                          onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="123456"
                          maxLength={6}
                          className="font-mono text-center"
                        />
                      </div>
                    </div>
                    <Button onClick={handleEnable2FA} disabled={isEnabling || totpCode.length !== 6}>
                      {isEnabling ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                      Enable 2FA
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TwoFactorSetup;