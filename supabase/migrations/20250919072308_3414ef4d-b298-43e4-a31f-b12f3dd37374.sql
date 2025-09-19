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
$function$;