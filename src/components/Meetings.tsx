
import React from 'react';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMeetings } from '@/hooks/useMeetings';
import ScheduleMeetingDialog from '@/components/meetings/ScheduleMeetingDialog';

const Meetings = () => {
  const { upcomingMeetings, pastMeetings, loading, refetch } = useMeetings();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleMeetingScheduled = () => {
    refetch();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Meetings</h2>
          <ScheduleMeetingDialog onMeetingScheduled={handleMeetingScheduled} />
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Loading meetings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Meetings</h2>
        <ScheduleMeetingDialog onMeetingScheduled={handleMeetingScheduled} />
      </div>

      {/* Upcoming Meetings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Upcoming Meetings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingMeetings.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No upcoming meetings scheduled</p>
            ) : (
              upcomingMeetings.map((meeting) => (
                <div key={meeting.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{meeting.title}</h3>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(meeting.meeting_date)}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatTime(meeting.meeting_time)}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {meeting.location}
                        </div>
                        {meeting.expected_attendees > 0 && (
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {meeting.expected_attendees} expected
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Scheduled
                    </Badge>
                  </div>
                  
                  {meeting.agenda && meeting.agenda.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Agenda:</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        {meeting.agenda.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="flex space-x-3 mt-4">
                    <Button size="sm" variant="outline">
                      Edit Meeting
                    </Button>
                    <Button size="sm" variant="outline">
                      Send Reminder
                    </Button>
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                      Join Meeting
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Past Meetings */}
      <Card>
        <CardHeader>
          <CardTitle>Past Meetings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pastMeetings.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No past meetings found</p>
            ) : (
              pastMeetings.map((meeting) => (
                <div key={meeting.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{meeting.title}</h3>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(meeting.meeting_date)}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatTime(meeting.meeting_time)}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {meeting.location}
                        </div>
                        {meeting.actual_attendees > 0 && (
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {meeting.actual_attendees} attended
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Completed
                    </Badge>
                  </div>
                  
                  {meeting.minutes && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Meeting Minutes:</h4>
                      <p className="text-sm text-gray-600">{meeting.minutes}</p>
                    </div>
                  )}
                  
                  <div className="flex space-x-3 mt-4">
                    <Button size="sm" variant="outline">
                      View Full Minutes
                    </Button>
                    <Button size="sm" variant="outline">
                      Download Report
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Meetings;
