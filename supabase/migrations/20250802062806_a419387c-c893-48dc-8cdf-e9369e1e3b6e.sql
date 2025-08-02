
-- Insert the admin user into auth.users table
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  role,
  aud,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'mnkym9n@gmail.com',
  crypt('*modcom2025#', gen_salt('bf')),
  now(),
  '{"full_name": "System Admin"}',
  'authenticated',
  'authenticated',
  now(),
  now()
);

-- Get the user ID for the profile and role assignment
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
