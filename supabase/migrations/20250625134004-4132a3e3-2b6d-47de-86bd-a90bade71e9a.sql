
-- Fix the get_available_loan_fund function with correct logic
CREATE OR REPLACE FUNCTION public.get_available_loan_fund()
RETURNS numeric
LANGUAGE sql
STABLE
AS $$
  SELECT GREATEST(
    -- Total confirmed contributions minus outstanding loan balances
    COALESCE((SELECT SUM(amount) FROM public.contributions WHERE status = 'confirmed'), 0) - 
    COALESCE((
      SELECT SUM(get_loan_balance(l.id))
      FROM public.loans l 
      WHERE l.status IN ('approved', 'active', 'overdue')
        AND get_loan_balance(l.id) > 0
    ), 0),
    0
  );
$$;
