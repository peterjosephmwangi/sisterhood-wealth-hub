
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useInterestProfits } from '@/hooks/useInterestProfits';

const InterestProfitStats = () => {
  const { totalInterestProfit, memberProfits, loading } = useInterestProfits();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate additional statistics
  const totalLoansWithProfit = memberProfits.filter(p => p.interest_profit_earned > 0).length;
  const averageInterestRate = memberProfits.length > 0 
    ? memberProfits.reduce((sum, p) => sum + p.interest_rate, 0) / memberProfits.length 
    : 0;
  const highestProfit = memberProfits.length > 0 
    ? Math.max(...memberProfits.map(p => p.interest_profit_earned))
    : 0;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Interest Profit',
      value: formatCurrency(totalInterestProfit),
      description: 'Total profit from all loans',
      color: 'text-green-600',
    },
    {
      title: 'Profitable Loans',
      value: totalLoansWithProfit.toString(),
      description: 'Loans generating profit',
      color: 'text-blue-600',
    },
    {
      title: 'Average Interest Rate',
      value: `${averageInterestRate.toFixed(1)}%`,
      description: 'Across all loans',
      color: 'text-purple-600',
    },
    {
      title: 'Highest Profit',
      value: formatCurrency(highestProfit),
      description: 'From a single loan',
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
              <p className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default InterestProfitStats;
