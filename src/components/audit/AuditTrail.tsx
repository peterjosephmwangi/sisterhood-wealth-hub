
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Search, Filter } from 'lucide-react';
import { useAuditTrail, AuditLogEntry } from '@/hooks/useAuditTrail';
import { formatDistanceToNow } from 'date-fns';

const AuditTrail = () => {
  const { auditLogs, loading, fetchAuditTrail } = useAuditTrail();
  const [searchTerm, setSearchTerm] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');

  const handleRefresh = () => {
    fetchAuditTrail();
  };

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEntity = entityFilter === 'all' || log.entity_type === entityFilter;
    const matchesAction = actionFilter === 'all' || log.action.toLowerCase().includes(actionFilter.toLowerCase());

    return matchesSearch && matchesEntity && matchesAction;
  });

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('create') || action.includes('add')) return 'default';
    if (action.includes('update') || action.includes('edit')) return 'secondary';
    if (action.includes('delete') || action.includes('remove')) return 'destructive';
    return 'outline';
  };

  const formatJsonPreview = (obj: any) => {
    if (!obj) return 'N/A';
    try {
      const str = JSON.stringify(obj, null, 2);
      return str.length > 100 ? str.substring(0, 100) + '...' : str;
    } catch {
      return 'Invalid JSON';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Trail</h1>
          <p className="text-muted-foreground">
            Track all system activities and changes
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
          <CardDescription>
            Filter audit logs by search term, entity type, or action
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Entity Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                <SelectItem value="members">Members</SelectItem>
                <SelectItem value="contributions">Contributions</SelectItem>
                <SelectItem value="loans">Loans</SelectItem>
                <SelectItem value="meetings">Meetings</SelectItem>
                <SelectItem value="dividends">Dividends</SelectItem>
              </SelectContent>
            </Select>

            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Action Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>
            Showing {filteredLogs.length} of {auditLogs.length} activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              Loading audit trail...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No audit logs found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Changes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">
                        <div>
                          {new Date(log.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{log.user_name}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getActionBadgeVariant(log.action)}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{log.entity_type}</div>
                        {log.entity_id && (
                          <div className="text-xs text-muted-foreground font-mono">
                            ID: {log.entity_id.slice(0, 8)}...
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        {log.old_values && (
                          <div className="mb-2">
                            <span className="text-xs font-medium text-red-600">Before:</span>
                            <pre className="text-xs bg-red-50 p-1 rounded mt-1 overflow-hidden">
                              {formatJsonPreview(log.old_values)}
                            </pre>
                          </div>
                        )}
                        {log.new_values && (
                          <div>
                            <span className="text-xs font-medium text-green-600">After:</span>
                            <pre className="text-xs bg-green-50 p-1 rounded mt-1 overflow-hidden">
                              {formatJsonPreview(log.new_values)}
                            </pre>
                          </div>
                        )}
                        {!log.old_values && !log.new_values && (
                          <span className="text-muted-foreground text-sm">No changes recorded</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditTrail;
