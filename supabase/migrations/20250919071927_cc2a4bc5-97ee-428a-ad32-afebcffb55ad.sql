-- Update accept_member_invitation to work with Supabase Auth properly
-- This function will only verify the token and prepare data, letting the client handle user creation
CREATE OR REPLACE FUNCTION public.accept_member_invitation(invitation_token uuid, user_password text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  invitation_record public.member_invitations;
  new_member_id uuid;
BEGIN
  -- Get the invitation
  SELECT * INTO invitation_record
  FROM public.member_invitations
  WHERE public.member_invitations.invitation_token = accept_member_invitation.invitation_token
    AND status = 'pending'
    AND expires_at > now();
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or expired invitation');
  END IF;
  
  -- Create member record first
  INSERT INTO public.members (name, phone, email)
  VALUES (
    invitation_record.member_data->>'name',
    invitation_record.member_data->>'phone',
    invitation_record.email
  )
  RETURNING id INTO new_member_id;
  
  -- Mark invitation as accepted
  UPDATE public.member_invitations
  SET status = 'accepted', updated_at = now()
  WHERE id = invitation_record.id;
  
  RETURN json_build_object(
    'success', true, 
    'member_id', new_member_id,
    'email', invitation_record.email,
    'full_name', invitation_record.member_data->>'name'
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$function$

-- Create a function to complete the invitation after user signup
CREATE OR REPLACE FUNCTION public.complete_member_invitation(member_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  member_record public.members;
BEGIN
  -- Get the member record by email
  SELECT * INTO member_record
  FROM public.members
  WHERE email = member_email;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Member not found');
  END IF;
  
  -- Create profile for the user
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    auth.uid(),
    member_record.email,
    member_record.name
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;
  
  -- Assign member role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (auth.uid(), 'member')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN json_build_object(
    'success', true,
    'member_id', member_record.id
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$function$