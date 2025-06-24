
-- Create loan_repayments table to track all repayment transactions
CREATE TABLE public.loan_repayments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_id uuid NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount > 0),
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  payment_method payment_method NOT NULL DEFAULT 'cash',
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add indexes for better query performance
CREATE INDEX idx_loan_repayments_loan_id ON public.loan_repayments(loan_id);
CREATE INDEX idx_loan_repayments_payment_date ON public.loan_repayments(payment_date);

-- Create function to get total repaid amount for a loan
CREATE OR REPLACE FUNCTION public.get_loan_total_repaid(loan_uuid uuid)
RETURNS numeric
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(SUM(amount), 0)
  FROM public.loan_repayments 
  WHERE loan_id = loan_uuid;
$$;

-- Create function to get loan balance (amount + interest - repaid)
CREATE OR REPLACE FUNCTION public.get_loan_balance(loan_uuid uuid)
RETURNS numeric
LANGUAGE sql
STABLE
AS $$
  SELECT 
    CASE 
      WHEN l.amount IS NULL THEN 0
      ELSE GREATEST(
        l.amount + (l.amount * l.interest_rate / 100) - COALESCE(
          (SELECT SUM(amount) FROM public.loan_repayments WHERE loan_id = loan_uuid), 
          0
        ), 
        0
      )
    END
  FROM public.loans l
  WHERE l.id = loan_uuid;
$$;

-- Create function to automatically update loan status when fully repaid
CREATE OR REPLACE FUNCTION public.update_loan_status_on_repayment()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if loan is fully repaid
  IF (SELECT get_loan_balance(NEW.loan_id)) <= 0 THEN
    UPDATE public.loans 
    SET status = 'repaid', updated_at = now()
    WHERE id = NEW.loan_id AND status != 'repaid';
  ELSE
    -- Update loan status to active if it was approved
    UPDATE public.loans 
    SET status = 'active', updated_at = now()
    WHERE id = NEW.loan_id AND status = 'approved';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically update loan status after repayment
CREATE TRIGGER trigger_update_loan_status_on_repayment
  AFTER INSERT ON public.loan_repayments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_loan_status_on_repayment();

-- Create function to get active loans with balance for a member
CREATE OR REPLACE FUNCTION public.get_member_active_loans(member_uuid uuid)
RETURNS TABLE(
  id uuid,
  amount numeric,
  interest_rate numeric,
  due_date date,
  loan_date date,
  total_amount numeric,
  total_repaid numeric,
  balance numeric,
  status text
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    l.id,
    l.amount,
    l.interest_rate,
    l.due_date,
    l.loan_date,
    l.amount + (l.amount * l.interest_rate / 100) as total_amount,
    get_loan_total_repaid(l.id) as total_repaid,
    get_loan_balance(l.id) as balance,
    l.status
  FROM public.loans l
  WHERE l.member_id = member_uuid 
    AND l.status IN ('approved', 'active', 'overdue')
    AND get_loan_balance(l.id) > 0
  ORDER BY l.due_date ASC;
$$;
