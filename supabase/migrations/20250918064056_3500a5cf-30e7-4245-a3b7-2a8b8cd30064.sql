-- Create a function to verify invitation tokens publicly
CREATE OR REPLACE FUNCTION public.verify_invitation_token(invitation_token_param uuid)
RETURNS TABLE (
  is_valid boolean,
  invitation_data jsonb
) AS $$
DECLARE
  invitation_record record;
BEGIN
  -- Check if invitation exists, is pending, and not expired
  SELECT * INTO invitation_record
  FROM member_invitations
  WHERE invitation_token = invitation_token_param
    AND status = 'pending'
    AND expires_at > now();
  
  IF invitation_record IS NULL THEN
    RETURN QUERY SELECT false, null::jsonb;
  ELSE
    RETURN QUERY SELECT 
      true,
      jsonb_build_object(
        'id', invitation_record.id,
        'email', invitation_record.email,
        'member_data', invitation_record.member_data,
        'expires_at', invitation_record.expires_at
      );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;