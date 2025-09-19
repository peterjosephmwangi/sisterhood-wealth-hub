-- Update handle_new_user to automatically complete member invitations
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  member_record public.members;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data ->> 'full_name'
  );
  
  -- Check if there's a member record for this email
  SELECT * INTO member_record
  FROM public.members
  WHERE email = new.email;
  
  -- If member record exists, assign member role
  IF FOUND THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'member')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN new;
END;
$function$;