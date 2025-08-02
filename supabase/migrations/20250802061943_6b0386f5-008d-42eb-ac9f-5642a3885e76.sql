
-- Create member invitations table
CREATE TABLE public.member_invitations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  invited_by uuid REFERENCES auth.users(id) NOT NULL,
  invitation_token uuid NOT NULL DEFAULT gen_random_uuid(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '7 days'),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  member_data jsonb NOT NULL, -- Will store name, phone, and other member details
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(email, status) -- Prevent duplicate pending invitations for same email
);

-- Enable RLS
ALTER TABLE public.member_invitations ENABLE ROW LEVEL SECURITY;

-- RLS policies for member invitations
CREATE POLICY "Admins can manage all invitations" 
  ON public.member_invitations 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Function to create user profile and member record from invitation
CREATE OR REPLACE FUNCTION public.accept_member_invitation(
  invitation_token uuid,
  user_password text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invitation_record public.member_invitations;
  new_user_id uuid;
  new_member_id uuid;
  result json;
BEGIN
  -- Get the invitation
  SELECT * INTO invitation_record
  FROM public.member_invitations
  WHERE invitation_token = accept_member_invitation.invitation_token
    AND status = 'pending'
    AND expires_at > now();
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or expired invitation');
  END IF;
  
  -- Create the user account
  INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, raw_user_meta_data)
  VALUES (
    invitation_record.email,
    crypt(user_password, gen_salt('bf')),
    now(),
    json_build_object('full_name', invitation_record.member_data->>'name')
  )
  RETURNING id INTO new_user_id;
  
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new_user_id,
    invitation_record.email,
    invitation_record.member_data->>'name'
  );
  
  -- Create member record
  INSERT INTO public.members (name, phone, email)
  VALUES (
    invitation_record.member_data->>'name',
    invitation_record.member_data->>'phone',
    invitation_record.email
  )
  RETURNING id INTO new_member_id;
  
  -- Assign member role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new_user_id, 'member');
  
  -- Mark invitation as accepted
  UPDATE public.member_invitations
  SET status = 'accepted', updated_at = now()
  WHERE id = invitation_record.id;
  
  RETURN json_build_object(
    'success', true, 
    'user_id', new_user_id,
    'member_id', new_member_id
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Function to expire old invitations
CREATE OR REPLACE FUNCTION public.expire_old_invitations()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.member_invitations
  SET status = 'expired', updated_at = now()
  WHERE status = 'pending' AND expires_at <= now();
$$;

-- Update the handle_new_user function to prevent auto-role assignment
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Only create profile, don't auto-assign member role
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data ->> 'full_name'
  );
  RETURN new;
END;
$$;

-- Add function to get current user roles for better security
CREATE OR REPLACE FUNCTION public.get_current_user_roles()
RETURNS app_role[]
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT ARRAY(
    SELECT role 
    FROM public.user_roles 
    WHERE user_id = auth.uid()
  );
$$;
