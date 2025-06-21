
import React from 'react';
import { DollarSign, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ContributionStatsGridProps {
  currentMonthTotal: number;
  averagePerMember: number;
  paymentRate: number;
  formatCurrency: (amount: number) => string;
}

const ContributionStatsGrid = ({ 
  currentMonthTotal, 
  averagePerMember, 
  paymentRate, 
  formatCurrency 
}: ContributionStatsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(currentMonthTotal)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average/Member</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(averagePerMember)}</p>
            </div>
            <Calendar className="w-8 h-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Payment Rate</p>
              <p className="text-2xl font-bold text-gray-900">{paymentRate.toFixed(0)}%</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 font-bold">✓</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContributionStatsGrid;
