
import React from 'react';
import { Plus, Calendar, Clock, MapPin, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Meetings = () => {
  const upcomingMeetings = [
    {
      id: 1,
      title: 'Monthly Contribution Meeting',
      date: '2024-06-22',
      time: '2:00 PM',
      location: 'Community Center',
      attendees: 20,
      agenda: ['Financial Review', 'Loan Applications', 'New Business'],
      status: 'scheduled',
    },
    {
      id: 2,
      title: 'Emergency Meeting',
      date: '2024-06-25',
      time: '6:00 PM',
      location: 'Grace\'s Home',
      attendees: 15,
      agenda: ['Urgent Loan Request', 'Policy Review'],
      status: 'scheduled',
    },
  ];

  const pastMeetings = [
    {
      id: 3,
      title: 'May Monthly Meeting',
      date: '2024-05-25',
      time: '2:00 PM',
      location: 'Community Center',
      attendees: 22,
      minutes: 'All contributions collected. 3 loans approved.',
      status: 'completed',
    },
    {
      id: 4,
      title: 'April Planning Meeting',
      date: '2024-04-20',
      time: '1:00 PM',
      location: 'Mary\'s Office',
      attendees: 18,
      minutes: 'New member orientation. Investment strategy discussion.',
      status: 'completed',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Meetings</h2>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Schedule Meeting
        </Button>
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
            {upcomingMeetings.map((meeting) => (
              <div key={meeting.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{meeting.title}</h3>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {meeting.date}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {meeting.time}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {meeting.location}
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {meeting.attendees} expected
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Scheduled
                  </Badge>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Agenda:</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {meeting.agenda.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                
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
            ))}
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
            {pastMeetings.map((meeting) => (
              <div key={meeting.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{meeting.title}</h3>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {meeting.date}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {meeting.time}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {meeting.location}
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {meeting.attendees} attended
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Completed
                  </Badge>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Meeting Minutes:</h4>
                  <p className="text-sm text-gray-600">{meeting.minutes}</p>
                </div>
                
                <div className="flex space-x-3 mt-4">
                  <Button size="sm" variant="outline">
                    View Full Minutes
                  </Button>
                  <Button size="sm" variant="outline">
                    Download Report
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Meetings;
