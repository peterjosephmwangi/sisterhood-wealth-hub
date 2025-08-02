
-- First, let's clean up the existing user and try a different approach
DELETE FROM auth.users WHERE email = 'mnkym9n@gmail.com';
DELETE FROM public.profiles WHERE email = 'mnkym9n@gmail.com';
DELETE FROM public.user_roles WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Create the admin user using Supabase's proper user creation approach
-- We'll insert the user with email_confirmed_at set to bypass email confirmation
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  email_change_confirm_status,
  raw_user_meta_data,
  role,
  aud,
  confirmation_token,
  recovery_token,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'mnkym9n@gmail.com',
  crypt('*modcom2025#', gen_salt('bf')),
  now(),
  0,
  '{"full_name": "System Admin"}',
  'authenticated',
  'authenticated',
  '',
  '',
  now(),
  now()
);

-- Create the identity record (required for auth)
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  created_at,
  updated_at
) 
SELECT 
  gen_random_uuid(),
  u.id,
  jsonb_build_object(
    'sub', u.id::text,
    'email', u.email,
    'email_verified', true
  ),
  'email',
  u.id::text,
  now(),
  now()
FROM auth.users u 
WHERE u.email = 'mnkym9n@gmail.com';

-- Now set up the profile and role
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Get the user ID
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = 'mnkym9n@gmail.com';

  -- Insert profile for the admin user
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (admin_user_id, 'mnkym9n@gmail.com', 'System Admin');

  -- Remove any existing admin roles to ensure this is the only admin
  DELETE FROM public.user_roles WHERE role = 'admin';

  -- Assign admin role to this user
  INSERT INTO public.user_roles (user_id, role)
  VALUES (admin_user_id, 'admin');
END $$;
