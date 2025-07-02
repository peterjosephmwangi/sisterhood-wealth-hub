
-- Create audit_logs table to track all system activities
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to allow all operations (since this is for administrative purposes)
CREATE POLICY "Allow all operations on audit_logs" 
ON public.audit_logs 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create function to log activities
CREATE OR REPLACE FUNCTION public.log_activity(
  p_action VARCHAR(100),
  p_entity_type VARCHAR(50),
  p_entity_id UUID DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values,
    created_at
  ) VALUES (
    auth.uid(),
    p_action,
    p_entity_type,
    p_entity_id,
    p_old_values,
    p_new_values,
    now()
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Get recent activities with member names
CREATE OR REPLACE FUNCTION public.get_audit_trail(
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
) RETURNS TABLE (
  id UUID,
  action VARCHAR(100),
  entity_type VARCHAR(50),
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  user_name TEXT
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    al.id,
    al.action,
    al.entity_type,
    al.entity_id,
    al.old_values,
    al.new_values,
    al.created_at,
    COALESCE(m.name, 'System') as user_name
  FROM public.audit_logs al
  LEFT JOIN public.members m ON al.user_id::text = m.id::text
  ORDER BY al.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
$$;
