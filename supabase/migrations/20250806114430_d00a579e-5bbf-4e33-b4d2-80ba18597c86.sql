-- Phase 1: Fix RLS Policies for Data Protection
-- This migration addresses critical security vulnerabilities by implementing proper RLS policies

-- First, update database functions to include SET search_path for security
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid, _roles app_role[])
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = ANY(_roles)
  );
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_roles()
RETURNS app_role[]
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT ARRAY(
    SELECT role 
    FROM public.user_roles 
    WHERE user_id = auth.uid()
  );
$$;

-- Drop overly permissive policies
DROP POLICY IF EXISTS "Allow all operations on members" ON public.members;
DROP POLICY IF EXISTS "Allow all operations on contributions" ON public.contributions;
DROP POLICY IF EXISTS "Allow all operations on loans" ON public.loans;
DROP POLICY IF EXISTS "Allow all operations on expenses" ON public.expenses;
DROP POLICY IF EXISTS "Allow all operations on meetings" ON public.meetings;
DROP POLICY IF EXISTS "Allow all operations on notification_templates" ON public.notification_templates;
DROP POLICY IF EXISTS "Allow all operations on notification_history" ON public.notification_history;
DROP POLICY IF EXISTS "Allow all operations on notification_campaigns" ON public.notification_campaigns;
DROP POLICY IF EXISTS "Allow all operations on budgets" ON public.budgets;
DROP POLICY IF EXISTS "Allow all operations on expense_categories" ON public.expense_categories;
DROP POLICY IF EXISTS "Allow all operations on meeting_attendance" ON public.meeting_attendance;
DROP POLICY IF EXISTS "Allow all operations on member_communication_preferences" ON public.member_communication_preferences;
DROP POLICY IF EXISTS "Allow all operations on audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Allow all operations on financial_reports" ON public.financial_reports;

-- Enable RLS on tables that don't have it yet
ALTER TABLE public.contribution_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dividend_declarations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_repayments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_dividends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_interest_profits ENABLE ROW LEVEL SECURITY;

-- MEMBERS table policies - only authenticated users can view members, admins can manage
CREATE POLICY "Authenticated users can view members"
  ON public.members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage members"
  ON public.members FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- CONTRIBUTIONS table policies - users can view all, treasurers/admins can manage
CREATE POLICY "Authenticated users can view contributions"
  ON public.contributions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Treasurers and admins can manage contributions"
  ON public.contributions FOR ALL
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'treasurer'::app_role]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'treasurer'::app_role]));

-- LOANS table policies - users can view all, treasurers/admins can manage
CREATE POLICY "Authenticated users can view loans"
  ON public.loans FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Treasurers and admins can manage loans"
  ON public.loans FOR ALL
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'treasurer'::app_role]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'treasurer'::app_role]));

-- LOAN REPAYMENTS table policies
CREATE POLICY "Authenticated users can view loan repayments"
  ON public.loan_repayments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Treasurers and admins can manage loan repayments"
  ON public.loan_repayments FOR ALL
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'treasurer'::app_role]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'treasurer'::app_role]));

-- EXPENSES table policies - treasurers/admins only
CREATE POLICY "Treasurers and admins can view expenses"
  ON public.expenses FOR SELECT
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'treasurer'::app_role]));

CREATE POLICY "Treasurers and admins can manage expenses"
  ON public.expenses FOR ALL
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'treasurer'::app_role]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'treasurer'::app_role]));

-- BUDGETS table policies - treasurers/admins only
CREATE POLICY "Treasurers and admins can view budgets"
  ON public.budgets FOR SELECT
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'treasurer'::app_role]));

CREATE POLICY "Treasurers and admins can manage budgets"
  ON public.budgets FOR ALL
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'treasurer'::app_role]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'treasurer'::app_role]));

-- EXPENSE CATEGORIES table policies - treasurers/admins only
CREATE POLICY "Treasurers and admins can view expense categories"
  ON public.expense_categories FOR SELECT
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'treasurer'::app_role]));

CREATE POLICY "Treasurers and admins can manage expense categories"
  ON public.expense_categories FOR ALL
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'treasurer'::app_role]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'treasurer'::app_role]));

-- MEETINGS table policies - secretaries/chairpersons/admins can manage
CREATE POLICY "Authenticated users can view meetings"
  ON public.meetings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Meeting managers can manage meetings"
  ON public.meetings FOR ALL
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'secretary'::app_role, 'chairperson'::app_role]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'secretary'::app_role, 'chairperson'::app_role]));

-- MEETING ATTENDANCE table policies
CREATE POLICY "Authenticated users can view meeting attendance"
  ON public.meeting_attendance FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Meeting managers can manage attendance"
  ON public.meeting_attendance FOR ALL
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'secretary'::app_role, 'chairperson'::app_role]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'secretary'::app_role, 'chairperson'::app_role]));

-- DIVIDEND DECLARATIONS table policies - treasurers/admins only
CREATE POLICY "Authenticated users can view dividend declarations"
  ON public.dividend_declarations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Treasurers and admins can manage dividend declarations"
  ON public.dividend_declarations FOR ALL
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'treasurer'::app_role]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'treasurer'::app_role]));

-- MEMBER DIVIDENDS table policies
CREATE POLICY "Authenticated users can view member dividends"
  ON public.member_dividends FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Treasurers and admins can manage member dividends"
  ON public.member_dividends FOR ALL
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'treasurer'::app_role]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'treasurer'::app_role]));

-- CONTRIBUTION TARGETS table policies - treasurers/admins only
CREATE POLICY "Authenticated users can view contribution targets"
  ON public.contribution_targets FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Treasurers and admins can manage contribution targets"
  ON public.contribution_targets FOR ALL
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'treasurer'::app_role]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'treasurer'::app_role]));

-- LOAN INTEREST PROFITS table policies
CREATE POLICY "Authenticated users can view loan interest profits"
  ON public.loan_interest_profits FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Treasurers and admins can manage loan interest profits"
  ON public.loan_interest_profits FOR ALL
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'treasurer'::app_role]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'treasurer'::app_role]));

-- NOTIFICATION TEMPLATES table policies - admins only
CREATE POLICY "Admins can view notification templates"
  ON public.notification_templates FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage notification templates"
  ON public.notification_templates FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- NOTIFICATION HISTORY table policies - admins only
CREATE POLICY "Admins can view notification history"
  ON public.notification_history FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage notification history"
  ON public.notification_history FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- NOTIFICATION CAMPAIGNS table policies - admins only
CREATE POLICY "Admins can view notification campaigns"
  ON public.notification_campaigns FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage notification campaigns"
  ON public.notification_campaigns FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- MEMBER COMMUNICATION PREFERENCES table policies
CREATE POLICY "Authenticated users can view communication preferences"
  ON public.member_communication_preferences FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage communication preferences"
  ON public.member_communication_preferences FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- AUDIT LOGS table policies - admins only
CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert audit logs"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- FINANCIAL REPORTS table policies - treasurers/admins only
CREATE POLICY "Treasurers and admins can view financial reports"
  ON public.financial_reports FOR SELECT
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'treasurer'::app_role]));

CREATE POLICY "Treasurers and admins can manage financial reports"
  ON public.financial_reports FOR ALL
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'treasurer'::app_role]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'treasurer'::app_role]));