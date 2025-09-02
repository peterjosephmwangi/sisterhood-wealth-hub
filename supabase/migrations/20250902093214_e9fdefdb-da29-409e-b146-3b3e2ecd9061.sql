-- Fix RLS policy for member_invitations to use the has_role function
DROP POLICY IF EXISTS "Admins can manage all invitations" ON public.member_invitations;

-- Create proper RLS policies for member_invitations
CREATE POLICY "Admins can view invitations" 
ON public.member_invitations 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert invitations" 
ON public.member_invitations 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update invitations" 
ON public.member_invitations 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete invitations" 
ON public.member_invitations 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));