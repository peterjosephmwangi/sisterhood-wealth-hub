
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'sms' | 'email' | 'both';
  category: 'contribution_reminder' | 'meeting_reminder' | 'loan_reminder' | 'general' | 'dividend_notification' | 'welcome';
  subject?: string;
  sms_content?: string;
  email_content?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationHistory {
  id: string;
  template_id?: string;
  member_id?: string;
  type: 'sms' | 'email';
  recipient: string;
  subject?: string;
  content: string;
  status: 'pending' | 'sent' | 'failed' | 'delivered';
  sent_at?: string;
  delivered_at?: string;
  error_message?: string;
  metadata?: any;
  created_at: string;
}

export interface NotificationCampaign {
  id: string;
  name: string;
  description?: string;
  template_id?: string;
  target_criteria?: any;
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed';
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  total_recipients: number;
  successful_sends: number;
  failed_sends: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface MemberCommunicationPreference {
  id: string;
  member_id: string;
  sms_enabled: boolean;
  email_enabled: boolean;
  contribution_reminders: boolean;
  meeting_reminders: boolean;
  loan_reminders: boolean;
  dividend_notifications: boolean;
  general_notifications: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationStats {
  total_sent: number;
  total_delivered: number;
  total_failed: number;
  sms_sent: number;
  email_sent: number;
  recent_activity_count: number;
}

export const useNotificationTemplates = () => {
  return useQuery({
    queryKey: ['notification-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as NotificationTemplate[];
    },
  });
};

export const useNotificationHistory = () => {
  return useQuery({
    queryKey: ['notification-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as NotificationHistory[];
    },
  });
};

export const useNotificationCampaigns = () => {
  return useQuery({
    queryKey: ['notification-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as NotificationCampaign[];
    },
  });
};

export const useMemberCommunicationPreferences = () => {
  return useQuery({
    queryKey: ['member-communication-preferences'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('member_communication_preferences')
        .select(`
          *,
          members (
            name,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useNotificationStats = () => {
  return useQuery({
    queryKey: ['notification-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_notification_stats');

      if (error) throw error;
      
      // Handle the case where RPC returns an array with a single stats object
      if (Array.isArray(data) && data.length > 0) {
        return data[0] as NotificationStats;
      }
      
      // Return default stats if no data
      return {
        total_sent: 0,
        total_delivered: 0,
        total_failed: 0,
        sms_sent: 0,
        email_sent: 0,
        recent_activity_count: 0,
      } as NotificationStats;
    },
  });
};

export const useCreateNotificationTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (template: Omit<NotificationTemplate, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('notification_templates')
        .insert(template)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
      toast({
        title: 'Success',
        description: 'Notification template created successfully',
      });
    },
    onError: (error) => {
      console.error('Error creating notification template:', error);
      toast({
        title: 'Error',
        description: 'Failed to create notification template',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateNotificationTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<NotificationTemplate> & { id: string }) => {
      const { data, error } = await supabase
        .from('notification_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
      toast({
        title: 'Success',
        description: 'Notification template updated successfully',
      });
    },
    onError: (error) => {
      console.error('Error updating notification template:', error);
      toast({
        title: 'Error',
        description: 'Failed to update notification template',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateMemberCommunicationPreference = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ member_id, ...updates }: Partial<MemberCommunicationPreference> & { member_id: string }) => {
      const { data, error } = await supabase
        .from('member_communication_preferences')
        .upsert({
          member_id,
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member-communication-preferences'] });
      toast({
        title: 'Success',
        description: 'Communication preferences updated successfully',
      });
    },
    onError: (error) => {
      console.error('Error updating communication preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to update communication preferences',
        variant: 'destructive',
      });
    },
  });
};

export const useCreateNotificationCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (campaign: Omit<NotificationCampaign, 'id' | 'created_at' | 'updated_at' | 'total_recipients' | 'successful_sends' | 'failed_sends'>) => {
      const { data, error } = await supabase
        .from('notification_campaigns')
        .insert(campaign)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-campaigns'] });
      toast({
        title: 'Success',
        description: 'Notification campaign created successfully',
      });
    },
    onError: (error) => {
      console.error('Error creating notification campaign:', error);
      toast({
        title: 'Error',
        description: 'Failed to create notification campaign',
        variant: 'destructive',
      });
    },
  });
};
