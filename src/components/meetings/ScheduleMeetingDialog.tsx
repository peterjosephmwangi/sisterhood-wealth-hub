
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';

interface ScheduleMeetingDialogProps {
  onMeetingScheduled: () => void;
}

const ScheduleMeetingDialog = ({ onMeetingScheduled }: ScheduleMeetingDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    meeting_date: '',
    meeting_time: '',
    location: '',
    expected_attendees: '',
    agenda: '',
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.meeting_date || !formData.meeting_time || !formData.location) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Parse agenda items (split by newlines and filter empty lines)
      const agendaItems = formData.agenda
        .split('\n')
        .map(item => item.trim())
        .filter(item => item.length > 0);

      const { error } = await supabase
        .from('meetings')
        .insert({
          title: formData.title,
          meeting_date: formData.meeting_date,
          meeting_time: formData.meeting_time,
          location: formData.location,
          expected_attendees: formData.expected_attendees ? parseInt(formData.expected_attendees) : 0,
          agenda: agendaItems.length > 0 ? agendaItems : null,
          status: 'scheduled',
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Meeting has been scheduled successfully",
      });

      setFormData({
        title: '',
        meeting_date: '',
        meeting_time: '',
        location: '',
        expected_attendees: '',
        agenda: '',
      });
      setOpen(false);
      onMeetingScheduled();
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      toast({
        title: "Error",
        description: "Failed to schedule meeting",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Schedule Meeting
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Schedule New Meeting</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Meeting Title *</Label>
            <Input
              id="title"
              placeholder="Enter meeting title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="meeting_date">Date *</Label>
              <Input
                id="meeting_date"
                type="date"
                value={formData.meeting_date}
                onChange={(e) => setFormData(prev => ({ ...prev, meeting_date: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="meeting_time">Time *</Label>
              <Input
                id="meeting_time"
                type="time"
                value={formData.meeting_time}
                onChange={(e) => setFormData(prev => ({ ...prev, meeting_time: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              placeholder="Enter meeting location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="expected_attendees">Expected Attendees</Label>
            <Input
              id="expected_attendees"
              type="number"
              min="1"
              placeholder="Number of expected attendees"
              value={formData.expected_attendees}
              onChange={(e) => setFormData(prev => ({ ...prev, expected_attendees: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="agenda">Agenda</Label>
            <Textarea
              id="agenda"
              placeholder="Enter agenda items (one per line)"
              value={formData.agenda}
              onChange={(e) => setFormData(prev => ({ ...prev, agenda: e.target.value }))}
              rows={4}
            />
            <p className="text-sm text-gray-500 mt-1">Enter each agenda item on a new line</p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Scheduling...' : 'Schedule Meeting'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleMeetingDialog;
