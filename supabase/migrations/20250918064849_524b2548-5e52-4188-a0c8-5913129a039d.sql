-- Fix ambiguous column reference in accept_member_invitation function
CREATE OR REPLACE FUNCTION public.accept_member_invitation(invitation_token uuid, user_password text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  invitation_record public.member_invitations;
  new_user_id uuid;
  new_member_id uuid;
  result json;
BEGIN
  -- Get the invitation (fix ambiguous column reference)
  SELECT * INTO invitation_record
  FROM public.member_invitations
  WHERE public.member_invitations.invitation_token = accept_member_invitation.invitation_token
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
$function$