
import React, { useState } from 'react';
import { Search, Phone, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import AddMemberDialog from '@/components/members/AddMemberDialog';
import MemberContextMenu from '@/components/members/MemberContextMenu';
import { useMembers } from '@/hooks/useMembers';
import { useMemberContributions } from '@/hooks/useMemberContributions';

const Members = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { members, loading: membersLoading, refetch: refetchMembers } = useMembers();
  const { memberContributions, loading: contributionsLoading, refetch: refetchContributions } = useMemberContributions();

  const handleMemberUpdated = () => {
    refetchMembers();
    refetchContributions();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getMemberContributions = (memberId: string) => {
    const total = memberContributions[memberId] || 0;
    return formatCurrency(total);
  };

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.phone.includes(searchTerm) ||
    (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (membersLoading || contributionsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Members Management</h2>
          <AddMemberDialog onMemberAdded={handleMemberUpdated} />
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Members Management</h2>
        <AddMemberDialog onMemberAdded={handleMemberUpdated} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Members ({members.length})</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredMembers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {members.length === 0 ? 'No members found. Add your first member!' : 'No members match your search.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-purple-100 text-purple-600 font-semibold">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900">{member.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Phone className="w-3 h-3 mr-1" />
                          {member.phone}
                        </div>
                        {member.email && (
                          <div className="flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {member.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{getMemberContributions(member.id)}</p>
                      <p className="text-xs text-gray-500">Total Contributions</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        member.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : member.status === 'inactive'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">Since {new Date(member.join_date).toLocaleDateString()}</p>
                    </div>
                    <MemberContextMenu member={member} onMemberUpdated={handleMemberUpdated} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Members;
