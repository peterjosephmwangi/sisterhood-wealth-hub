
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Mail, MessageSquare, User } from 'lucide-react';
import { useMemberCommunicationPreferences, useUpdateMemberCommunicationPreference } from '@/hooks/useNotifications';

const MemberPreferences = () => {
  const { data: preferences, isLoading } = useMemberCommunicationPreferences();
  const updatePreference = useUpdateMemberCommunicationPreference();

  const handlePreferenceChange = (memberId: string, field: string, value: boolean) => {
    updatePreference.mutate({
      member_id: memberId,
      [field]: value,
    });
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading member preferences...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Member Communication Preferences</h2>

      <div className="space-y-4">
        {preferences?.map((pref: any) => (
          <Card key={pref.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-50">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{pref.members?.name || 'Unknown Member'}</CardTitle>
                    <div className="flex gap-2 mt-1">
                      {pref.members?.email && (
                        <Badge variant="outline" className="text-xs">
                          <Mail className="h-3 w-3 mr-1" />
                          {pref.members.email}
                        </Badge>
                      )}
                      {pref.members?.phone && (
                        <Badge variant="outline" className="text-xs">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          {pref.members.phone}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Communication Channels</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`sms-${pref.id}`} className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          SMS Notifications
                        </Label>
                        <Switch
                          id={`sms-${pref.id}`}
                          checked={pref.sms_enabled}
                          onCheckedChange={(checked) => 
                            handlePreferenceChange(pref.member_id, 'sms_enabled', checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`email-${pref.id}`} className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email Notifications
                        </Label>
                        <Switch
                          id={`email-${pref.id}`}
                          checked={pref.email_enabled}
                          onCheckedChange={(checked) => 
                            handlePreferenceChange(pref.member_id, 'email_enabled', checked)
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Notification Types</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`contrib-${pref.id}`} className="text-sm">
                          Contribution Reminders
                        </Label>
                        <Switch
                          id={`contrib-${pref.id}`}
                          checked={pref.contribution_reminders}
                          onCheckedChange={(checked) => 
                            handlePreferenceChange(pref.member_id, 'contribution_reminders', checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`meeting-${pref.id}`} className="text-sm">
                          Meeting Reminders
                        </Label>
                        <Switch
                          id={`meeting-${pref.id}`}
                          checked={pref.meeting_reminders}
                          onCheckedChange={(checked) => 
                            handlePreferenceChange(pref.member_id, 'meeting_reminders', checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`loan-${pref.id}`} className="text-sm">
                          Loan Reminders
                        </Label>
                        <Switch
                          id={`loan-${pref.id}`}
                          checked={pref.loan_reminders}
                          onCheckedChange={(checked) => 
                            handlePreferenceChange(pref.member_id, 'loan_reminders', checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`dividend-${pref.id}`} className="text-sm">
                          Dividend Notifications
                        </Label>
                        <Switch
                          id={`dividend-${pref.id}`}
                          checked={pref.dividend_notifications}
                          onCheckedChange={(checked) => 
                            handlePreferenceChange(pref.member_id, 'dividend_notifications', checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`general-${pref.id}`} className="text-sm">
                          General Notifications
                        </Label>
                        <Switch
                          id={`general-${pref.id}`}
                          checked={pref.general_notifications}
                          onCheckedChange={(checked) => 
                            handlePreferenceChange(pref.member_id, 'general_notifications', checked)
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {preferences?.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No member preferences configured yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MemberPreferences;
