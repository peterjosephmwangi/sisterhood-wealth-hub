
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface AuditLogEntry {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_values: any;
  new_values: any;
  created_at: string;
  user_name: string;
}

export const useAuditTrail = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchAuditTrail = async (limit: number = 50, offset: number = 0) => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_audit_trail', {
        p_limit: limit,
        p_offset: offset
      });

      if (error) {
        console.error('Error fetching audit trail:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch audit trail',
          variant: 'destructive',
        });
        return;
      }

      setAuditLogs(data || []);
    } catch (error) {
      console.error('Error fetching audit trail:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch audit trail',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const logActivity = async (
    action: string,
    entityType: string,
    entityId?: string,
    oldValues?: any,
    newValues?: any
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('log_activity', {
        p_action: action,
        p_entity_type: entityType,
        p_entity_id: entityId || null,
        p_old_values: oldValues || null,
        p_new_values: newValues || null
      });

      if (error) {
        console.error('Error logging activity:', error);
      }
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAuditTrail();
    }
  }, [user]);

  return {
    auditLogs,
    loading,
    fetchAuditTrail,
    logActivity,
  };
};
