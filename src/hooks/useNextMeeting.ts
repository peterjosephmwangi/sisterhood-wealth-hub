
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface NextMeeting {
  id: string;
  title: string;
  meeting_date: string;
  meeting_time: string;
  location: string;
  days_until: number;
}

export const useNextMeeting = () => {
  const [nextMeeting, setNextMeeting] = useState<NextMeeting | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchNextMeeting = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_next_meeting');
      
      if (error) throw error;
      
      setNextMeeting(data && data.length > 0 ? data[0] : null);
    } catch (error) {
      console.error('Error fetching next meeting:', error);
      setNextMeeting(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNextMeeting();
  }, []);

  return {
    nextMeeting,
    loading,
    refetch: fetchNextMeeting,
  };
};
