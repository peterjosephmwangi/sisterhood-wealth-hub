-- Allow admins to view all profiles (needed for Role Management to join profiles with user_roles)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'profiles' 
      AND policyname = 'Admins can view all profiles'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Admins can view all profiles"
      ON public.profiles
      FOR SELECT
      USING (has_role(auth.uid(), 'admin'::app_role));
    $$;
  END IF;
END$$;