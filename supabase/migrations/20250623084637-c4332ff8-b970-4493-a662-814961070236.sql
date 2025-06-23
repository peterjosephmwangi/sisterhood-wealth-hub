
-- Create meetings table (if not already exists, but let's make sure it has all needed columns)
-- The meetings table already exists, so let's add any missing functionality

-- Create a function to get upcoming meetings
CREATE OR REPLACE FUNCTION public.get_upcoming_meetings()
RETURNS TABLE(
  id uuid,
  title text,
  meeting_date date,
  meeting_time time,
  location text,
  expected_attendees integer,
  agenda text[],
  status meeting_status,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE
AS $function$
  SELECT 
    m.id,
    m.title,
    m.meeting_date,
    m.meeting_time,
    m.location,
    m.expected_attendees,
    m.agenda,
    m.status,
    m.created_at
  FROM meetings m
  WHERE m.status = 'scheduled' 
    AND m.meeting_date >= CURRENT_DATE
  ORDER BY m.meeting_date ASC, m.meeting_time ASC
  LIMIT 10;
$function$;

-- Create a function to get past meetings
CREATE OR REPLACE FUNCTION public.get_past_meetings()
RETURNS TABLE(
  id uuid,
  title text,
  meeting_date date,
  meeting_time time,
  location text,
  actual_attendees integer,
  minutes text,
  status meeting_status,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE
AS $function$
  SELECT 
    m.id,
    m.title,
    m.meeting_date,
    m.meeting_time,
    m.location,
    m.actual_attendees,
    m.minutes,
    m.status,
    m.created_at
  FROM meetings m
  WHERE m.status = 'completed'
    OR (m.status = 'scheduled' AND m.meeting_date < CURRENT_DATE)
  ORDER BY m.meeting_date DESC, m.meeting_time DESC
  LIMIT 10;
$function$;

-- Create a function to get next upcoming meeting for dashboard
CREATE OR REPLACE FUNCTION public.get_next_meeting()
RETURNS TABLE(
  id uuid,
  title text,
  meeting_date date,
  meeting_time time,
  location text,
  days_until integer
)
LANGUAGE sql
STABLE
AS $function$
  SELECT 
    m.id,
    m.title,
    m.meeting_date,
    m.meeting_time,
    m.location,
    (m.meeting_date - CURRENT_DATE)::integer as days_until
  FROM meetings m
  WHERE m.status = 'scheduled' 
    AND m.meeting_date >= CURRENT_DATE
  ORDER BY m.meeting_date ASC, m.meeting_time ASC
  LIMIT 1;
$function$;
