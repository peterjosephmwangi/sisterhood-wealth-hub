-- Phase 1 (Final): Implement Proper RLS Policies for Data Protection
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

-- Enable RLS on tables that don't have it yet (excluding views)
ALTER TABLE public.contribution_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dividend_declarations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_repayments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_dividends ENABLE ROW LEVEL SECURITY;

-- MEMBERS table policies
CREATE POLICY "Authenticated users can view members"
  ON public.members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert members"
  ON public.members FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update members"
  ON public.members FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete members"
  ON public.members FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- CONTRIBUTIONS table policies
CREATE POLICY "Authenticated users can view contributions"
  ON public.contributions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Treasurers and admins can insert contributions"
  ON public.contributions FOR INSERT
  TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'treasurer'::app_role]));

CREATE POLICY "Treasurers and admins can update contributions"
  ON public.contributions FOR UPDATE
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'treasurer'::app_role]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'treasurer'::app_role]));

CREATE POLICY "Treasurers and admins can delete contributions"
  ON public.contributions FOR DELETE
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'treasurer'::app_role]));

-- LOANS table policies
CREATE POLICY "Authenticated users can view loans"
  ON public.loans FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Treasurers and admins can insert loans"
  ON public.loans FOR INSERT
  TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'treasurer'::app_role]));

CREATE POLICY "Treasurers and admins can update loans"
  ON public.loans FOR UPDATE
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'treasurer'::app_role]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'treasurer'::app_role]));

CREATE POLICY "Treasurers and admins can delete loans"
  ON public.loans FOR DELETE
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'treasurer'::app_role]));

-- LOAN REPAYMENTS table policies
CREATE POLICY "Authenticated users can view loan repayments"
  ON public.loan_repayments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Treasurers and admins can insert loan repayments"
  ON public.loan_repayments FOR INSERT
  TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'treasurer'::app_role]));

CREATE POLICY "Treasurers and admins can update loan repayments"
  ON public.loan_repayments FOR UPDATE
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'treasurer'::app_role]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'treasurer'::app_role]));

CREATE POLICY "Treasurers and admins can delete loan repayments"
  ON public.loan_repayments FOR DELETE
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'treasurer'::app_role]));

-- EXPENSES table policies - restricted to treasurers/admins only
CREATE POLICY "Treasurers and admins can view expenses"
  ON public.expenses FOR SELECT
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'treasurer'::app_role]));

CREATE POLICY "Treasurers and admins can insert expenses"
  ON public.expenses FOR INSERT
  TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'treasurer'::app_role]));

CREATE POLICY "Treasurers and admins can update expenses"
  ON public.expenses FOR UPDATE
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'treasurer'::app_role]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'treasurer'::app_role]));

CREATE POLICY "Treasurers and admins can delete expenses"
  ON public.expenses FOR DELETE
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'treasurer'::app_role]));

-- BUDGETS table policies
CREATE POLICY "Treasurers and admins can view budgets"
  ON public.budgets FOR SELECT
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'treasurer'::app_role]));

CREATE POLICY "Treasurers and admins can insert budgets"
  ON public.budgets FOR INSERT
  TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'treasurer'::app_role]));

CREATE POLICY "Treasurers and admins can update budgets"
  ON public.budgets FOR UPDATE
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'treasurer'::app_role]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'treasurer'::app_role]));

CREATE POLICY "Treasurers and admins can delete budgets"
  ON public.budgets FOR DELETE
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'treasurer'::app_role]));

-- EXPENSE CATEGORIES table policies
CREATE POLICY "Treasurers and admins can view expense categories"
  ON public.expense_categories FOR SELECT
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'treasurer'::app_role]));

CREATE POLICY "Treasurers and admins can insert expense categories"
  ON public.expense_categories FOR INSERT
  TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'treasurer'::app_role]));

CREATE POLICY "Treasurers and admins can update expense categories"
  ON public.expense_categories FOR UPDATE
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'treasurer'::app_role]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'treasurer'::app_role]));

CREATE POLICY "Treasurers and admins can delete expense categories"
  ON public.expense_categories FOR DELETE
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'treasurer'::app_role]));

-- MEETINGS table policies
CREATE POLICY "Authenticated users can view meetings"
  ON public.meetings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Meeting managers can insert meetings"
  ON public.meetings FOR INSERT
  TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'secretary'::app_role, 'chairperson'::app_role]));

CREATE POLICY "Meeting managers can update meetings"
  ON public.meetings FOR UPDATE
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'secretary'::app_role, 'chairperson'::app_role]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'secretary'::app_role, 'chairperson'::app_role]));

CREATE POLICY "Meeting managers can delete meetings"
  ON public.meetings FOR DELETE
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'secretary'::app_role, 'chairperson'::app_role]));

-- NOTIFICATION TEMPLATES table policies - admins only
CREATE POLICY "Admins can view notification templates"
  ON public.notification_templates FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert notification templates"
  ON public.notification_templates FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update notification templates"
  ON public.notification_templates FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete notification templates"
  ON public.notification_templates FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- NOTIFICATION HISTORY table policies - admins only to view, system can insert
CREATE POLICY "Admins can view notification history"
  ON public.notification_history FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert notification history"
  ON public.notification_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- AUDIT LOGS table policies - admins only
CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert audit logs"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);