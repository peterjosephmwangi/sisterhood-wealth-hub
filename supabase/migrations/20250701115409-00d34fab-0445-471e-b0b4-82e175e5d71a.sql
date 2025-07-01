
-- Create table for dividend declarations
CREATE TABLE public.dividend_declarations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  declaration_date DATE NOT NULL DEFAULT CURRENT_DATE,
  dividend_period_start DATE NOT NULL,
  dividend_period_end DATE NOT NULL,
  total_dividend_amount NUMERIC NOT NULL DEFAULT 0,
  dividend_per_share NUMERIC NOT NULL DEFAULT 0,
  calculation_method TEXT NOT NULL DEFAULT 'contribution_based',
  status TEXT NOT NULL DEFAULT 'declared' CHECK (status IN ('declared', 'approved', 'paid', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for individual member dividend allocations
CREATE TABLE public.member_dividends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dividend_declaration_id UUID NOT NULL REFERENCES public.dividend_declarations(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  member_contribution_amount NUMERIC NOT NULL DEFAULT 0,
  contribution_percentage NUMERIC NOT NULL DEFAULT 0,
  dividend_amount NUMERIC NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  payment_date DATE,
  payment_method TEXT CHECK (payment_method IN ('m_pesa', 'bank_transfer', 'cash')),
  payment_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(dividend_declaration_id, member_id)
);

-- Create function to calculate contribution-based dividends
CREATE OR REPLACE FUNCTION public.calculate_member_dividends(
  declaration_id UUID,
  period_start DATE,
  period_end DATE,
  total_dividend NUMERIC
)
RETURNS TABLE(
  member_id UUID,
  member_name TEXT,
  member_contribution NUMERIC,
  contribution_percentage NUMERIC,
  dividend_amount NUMERIC
)
LANGUAGE sql
STABLE
AS $$
  WITH period_contributions AS (
    SELECT 
      c.member_id,
      m.name as member_name,
      SUM(c.amount) as total_contribution
    FROM public.contributions c
    JOIN public.members m ON c.member_id = m.id
    WHERE c.status = 'confirmed'
      AND c.contribution_date >= period_start
      AND c.contribution_date <= period_end
    GROUP BY c.member_id, m.name
  ),
  total_pool AS (
    SELECT SUM(total_contribution) as pool_total
    FROM period_contributions
  )
  SELECT 
    pc.member_id,
    pc.member_name,
    pc.total_contribution as member_contribution,
    CASE 
      WHEN tp.pool_total > 0 
      THEN (pc.total_contribution / tp.pool_total * 100)
      ELSE 0 
    END as contribution_percentage,
    CASE 
      WHEN tp.pool_total > 0 
      THEN (pc.total_contribution / tp.pool_total * total_dividend)
      ELSE 0 
    END as dividend_amount
  FROM period_contributions pc
  CROSS JOIN total_pool tp
  ORDER BY pc.total_contribution DESC;
$$;

-- Create function to get member dividend history
CREATE OR REPLACE FUNCTION public.get_member_dividend_history(member_uuid UUID)
RETURNS TABLE(
  declaration_date DATE,
  dividend_period_start DATE,
  dividend_period_end DATE,
  total_dividend_amount NUMERIC,
  member_contribution NUMERIC,
  contribution_percentage NUMERIC,
  dividend_amount NUMERIC,
  payment_status TEXT,
  payment_date DATE
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    dd.declaration_date,
    dd.dividend_period_start,
    dd.dividend_period_end,
    dd.total_dividend_amount,
    md.member_contribution_amount,
    md.contribution_percentage,
    md.dividend_amount,
    md.payment_status,
    md.payment_date
  FROM public.member_dividends md
  JOIN public.dividend_declarations dd ON md.dividend_declaration_id = dd.id
  WHERE md.member_id = member_uuid
    AND dd.status != 'cancelled'
  ORDER BY dd.declaration_date DESC;
$$;

-- Create function to get total dividends paid to a member
CREATE OR REPLACE FUNCTION public.get_member_total_dividends(member_uuid UUID)
RETURNS NUMERIC
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(SUM(md.dividend_amount), 0)
  FROM public.member_dividends md
  JOIN public.dividend_declarations dd ON md.dividend_declaration_id = dd.id
  WHERE md.member_id = member_uuid
    AND md.payment_status = 'paid'
    AND dd.status = 'paid';
$$;

-- Create indexes for better performance
CREATE INDEX idx_dividend_declarations_date ON public.dividend_declarations(declaration_date);
CREATE INDEX idx_member_dividends_member_id ON public.member_dividends(member_id);
CREATE INDEX idx_member_dividends_declaration_id ON public.member_dividends(dividend_declaration_id);
