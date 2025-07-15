
-- Create function to get overdue loans
CREATE OR REPLACE FUNCTION public.get_overdue_loans()
RETURNS TABLE(
  loan_id uuid,
  member_id uuid,
  member_name text,
  member_phone text,
  loan_amount numeric,
  total_amount_due numeric,
  amount_repaid numeric,
  balance_due numeric,
  due_date date,
  days_overdue integer,
  interest_rate numeric
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    l.id as loan_id,
    l.member_id,
    m.name as member_name,
    m.phone as member_phone,
    l.amount as loan_amount,
    l.amount + (l.amount * l.interest_rate / 100) as total_amount_due,
    get_loan_total_repaid(l.id) as amount_repaid,
    get_loan_balance(l.id) as balance_due,
    l.due_date,
    (CURRENT_DATE - l.due_date)::integer as days_overdue,
    l.interest_rate
  FROM public.loans l
  JOIN public.members m ON l.member_id = m.id
  WHERE l.status IN ('approved', 'active')
    AND l.due_date < CURRENT_DATE
    AND get_loan_balance(l.id) > 0
  ORDER BY l.due_date ASC;
$$;

-- Create function to get members with no contributions this month
CREATE OR REPLACE FUNCTION public.get_members_missing_monthly_contributions()
RETURNS TABLE(
  member_id uuid,
  member_name text,
  member_phone text,
  member_email text,
  last_contribution_date date,
  last_contribution_amount numeric,
  days_since_last_contribution integer,
  total_contributions numeric
)
LANGUAGE sql
STABLE
AS $$
  WITH member_contributions AS (
    SELECT 
      m.id as member_id,
      m.name as member_name,
      m.phone as member_phone,
      m.email as member_email,
      MAX(c.contribution_date) as last_contribution_date,
      (SELECT amount FROM contributions 
       WHERE member_id = m.id AND contribution_date = MAX(c.contribution_date) 
       LIMIT 1) as last_contribution_amount,
      COALESCE(SUM(c.amount), 0) as total_contributions
    FROM public.members m
    LEFT JOIN public.contributions c ON m.id = c.member_id AND c.status = 'confirmed'
    WHERE m.status = 'active'
    GROUP BY m.id, m.name, m.phone, m.email
  ),
  current_month_contributions AS (
    SELECT 
      member_id,
      COUNT(*) as current_month_count
    FROM public.contributions
    WHERE DATE_TRUNC('month', contribution_date) = DATE_TRUNC('month', CURRENT_DATE)
      AND status = 'confirmed'
    GROUP BY member_id
  )
  SELECT 
    mc.member_id,
    mc.member_name,
    mc.member_phone,
    mc.member_email,
    mc.last_contribution_date,
    mc.last_contribution_amount,
    CASE 
      WHEN mc.last_contribution_date IS NULL THEN NULL
      ELSE (CURRENT_DATE - mc.last_contribution_date)::integer
    END as days_since_last_contribution,
    mc.total_contributions
  FROM member_contributions mc
  LEFT JOIN current_month_contributions cmc ON mc.member_id = cmc.member_id
  WHERE COALESCE(cmc.current_month_count, 0) = 0
  ORDER BY mc.last_contribution_date ASC NULLS FIRST;
$$;

-- Create function to get overdue payment summary for dashboard
CREATE OR REPLACE FUNCTION public.get_overdue_payments_summary()
RETURNS TABLE(
  overdue_loans_count integer,
  overdue_loans_total_amount numeric,
  members_missing_contributions_count integer,
  total_expected_monthly_target numeric,
  current_month_collected numeric,
  collection_percentage numeric
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    (SELECT COUNT(*)::integer FROM get_overdue_loans()) as overdue_loans_count,
    (SELECT COALESCE(SUM(balance_due), 0) FROM get_overdue_loans()) as overdue_loans_total_amount,
    (SELECT COUNT(*)::integer FROM get_members_missing_monthly_contributions()) as members_missing_contributions_count,
    get_monthly_target(CURRENT_DATE) as total_expected_monthly_target,
    get_monthly_contributions_total(CURRENT_DATE) as current_month_collected,
    CASE 
      WHEN get_monthly_target(CURRENT_DATE) > 0 
      THEN (get_monthly_contributions_total(CURRENT_DATE) / get_monthly_target(CURRENT_DATE) * 100)
      ELSE 0 
    END as collection_percentage;
$$;

-- Update loan status to overdue when due date passes
CREATE OR REPLACE FUNCTION public.update_overdue_loan_status()
RETURNS void
LANGUAGE sql
AS $$
  UPDATE public.loans 
  SET status = 'overdue', updated_at = now()
  WHERE status IN ('approved', 'active')
    AND due_date < CURRENT_DATE
    AND get_loan_balance(id) > 0;
$$;
