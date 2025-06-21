
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ContributionProgressCardProps {
  monthlyTarget: number;
  currentMonthTotal: number;
  formatCurrency: (amount: number) => string;
}

const ContributionProgressCard = ({ 
  monthlyTarget, 
  currentMonthTotal, 
  formatCurrency 
}: ContributionProgressCardProps) => {
  const progress = (currentMonthTotal / monthlyTarget) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Monthly Target</span>
            <span className="font-semibold">{formatCurrency(monthlyTarget)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-purple-600 to-green-600 h-3 rounded-full transition-all duration-300" 
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Collected: {formatCurrency(currentMonthTotal)}</span>
            <span className="text-sm font-medium text-green-600">{progress.toFixed(1)}% Complete</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContributionProgressCard;
