
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MessageSquare, CheckCircle, XCircle, Activity } from 'lucide-react';
import { useNotificationStats } from '@/hooks/useNotifications';

const NotificationStats = () => {
  const { data: stats, isLoading } = useNotificationStats();

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading notification stats...</div>;
  }

  const statCards = [
    {
      title: 'Total Sent',
      value: stats?.total_sent || 0,
      icon: <Mail className="h-5 w-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Delivered',
      value: stats?.total_delivered || 0,
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Failed',
      value: stats?.total_failed || 0,
      icon: <XCircle className="h-5 w-5" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'SMS Sent',
      value: stats?.sms_sent || 0,
      icon: <MessageSquare className="h-5 w-5" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Email Sent',
      value: stats?.email_sent || 0,
      icon: <Mail className="h-5 w-5" />,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      title: 'Recent Activity',
      value: stats?.recent_activity_count || 0,
      icon: <Activity className="h-5 w-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Last 7 days',
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Notification Statistics</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <div className={stat.color}>{stat.icon}</div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.description && (
                <p className="text-xs text-gray-600 mt-1">{stat.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Delivery Success Rate</span>
                <span className="font-medium">
                  {stats?.total_sent 
                    ? Math.round((stats.total_delivered / stats.total_sent) * 100) 
                    : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ 
                    width: `${stats?.total_sent 
                      ? (stats.total_delivered / stats.total_sent) * 100 
                      : 0}%` 
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Channel Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-orange-600" />
                  <span>SMS</span>
                </div>
                <span className="font-medium">{stats?.sms_sent || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-indigo-600" />
                  <span>Email</span>
                </div>
                <span className="font-medium">{stats?.email_sent || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotificationStats;
