
-- Fix the get_available_loan_fund function to account for repayments
CREATE OR REPLACE FUNCTION public.get_available_loan_fund()
RETURNS numeric
LANGUAGE sql
STABLE
AS $$
  SELECT GREATEST(
    -- Total confirmed contributions
    COALESCE((SELECT SUM(amount) FROM public.contributions WHERE status = 'confirmed'), 0) - 
    -- Outstanding loan balances (original loan amount + interest - repayments)
    COALESCE((
      SELECT SUM(
        l.amount + (l.amount * l.interest_rate / 100) - 
        COALESCE((SELECT SUM(lr.amount) FROM public.loan_repayments lr WHERE lr.loan_id = l.id), 0)
      )
      FROM public.loans l 
      WHERE l.status IN ('approved', 'active', 'overdue')
    ), 0),
    0
  );
$$;
