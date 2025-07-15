
import React, { useState } from 'react';
import { X, Phone, Mail, Calendar, AlertTriangle, DollarSign } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useOverduePayments } from '@/hooks/useOverduePayments';

interface OverduePaymentsReportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const OverduePaymentsReport = ({ open, onOpenChange }: OverduePaymentsReportProps) => {
  const { overdueLoans, missingContributions, summary, loading } = useOverduePayments();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE');
  };

  const getSeverityBadge = (daysOverdue: number) => {
    if (daysOverdue <= 7) return <Badge variant="secondary">Recently Overdue</Badge>;
    if (daysOverdue <= 30) return <Badge variant="destructive">Overdue</Badge>;
    return <Badge className="bg-red-700">Severely Overdue</Badge>;
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <div className="text-center py-8">
            <div className="text-gray-500">Loading report...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span>Overdue Payments Report</span>
          </DialogTitle>
        </DialogHeader>

        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-red-800">Overdue Loans</p>
                  <p className="text-lg font-bold text-red-900">
                    {summary.overdue_loans_count} ({formatCurrency(summary.overdue_loans_total_amount)})
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Missing Contributions</p>
                  <p className="text-lg font-bold text-yellow-900">{summary.members_missing_contributions_count} members</p>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Monthly Collection</p>
                  <p className="text-lg font-bold text-blue-900">{summary.collection_percentage.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <Tabs defaultValue="loans" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="loans">
              Overdue Loans ({overdueLoans.length})
            </TabsTrigger>
            <TabsTrigger value="contributions">
              Missing Contributions ({missingContributions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="loans" className="space-y-4">
            {overdueLoans.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No overdue loans found
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Loan Amount</TableHead>
                      <TableHead>Balance Due</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Days Overdue</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overdueLoans.map((loan) => (
                      <TableRow key={loan.loan_id}>
                        <TableCell className="font-medium">{loan.member_name}</TableCell>
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center space-x-1 text-sm">
                              <Phone className="w-3 h-3" />
                              <span>{loan.member_phone}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(loan.loan_amount)}</TableCell>
                        <TableCell className="font-semibold text-red-600">
                          {formatCurrency(loan.balance_due)}
                        </TableCell>
                        <TableCell>{formatDate(loan.due_date)}</TableCell>
                        <TableCell>{loan.days_overdue} days</TableCell>
                        <TableCell>
                          {getSeverityBadge(loan.days_overdue)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="contributions" className="space-y-4">
            {missingContributions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                All members have contributed this month
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Last Contribution</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Days Since</TableHead>
                      <TableHead>Total Contributions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {missingContributions.map((member) => (
                      <TableRow key={member.member_id}>
                        <TableCell className="font-medium">{member.member_name}</TableCell>
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center space-x-1 text-sm">
                              <Phone className="w-3 h-3" />
                              <span>{member.member_phone}</span>
                            </div>
                            {member.member_email && (
                              <div className="flex items-center space-x-1 text-sm">
                                <Mail className="w-3 h-3" />
                                <span>{member.member_email}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {member.last_contribution_date 
                            ? formatDate(member.last_contribution_date)
                            : 'Never'
                          }
                        </TableCell>
                        <TableCell>
                          {member.last_contribution_amount 
                            ? formatCurrency(member.last_contribution_amount)
                            : '-'
                          }
                        </TableCell>
                        <TableCell>
                          {member.days_since_last_contribution 
                            ? `${member.days_since_last_contribution} days`
                            : '-'
                          }
                        </TableCell>
                        <TableCell>{formatCurrency(member.total_contributions)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button>
            Export Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OverduePaymentsReport;
