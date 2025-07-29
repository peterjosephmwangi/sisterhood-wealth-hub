
-- Create expense categories table
CREATE TABLE public.expense_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6B7280',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create expenses table
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.expense_categories(id),
  amount NUMERIC NOT NULL,
  description TEXT NOT NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method payment_method NOT NULL DEFAULT 'cash',
  receipt_reference TEXT,
  approved_by TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- Create budgets table
CREATE TABLE public.budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.expense_categories(id),
  budget_period_start DATE NOT NULL,
  budget_period_end DATE NOT NULL,
  allocated_amount NUMERIC NOT NULL,
  spent_amount NUMERIC NOT NULL DEFAULT 0,
  remaining_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- Create financial reports table
CREATE TABLE public.financial_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_type TEXT NOT NULL,
  report_period_start DATE NOT NULL,
  report_period_end DATE NOT NULL,
  total_income NUMERIC NOT NULL DEFAULT 0,
  total_expenses NUMERIC NOT NULL DEFAULT 0,
  net_profit NUMERIC NOT NULL DEFAULT 0,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  generated_by TEXT,
  report_data JSONB,
  status TEXT NOT NULL DEFAULT 'draft'
);

-- Insert default expense categories
INSERT INTO public.expense_categories (name, description, color) VALUES
('Administrative', 'Office supplies, stationery, administrative costs', '#3B82F6'),
('Meeting Expenses', 'Venue, refreshments, meeting-related costs', '#10B981'),
('Communication', 'Phone, internet, messaging costs', '#F59E0B'),
('Transport', 'Travel expenses for chama activities', '#EF4444'),
('Legal & Professional', 'Legal fees, accounting, professional services', '#8B5CF6'),
('Bank Charges', 'Transaction fees, bank charges', '#F97316'),
('Insurance', 'Group insurance, asset insurance', '#06B6D4'),
('Marketing', 'Promotional materials, advertising', '#EC4899'),
('Maintenance', 'Equipment maintenance, repairs', '#84CC16'),
('Miscellaneous', 'Other operational expenses', '#6B7280');

-- Enable RLS on all tables
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow all operations on expense_categories" ON public.expense_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on expenses" ON public.expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on budgets" ON public.budgets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on financial_reports" ON public.financial_reports FOR ALL USING (true) WITH CHECK (true);

-- Create database functions for financial calculations
CREATE OR REPLACE FUNCTION public.get_total_expenses(start_date date DEFAULT NULL, end_date date DEFAULT NULL)
RETURNS NUMERIC
LANGUAGE SQL
STABLE
AS $$
  SELECT COALESCE(SUM(amount), 0)
  FROM public.expenses
  WHERE status = 'approved'
    AND (start_date IS NULL OR expense_date >= start_date)
    AND (end_date IS NULL OR expense_date <= end_date);
$$;

CREATE OR REPLACE FUNCTION public.get_expenses_by_category(start_date date DEFAULT NULL, end_date date DEFAULT NULL)
RETURNS TABLE(category_id uuid, category_name text, total_amount numeric, expense_count integer)
LANGUAGE SQL
STABLE
AS $$
  SELECT 
    ec.id as category_id,
    ec.name as category_name,
    COALESCE(SUM(e.amount), 0) as total_amount,
    COUNT(e.id)::integer as expense_count
  FROM public.expense_categories ec
  LEFT JOIN public.expenses e ON ec.id = e.category_id 
    AND e.status = 'approved'
    AND (start_date IS NULL OR e.expense_date >= start_date)
    AND (end_date IS NULL OR e.expense_date <= end_date)
  WHERE ec.is_active = true
  GROUP BY ec.id, ec.name
  ORDER BY total_amount DESC;
$$;

CREATE OR REPLACE FUNCTION public.get_budget_utilization(budget_period_start date, budget_period_end date)
RETURNS TABLE(category_id uuid, category_name text, allocated_amount numeric, spent_amount numeric, remaining_amount numeric, utilization_percentage numeric)
LANGUAGE SQL
STABLE
AS $$
  SELECT 
    b.category_id,
    ec.name as category_name,
    b.allocated_amount,
    b.spent_amount,
    b.remaining_amount,
    CASE 
      WHEN b.allocated_amount > 0 
      THEN (b.spent_amount / b.allocated_amount * 100)
      ELSE 0 
    END as utilization_percentage
  FROM public.budgets b
  JOIN public.expense_categories ec ON b.category_id = ec.id
  WHERE b.budget_period_start = budget_period_start
    AND b.budget_period_end = budget_period_end
    AND b.status = 'active'
  ORDER BY utilization_percentage DESC;
$$;

CREATE OR REPLACE FUNCTION public.generate_profit_loss_report(start_date date, end_date date)
RETURNS TABLE(
  total_contributions numeric,
  total_interest_income numeric,
  total_income numeric,
  total_expenses numeric,
  net_profit numeric,
  profit_margin numeric
)
LANGUAGE SQL
STABLE
AS $$
  SELECT 
    get_monthly_contributions_total(start_date) as total_contributions,
    get_total_interest_profit() as total_interest_income,
    get_monthly_contributions_total(start_date) + get_total_interest_profit() as total_income,
    get_total_expenses(start_date, end_date) as total_expenses,
    (get_monthly_contributions_total(start_date) + get_total_interest_profit()) - get_total_expenses(start_date, end_date) as net_profit,
    CASE 
      WHEN (get_monthly_contributions_total(start_date) + get_total_interest_profit()) > 0 
      THEN (((get_monthly_contributions_total(start_date) + get_total_interest_profit()) - get_total_expenses(start_date, end_date)) / (get_monthly_contributions_total(start_date) + get_total_interest_profit()) * 100)
      ELSE 0 
    END as profit_margin;
$$;

-- Create trigger to update budget spent amounts when expenses are added
CREATE OR REPLACE FUNCTION public.update_budget_spent_amount()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'approved' THEN
    UPDATE public.budgets
    SET 
      spent_amount = spent_amount + NEW.amount,
      remaining_amount = allocated_amount - (spent_amount + NEW.amount),
      updated_at = now()
    WHERE category_id = NEW.category_id
      AND budget_period_start <= NEW.expense_date
      AND budget_period_end >= NEW.expense_date
      AND status = 'active';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_budget_on_expense_approval
  AFTER INSERT OR UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_budget_spent_amount();

-- Create trigger to update timestamps
CREATE TRIGGER update_expense_categories_updated_at
  BEFORE UPDATE ON public.expense_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
