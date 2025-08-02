
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Phone, 
  Mail,
  UserPlus,
  UserCheck
} from 'lucide-react';
import { useMembers } from '@/hooks/useMembers';
import AddMemberDialog from './members/AddMemberDialog';
import InviteMemberDialog from './members/InviteMemberDialog';
import MemberInvitations from './members/MemberInvitations';
import EditMemberDialog from './members/EditMemberDialog';
import DeleteMemberDialog from './members/DeleteMemberDialog';
import SuspendMemberDialog from './members/SuspendMemberDialog';
import MemberContextMenu from './members/MemberContextMenu';
import { format } from 'date-fns';

const Members = () => {
  const { members, loading, fetchMembers } = useMembers();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.phone.includes(searchTerm) ||
    (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>;
      case 'inactive':
        return <Badge variant="outline">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleMemberAction = (member: any, action: string) => {
    setSelectedMember(member);
    switch (action) {
      case 'edit':
        setEditDialogOpen(true);
        break;
      case 'delete':
        setDeleteDialogOpen(true);
        break;
      case 'suspend':
        setSuspendDialogOpen(true);
        break;
    }
  };

  const handleDialogClose = () => {
    setSelectedMember(null);
    setEditDialogOpen(false);
    setDeleteDialogOpen(false);
    setSuspendDialogOpen(false);
    fetchMembers();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Members</h1>
          <p className="text-gray-600 mt-1">Manage your chama group members</p>
        </div>
      </div>

      <Tabs defaultValue="active-members" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="active-members" className="flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            Active Members
          </TabsTrigger>
          <TabsTrigger value="invitations" className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Invitations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active-members" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Members Directory
                  </CardTitle>
                  <CardDescription>
                    {loading ? 'Loading...' : `${filteredMembers.length} members found`}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <AddMemberDialog onMemberAdded={fetchMembers} />
                  <InviteMemberDialog />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, phone, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading members...</p>
                  </div>
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No members found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm ? 'Try adjusting your search terms.' : 'Start by adding your first member.'}
                  </p>
                  {!searchTerm && <AddMemberDialog onMemberAdded={fetchMembers} />}
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Join Date</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMembers.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium">{member.name}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-sm">
                                <Phone className="w-3 h-3 text-gray-400" />
                                {member.phone}
                              </div>
                              {member.email && (
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                  <Mail className="w-3 h-3 text-gray-400" />
                                  {member.email}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(member.status)}</TableCell>
                          <TableCell>{format(new Date(member.join_date), 'MMM d, yyyy')}</TableCell>
                          <TableCell>
                            <MemberContextMenu 
                              member={member} 
                              onAction={handleMemberAction}
                              onMemberUpdated={fetchMembers}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invitations">
          <MemberInvitations />
        </TabsContent>
      </Tabs>

      {selectedMember && (
        <>
          <EditMemberDialog
            member={selectedMember}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onMemberUpdated={handleDialogClose}
          />
          <DeleteMemberDialog
            member={selectedMember}
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onMemberUpdated={handleDialogClose}
          />
          <SuspendMemberDialog
            member={selectedMember}
            open={suspendDialogOpen}
            onOpenChange={setSuspendDialogOpen}
            onMemberUpdated={handleDialogClose}
          />
        </>
      )}
    </div>
  );
};

export default Members;
