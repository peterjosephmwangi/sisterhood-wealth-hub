
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, Eye } from 'lucide-react';
import { useInterestProfits } from '@/hooks/useInterestProfits';

const InterestProfitDialog = () => {
  const [open, setOpen] = useState(false);
  const { memberProfits, loading } = useInterestProfits();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'repaid':
        return 'text-green-600 bg-green-100';
      case 'active':
        return 'text-blue-600 bg-blue-100';
      case 'overdue':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <Eye className="w-4 h-4 mr-2" />
          View Interest Profits
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
            Interest Profit Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="overflow-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading interest profit data...</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Principal</TableHead>
                  <TableHead>Interest Rate</TableHead>
                  <TableHead>Expected Interest</TableHead>
                  <TableHead>Profit Earned</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {memberProfits.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No interest profit data available
                    </TableCell>
                  </TableRow>
                ) : (
                  memberProfits.map((profit, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{profit.member_name}</TableCell>
                      <TableCell>{formatCurrency(profit.principal_amount)}</TableCell>
                      <TableCell>{profit.interest_rate}%</TableCell>
                      <TableCell>{formatCurrency(profit.total_interest_expected)}</TableCell>
                      <TableCell className="font-medium text-green-600">
                        {formatCurrency(profit.interest_profit_earned)}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(profit.status)}`}>
                          {profit.status}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(profit.loan_date).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InterestProfitDialog;
