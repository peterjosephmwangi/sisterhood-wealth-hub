
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign } from 'lucide-react';
import { useInterestProfits } from '@/hooks/useInterestProfits';

const InterestProfitCard = () => {
  const { totalInterestProfit, memberProfits, loading } = useInterestProfits();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
            Interest Profit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="text-gray-500">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
          Interest Profit
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Total Interest Profit */}
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Total Interest Profit</p>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(totalInterestProfit)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Recent Profitable Loans */}
          <div>
            <h4 className="font-medium text-sm mb-3">Recent Profitable Loans</h4>
            <div className="space-y-2">
              {memberProfits.slice(0, 3).map((profit, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{profit.member_name}</p>
                    <p className="text-sm text-gray-600">
                      {formatCurrency(profit.principal_amount)} at {profit.interest_rate}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">
                      {formatCurrency(profit.interest_profit_earned)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(profit.loan_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {memberProfits.length === 0 && (
                <p className="text-gray-500 text-center py-2">No profitable loans yet</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InterestProfitCard;
