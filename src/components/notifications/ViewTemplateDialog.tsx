
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Mail, MessageSquare } from 'lucide-react';

interface ViewTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: any;
}

export const ViewTemplateDialog = ({ open, onOpenChange, template }: ViewTemplateDialogProps) => {
  if (!template) return null;

  const getCategoryColor = (category: string) => {
    const colors = {
      contribution_reminder: 'bg-blue-100 text-blue-800',
      meeting_reminder: 'bg-green-100 text-green-800',
      loan_reminder: 'bg-yellow-100 text-yellow-800',
      dividend_notification: 'bg-purple-100 text-purple-800',
      welcome: 'bg-pink-100 text-pink-800',
      general: 'bg-gray-100 text-gray-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeColor = (type: string) => {
    const colors = {
      sms: 'bg-orange-100 text-orange-800',
      email: 'bg-indigo-100 text-indigo-800',
      both: 'bg-teal-100 text-teal-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{template.name}</DialogTitle>
            <div className="flex gap-2">
              <Badge className={getCategoryColor(template.category)}>
                {template.category.replace('_', ' ')}
              </Badge>
              <Badge className={getTypeColor(template.type)}>
                {template.type}
              </Badge>
              <Badge variant={template.is_active ? 'default' : 'secondary'}>
                {template.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {(template.type === 'sms' || template.type === 'both') && template.sms_content && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  SMS Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">{template.sms_content}</p>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  {template.sms_content.length}/160 characters
                </div>
              </CardContent>
            </Card>
          )}

          {(template.type === 'email' || template.type === 'both') && template.email_content && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                {template.subject && (
                  <div className="mb-4">
                    <Label className="font-medium">Subject:</Label>
                    <p className="text-sm bg-gray-50 p-2 rounded">{template.subject}</p>
                  </div>
                )}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div dangerouslySetInnerHTML={{ __html: template.email_content }} />
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Available Variables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <code>{'{member_name}'}</code>
                <code>{'{target_amount}'}</code>
                <code>{'{due_date}'}</code>
                <code>{'{meeting_date}'}</code>
                <code>{'{meeting_time}'}</code>
                <code>{'{location}'}</code>
                <code>{'{amount_due}'}</code>
                <code>{'{dividend_amount}'}</code>
                <code>{'{contribution_percentage}'}</code>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
