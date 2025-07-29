
-- Create notification templates table
CREATE TABLE public.notification_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('sms', 'email', 'both')),
  category TEXT NOT NULL CHECK (category IN ('contribution_reminder', 'meeting_reminder', 'loan_reminder', 'general', 'dividend_notification', 'welcome')),
  subject TEXT, -- For emails
  sms_content TEXT,
  email_content TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create member communication preferences table
CREATE TABLE public.member_communication_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  sms_enabled BOOLEAN NOT NULL DEFAULT true,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  contribution_reminders BOOLEAN NOT NULL DEFAULT true,
  meeting_reminders BOOLEAN NOT NULL DEFAULT true,
  loan_reminders BOOLEAN NOT NULL DEFAULT true,
  dividend_notifications BOOLEAN NOT NULL DEFAULT true,
  general_notifications BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(member_id)
);

-- Create notification history table
CREATE TABLE public.notification_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES public.notification_templates(id),
  member_id UUID REFERENCES public.members(id),
  type TEXT NOT NULL CHECK (type IN ('sms', 'email')),
  recipient TEXT NOT NULL, -- Phone number or email
  subject TEXT, -- For emails
  content TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed', 'delivered')) DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notification campaigns table for bulk messaging
CREATE TABLE public.notification_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  template_id UUID REFERENCES public.notification_templates(id),
  target_criteria JSONB, -- Filter criteria for members
  status TEXT NOT NULL CHECK (status IN ('draft', 'scheduled', 'sending', 'completed', 'failed')) DEFAULT 'draft',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  total_recipients INTEGER DEFAULT 0,
  successful_sends INTEGER DEFAULT 0,
  failed_sends INTEGER DEFAULT 0,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create RLS policies
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_communication_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_campaigns ENABLE ROW LEVEL SECURITY;

-- Policies for notification_templates
CREATE POLICY "Allow all operations on notification_templates" 
  ON public.notification_templates 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Policies for member_communication_preferences
CREATE POLICY "Allow all operations on member_communication_preferences" 
  ON public.member_communication_preferences 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Policies for notification_history
CREATE POLICY "Allow all operations on notification_history" 
  ON public.notification_history 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Policies for notification_campaigns
CREATE POLICY "Allow all operations on notification_campaigns" 
  ON public.notification_campaigns 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Insert default communication preferences for existing members
INSERT INTO public.member_communication_preferences (member_id)
SELECT id FROM public.members
ON CONFLICT (member_id) DO NOTHING;

-- Insert default notification templates
INSERT INTO public.notification_templates (name, type, category, subject, sms_content, email_content) VALUES
('Contribution Reminder', 'both', 'contribution_reminder', 
 'Monthly Contribution Reminder', 
 'Hi {member_name}, this is a friendly reminder that your monthly contribution of KES {target_amount} is due. Please make your payment by {due_date}. Thank you!',
 '<p>Dear {member_name},</p><p>This is a friendly reminder that your monthly contribution of <strong>KES {target_amount}</strong> is due.</p><p>Please make your payment by <strong>{due_date}</strong>.</p><p>Thank you for your continued participation!</p>'),

('Meeting Reminder', 'both', 'meeting_reminder',
 'Upcoming Chama Meeting', 
 'Hi {member_name}, reminder: Chama meeting on {meeting_date} at {meeting_time} at {location}. Please attend.',
 '<p>Dear {member_name},</p><p>This is a reminder about our upcoming Chama meeting:</p><ul><li><strong>Date:</strong> {meeting_date}</li><li><strong>Time:</strong> {meeting_time}</li><li><strong>Location:</strong> {location}</li></ul><p>Please make sure to attend. Thank you!</p>'),

('Loan Payment Reminder', 'both', 'loan_reminder',
 'Loan Payment Due', 
 'Hi {member_name}, your loan payment of KES {amount_due} is due on {due_date}. Please make payment to avoid penalties.',
 '<p>Dear {member_name},</p><p>This is a reminder that your loan payment of <strong>KES {amount_due}</strong> is due on <strong>{due_date}</strong>.</p><p>Please make your payment on time to avoid any penalties.</p><p>Thank you for your cooperation!</p>'),

('Welcome New Member', 'both', 'welcome',
 'Welcome to Our Chama!',
 'Welcome to our Chama, {member_name}! We are excited to have you as part of our group. You will receive regular updates about meetings and contributions.',
 '<p>Dear {member_name},</p><p>Welcome to our Chama! We are excited to have you as part of our group.</p><p>You will receive regular updates about:</p><ul><li>Monthly contributions</li><li>Meeting schedules</li><li>Loan opportunities</li><li>Dividend distributions</li></ul><p>Thank you for joining us!</p>'),

('Dividend Distribution', 'both', 'dividend_notification',
 'Dividend Payment Available',
 'Hi {member_name}, your dividend of KES {dividend_amount} is ready for collection. Based on your {contribution_percentage}% contribution share.',
 '<p>Dear {member_name},</p><p>Great news! Your dividend payment is ready for collection.</p><p><strong>Dividend Amount:</strong> KES {dividend_amount}</p><p><strong>Based on:</strong> {contribution_percentage}% contribution share</p><p>Please contact us to arrange collection. Thank you!</p>');

-- Create database functions for notifications
CREATE OR REPLACE FUNCTION public.get_member_communication_preferences(member_uuid uuid)
RETURNS TABLE(
  sms_enabled boolean,
  email_enabled boolean,
  contribution_reminders boolean,
  meeting_reminders boolean,
  loan_reminders boolean,
  dividend_notifications boolean,
  general_notifications boolean
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    COALESCE(mcp.sms_enabled, true) as sms_enabled,
    COALESCE(mcp.email_enabled, true) as email_enabled,
    COALESCE(mcp.contribution_reminders, true) as contribution_reminders,
    COALESCE(mcp.meeting_reminders, true) as meeting_reminders,
    COALESCE(mcp.loan_reminders, true) as loan_reminders,
    COALESCE(mcp.dividend_notifications, true) as dividend_notifications,
    COALESCE(mcp.general_notifications, true) as general_notifications
  FROM public.members m
  LEFT JOIN public.member_communication_preferences mcp ON m.id = mcp.member_id
  WHERE m.id = member_uuid;
$$;

CREATE OR REPLACE FUNCTION public.get_notification_stats()
RETURNS TABLE(
  total_sent integer,
  total_delivered integer,
  total_failed integer,
  sms_sent integer,
  email_sent integer,
  recent_activity_count integer
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    COUNT(CASE WHEN status IN ('sent', 'delivered') THEN 1 END)::integer as total_sent,
    COUNT(CASE WHEN status = 'delivered' THEN 1 END)::integer as total_delivered,
    COUNT(CASE WHEN status = 'failed' THEN 1 END)::integer as total_failed,
    COUNT(CASE WHEN type = 'sms' AND status IN ('sent', 'delivered') THEN 1 END)::integer as sms_sent,
    COUNT(CASE WHEN type = 'email' AND status IN ('sent', 'delivered') THEN 1 END)::integer as email_sent,
    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END)::integer as recent_activity_count
  FROM public.notification_history;
$$;
