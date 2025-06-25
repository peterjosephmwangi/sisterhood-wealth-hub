
-- Create a view to track interest profits from loans
CREATE OR REPLACE VIEW public.loan_interest_profits AS
SELECT 
  l.id as loan_id,
  l.member_id,
  m.name as member_name,
  l.amount as principal_amount,
  l.interest_rate,
  l.amount * l.interest_rate / 100 as total_interest_expected,
  COALESCE(lr.total_repaid, 0) as total_repaid,
  CASE 
    WHEN COALESCE(lr.total_repaid, 0) >= l.amount THEN
      LEAST(
        COALESCE(lr.total_repaid, 0) - l.amount, 
        l.amount * l.interest_rate / 100
      )
    ELSE 0
  END as interest_profit_earned,
  l.status,
  l.loan_date,
  l.due_date
FROM public.loans l
JOIN public.members m ON l.member_id = m.id
LEFT JOIN (
  SELECT 
    loan_id,
    SUM(amount) as total_repaid
  FROM public.loan_repayments
  GROUP BY loan_id
) lr ON l.id = lr.loan_id
WHERE l.status IN ('approved', 'active', 'overdue', 'repaid');

-- Create a function to get total interest profit earned
CREATE OR REPLACE FUNCTION public.get_total_interest_profit()
RETURNS numeric
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(SUM(interest_profit_earned), 0)
  FROM public.loan_interest_profits;
$$;

-- Create a function to get interest profit by member
CREATE OR REPLACE FUNCTION public.get_member_interest_profit(member_uuid uuid)
RETURNS TABLE(
  loan_id uuid,
  principal_amount numeric,
  interest_rate numeric,
  total_interest_expected numeric,
  interest_profit_earned numeric,
  loan_date date,
  due_date date,
  status text
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    loan_id,
    principal_amount,
    interest_rate,
    total_interest_expected,
    interest_profit_earned,
    loan_date,
    due_date,
    status
  FROM public.loan_interest_profits
  WHERE member_id = member_uuid
  ORDER BY loan_date DESC;
$$;
