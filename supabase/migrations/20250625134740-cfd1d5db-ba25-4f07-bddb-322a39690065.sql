
-- Create a table to store monthly contribution targets
CREATE TABLE public.contribution_targets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  target_amount NUMERIC NOT NULL,
  target_month DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(target_month)
);

-- Insert a default target for the current month
INSERT INTO public.contribution_targets (target_amount, target_month)
VALUES (120000, DATE_TRUNC('month', CURRENT_DATE)::DATE)
ON CONFLICT (target_month) DO NOTHING;

-- Create a function to get the current month's target
CREATE OR REPLACE FUNCTION public.get_monthly_target(target_month DATE DEFAULT CURRENT_DATE)
RETURNS NUMERIC
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    (SELECT target_amount FROM public.contribution_targets 
     WHERE DATE_TRUNC('month', target_month) = DATE_TRUNC('month', contribution_targets.target_month)
     LIMIT 1),
    120000 -- Default fallback
  );
$$;

-- Create a function to set or update monthly target
CREATE OR REPLACE FUNCTION public.set_monthly_target(
  target_month DATE,
  target_amount NUMERIC
)
RETURNS VOID
LANGUAGE sql
AS $$
  INSERT INTO public.contribution_targets (target_month, target_amount, updated_at)
  VALUES (DATE_TRUNC('month', target_month)::DATE, target_amount, now())
  ON CONFLICT (target_month) 
  DO UPDATE SET 
    target_amount = EXCLUDED.target_amount,
    updated_at = now();
$$;
