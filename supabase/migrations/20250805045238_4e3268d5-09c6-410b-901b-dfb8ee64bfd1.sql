-- Create 2FA settings table
CREATE TABLE public.user_2fa_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  backup_codes TEXT[],
  totp_secret TEXT,
  phone_number TEXT,
  sms_enabled BOOLEAN NOT NULL DEFAULT false,
  totp_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create 2FA verification attempts table
CREATE TABLE public.user_2fa_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  attempt_type TEXT NOT NULL, -- 'totp', 'sms', 'backup'
  success BOOLEAN NOT NULL DEFAULT false,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on 2FA tables
ALTER TABLE public.user_2fa_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_2fa_attempts ENABLE ROW LEVEL SECURITY;

-- Create policies for 2FA settings
CREATE POLICY "Users can view their own 2FA settings" 
ON public.user_2fa_settings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own 2FA settings" 
ON public.user_2fa_settings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own 2FA settings" 
ON public.user_2fa_settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policies for 2FA attempts (read-only for users, full access for admins)
CREATE POLICY "Users can view their own 2FA attempts" 
ON public.user_2fa_attempts 
FOR SELECT 
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert 2FA attempts" 
ON public.user_2fa_attempts 
FOR INSERT 
WITH CHECK (true);

-- Create trigger for updating timestamps
CREATE TRIGGER update_user_2fa_settings_updated_at
BEFORE UPDATE ON public.user_2fa_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to generate backup codes
CREATE OR REPLACE FUNCTION public.generate_backup_codes()
RETURNS TEXT[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  codes TEXT[] := '{}';
  i INTEGER;
  code TEXT;
BEGIN
  FOR i IN 1..8 LOOP
    code := UPPER(SUBSTRING(gen_random_uuid()::text FROM 1 FOR 8));
    codes := array_append(codes, code);
  END LOOP;
  RETURN codes;
END;
$$;

-- Create function to verify backup code
CREATE OR REPLACE FUNCTION public.verify_backup_code(p_user_id UUID, p_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_codes TEXT[];
  updated_codes TEXT[];
BEGIN
  -- Get current backup codes
  SELECT backup_codes INTO current_codes
  FROM public.user_2fa_settings
  WHERE user_id = p_user_id AND is_enabled = true;
  
  -- Check if code exists
  IF p_code = ANY(current_codes) THEN
    -- Remove used code from array
    SELECT array_agg(code) INTO updated_codes
    FROM unnest(current_codes) AS code
    WHERE code != p_code;
    
    -- Update the backup codes
    UPDATE public.user_2fa_settings
    SET backup_codes = updated_codes,
        updated_at = now()
    WHERE user_id = p_user_id;
    
    -- Log successful attempt
    INSERT INTO public.user_2fa_attempts (user_id, attempt_type, success)
    VALUES (p_user_id, 'backup', true);
    
    RETURN true;
  ELSE
    -- Log failed attempt
    INSERT INTO public.user_2fa_attempts (user_id, attempt_type, success)
    VALUES (p_user_id, 'backup', false);
    
    RETURN false;
  END IF;
END;
$$;