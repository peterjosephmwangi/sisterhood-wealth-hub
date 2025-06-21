
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tables } from '@/integrations/supabase/types';
import ContributionFilters from './ContributionFilters';

type ContributionWithMember = Tables<'contributions'> & {
  members: {
    name: string;
  } | null;
};

interface ContributionsListProps {
  contributions: ContributionWithMember[];
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  formatCurrency: (amount: number) => string;
  getStatusColor: (status: string) => string;
  formatPaymentMethod: (method: string) => string;
}

const ContributionsList = ({ 
  contributions, 
  selectedMonth, 
  setSelectedMonth, 
  formatCurrency, 
  getStatusColor, 
  formatPaymentMethod 
}: ContributionsListProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Recent Contributions</CardTitle>
          <ContributionFilters 
            selectedMonth={selectedMonth} 
            setSelectedMonth={setSelectedMonth} 
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {contributions.map((contribution) => (
            <div key={contribution.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">
                  {contribution.members?.name || 'Unknown Member'}
                </h3>
                <p className="text-sm text-gray-600">
                  {new Date(contribution.contribution_date).toLocaleDateString()} • {formatPaymentMethod(contribution.payment_method)}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="font-semibold text-green-600">
                  {formatCurrency(contribution.amount)}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(contribution.status)}`}>
                  {contribution.status.charAt(0).toUpperCase() + contribution.status.slice(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ContributionsList;
