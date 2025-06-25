
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useMonthlyTargets = () => {
  const [currentTarget, setCurrentTarget] = useState(120000); // Default fallback
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCurrentTarget = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_monthly_target');
      
      if (error) throw error;
      setCurrentTarget(data || 120000);
    } catch (error) {
      console.error('Error fetching monthly target:', error);
      toast({
        title: "Error",
        description: "Failed to fetch monthly target",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateTarget = async (targetMonth: string, targetAmount: number) => {
    try {
      const { error } = await supabase.rpc('set_monthly_target', {
        target_month: targetMonth,
        target_amount: targetAmount,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Monthly target updated successfully",
      });

      // Refresh current target if we updated current month
      const currentMonth = new Date().toISOString().split('T')[0];
      if (targetMonth.startsWith(currentMonth.substring(0, 7))) {
        setCurrentTarget(targetAmount);
      }
    } catch (error) {
      console.error('Error updating monthly target:', error);
      toast({
        title: "Error",
        description: "Failed to update monthly target",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchCurrentTarget();
  }, []);

  return {
    currentTarget,
    loading,
    updateTarget,
    refetch: fetchCurrentTarget,
  };
};
