
-- Create a function to get total contributions for dashboard
CREATE OR REPLACE FUNCTION public.get_total_contributions()
RETURNS numeric
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(SUM(amount), 0)
  FROM public.contributions 
  WHERE status = 'confirmed';
$$;

-- Create a function to get active members count
CREATE OR REPLACE FUNCTION public.get_active_members_count()
RETURNS integer
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*)::integer
  FROM public.members 
  WHERE status = 'active';
$$;

-- Create a function to get available loan fund (total contributions minus active loans)
CREATE OR REPLACE FUNCTION public.get_available_loan_fund()
RETURNS numeric
LANGUAGE sql
STABLE
AS $$
  SELECT GREATEST(
    COALESCE((SELECT SUM(amount) FROM public.contributions WHERE status = 'confirmed'), 0) - 
    COALESCE((SELECT SUM(amount) FROM public.loans WHERE status IN ('approved', 'active')), 0),
    0
  );
$$;

-- Create a function to get recent activities
CREATE OR REPLACE FUNCTION public.get_recent_activities()
RETURNS TABLE (
  member_name text,
  action text,
  amount numeric,
  created_at timestamp with time zone,
  activity_type text
)
LANGUAGE sql
STABLE
AS $$
  (
    SELECT 
      m.name as member_name,
      'Made contribution' as action,
      c.amount,
      c.created_at,
      'contribution' as activity_type
    FROM contributions c
    JOIN members m ON c.member_id = m.id
    WHERE c.status = 'confirmed'
    ORDER BY c.created_at DESC
    LIMIT 3
  )
  UNION ALL
  (
    SELECT 
      m.name as member_name,
      CASE 
        WHEN l.status = 'approved' THEN 'Loan approved'
        WHEN l.status = 'pending' THEN 'Loan requested'
        ELSE 'Loan updated'
      END as action,
      l.amount,
      l.created_at,
      'loan' as activity_type
    FROM loans l
    JOIN members m ON l.member_id = m.id
    ORDER BY l.created_at DESC
    LIMIT 2
  )
  ORDER BY created_at DESC
  LIMIT 4;
$$;

-- Update loans table status values to be more specific
ALTER TABLE public.loans 
DROP CONSTRAINT IF EXISTS loans_status_check;

ALTER TABLE public.loans 
ADD CONSTRAINT loans_status_check 
CHECK (status IN ('pending', 'approved', 'active', 'repaid', 'rejected', 'overdue'));
