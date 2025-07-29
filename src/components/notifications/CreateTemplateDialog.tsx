
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateNotificationTemplate } from '@/hooks/useNotifications';

interface CreateTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateTemplateDialog = ({ open, onOpenChange }: CreateTemplateDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'both' as 'sms' | 'email' | 'both',
    category: 'general' as 'contribution_reminder' | 'meeting_reminder' | 'loan_reminder' | 'general' | 'dividend_notification' | 'welcome',
    subject: '',
    sms_content: '',
    email_content: '',
  });

  const createTemplate = useCreateNotificationTemplate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTemplate.mutate({
      ...formData,
      is_active: true,
    });
    onOpenChange(false);
    setFormData({
      name: '',
      type: 'both',
      category: 'general',
      subject: '',
      sms_content: '',
      email_content: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Notification Template</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sms">SMS Only</SelectItem>
                  <SelectItem value="email">Email Only</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contribution_reminder">Contribution Reminder</SelectItem>
                <SelectItem value="meeting_reminder">Meeting Reminder</SelectItem>
                <SelectItem value="loan_reminder">Loan Reminder</SelectItem>
                <SelectItem value="dividend_notification">Dividend Notification</SelectItem>
                <SelectItem value="welcome">Welcome</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(formData.type === 'email' || formData.type === 'both') && (
            <div className="space-y-2">
              <Label htmlFor="subject">Email Subject</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Enter email subject"
              />
            </div>
          )}

          {(formData.type === 'sms' || formData.type === 'both') && (
            <div className="space-y-2">
              <Label htmlFor="sms_content">SMS Content</Label>
              <Textarea
                id="sms_content"
                value={formData.sms_content}
                onChange={(e) => setFormData({ ...formData, sms_content: e.target.value })}
                placeholder="Enter SMS message (160 characters max)"
                maxLength={160}
                rows={3}
              />
              <div className="text-sm text-gray-500">
                {formData.sms_content.length}/160 characters
              </div>
            </div>
          )}

          {(formData.type === 'email' || formData.type === 'both') && (
            <div className="space-y-2">
              <Label htmlFor="email_content">Email Content</Label>
              <Textarea
                id="email_content"
                value={formData.email_content}
                onChange={(e) => setFormData({ ...formData, email_content: e.target.value })}
                placeholder="Enter email message (HTML supported)"
                rows={6}
              />
            </div>
          )}

          <div className="text-sm text-gray-600">
            <p className="mb-2">Available variables:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>{'{member_name}'} - Member's name</li>
              <li>{'{target_amount}'} - Target contribution amount</li>
              <li>{'{due_date}'} - Due date</li>
              <li>{'{meeting_date}'} - Meeting date</li>
              <li>{'{meeting_time}'} - Meeting time</li>
              <li>{'{location}'} - Meeting location</li>
              <li>{'{amount_due}'} - Amount due</li>
              <li>{'{dividend_amount}'} - Dividend amount</li>
              <li>{'{contribution_percentage}'} - Contribution percentage</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createTemplate.isPending}>
              {createTemplate.isPending ? 'Creating...' : 'Create Template'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
