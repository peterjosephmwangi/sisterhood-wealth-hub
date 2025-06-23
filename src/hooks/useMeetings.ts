
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UpcomingMeeting {
  id: string;
  title: string;
  meeting_date: string;
  meeting_time: string;
  location: string;
  expected_attendees: number;
  agenda: string[];
  status: string;
  created_at: string;
}

interface PastMeeting {
  id: string;
  title: string;
  meeting_date: string;
  meeting_time: string;
  location: string;
  actual_attendees: number;
  minutes: string;
  status: string;
  created_at: string;
}

export const useMeetings = () => {
  const [upcomingMeetings, setUpcomingMeetings] = useState<UpcomingMeeting[]>([]);
  const [pastMeetings, setPastMeetings] = useState<PastMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMeetings = async () => {
    try {
      setLoading(true);

      // Fetch upcoming meetings
      const { data: upcomingData, error: upcomingError } = await supabase
        .rpc('get_upcoming_meetings');

      if (upcomingError) throw upcomingError;

      // Fetch past meetings
      const { data: pastData, error: pastError } = await supabase
        .rpc('get_past_meetings');

      if (pastError) throw pastError;

      setUpcomingMeetings(upcomingData || []);
      setPastMeetings(pastData || []);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      toast({
        title: "Error",
        description: "Failed to load meetings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  return {
    upcomingMeetings,
    pastMeetings,
    loading,
    refetch: fetchMeetings,
  };
};
