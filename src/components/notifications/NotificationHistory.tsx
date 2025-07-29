
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, MessageSquare, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useNotificationHistory } from '@/hooks/useNotifications';
import { format } from 'date-fns';

const NotificationHistory = () => {
  const { data: history, isLoading } = useNotificationHistory();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading notification history...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Notification History</h2>

      <div className="space-y-4">
        {history?.map((notification) => (
          <Card key={notification.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {notification.type === 'email' ? (
                    <Mail className="h-5 w-5 text-blue-600" />
                  ) : (
                    <MessageSquare className="h-5 w-5 text-orange-600" />
                  )}
                  <div>
                    <CardTitle className="text-lg">
                      {notification.subject || `${notification.type.toUpperCase()} Notification`}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      To: {notification.recipient}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(notification.status)}
                  <Badge className={getStatusColor(notification.status)}>
                    {notification.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm">{notification.content}</p>
                </div>
                
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>
                    Created: {format(new Date(notification.created_at), 'MMM dd, yyyy HH:mm')}
                  </span>
                  {notification.sent_at && (
                    <span>
                      Sent: {format(new Date(notification.sent_at), 'MMM dd, yyyy HH:mm')}
                    </span>
                  )}
                  {notification.delivered_at && (
                    <span>
                      Delivered: {format(new Date(notification.delivered_at), 'MMM dd, yyyy HH:mm')}
                    </span>
                  )}
                </div>

                {notification.error_message && (
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-sm text-red-700">
                      Error: {notification.error_message}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {history?.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No notifications sent yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default NotificationHistory;
