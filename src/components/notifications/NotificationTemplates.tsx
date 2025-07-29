
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import { useNotificationTemplates, useUpdateNotificationTemplate } from '@/hooks/useNotifications';
import { CreateTemplateDialog } from './CreateTemplateDialog';
import { EditTemplateDialog } from './EditTemplateDialog';
import { ViewTemplateDialog } from './ViewTemplateDialog';

const NotificationTemplates = () => {
  const { data: templates, isLoading } = useNotificationTemplates();
  const updateTemplate = useUpdateNotificationTemplate();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const handleToggleActive = (template: any) => {
    updateTemplate.mutate({
      id: template.id,
      is_active: !template.is_active,
    });
  };

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

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading notification templates...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Notification Templates</h2>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates?.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="space-y-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleActive(template)}
                  className="p-1"
                >
                  {template.is_active ? (
                    <ToggleRight className="h-5 w-5 text-green-600" />
                  ) : (
                    <ToggleLeft className="h-5 w-5 text-gray-400" />
                  )}
                </Button>
              </div>
              <div className="flex gap-2">
                <Badge className={getCategoryColor(template.category)}>
                  {template.category.replace('_', ' ')}
                </Badge>
                <Badge className={getTypeColor(template.type)}>
                  {template.type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {template.is_active ? 'Active' : 'Inactive'}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setViewDialogOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setEditDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CreateTemplateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <EditTemplateDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        template={selectedTemplate}
      />

      <ViewTemplateDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        template={selectedTemplate}
      />
    </div>
  );
};

export default NotificationTemplates;
