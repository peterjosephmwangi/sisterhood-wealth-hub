
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, Users, Calendar } from 'lucide-react';
import { DividendDeclaration } from '@/hooks/useDividends';

interface DividendStatsCardsProps {
  declarations: DividendDeclaration[];
}

export const DividendStatsCards: React.FC<DividendStatsCardsProps> = ({
  declarations,
}) => {
  const totalDeclarations = declarations.length;
  const totalDividendsAmount = declarations.reduce(
    (sum, declaration) => sum + declaration.total_dividend_amount,
    0
  );
  const paidDeclarations = declarations.filter(d => d.status === 'paid').length;
  const pendingDeclarations = declarations.filter(d => d.status === 'declared' || d.status === 'approved').length;

  const stats = [
    {
      title: 'Total Declarations',
      value: totalDeclarations,
      icon: Calendar,
      description: 'Dividend declarations made',
    },
    {
      title: 'Total Dividends',
      value: `KES ${totalDividendsAmount.toLocaleString()}`,
      icon: DollarSign,
      description: 'Total dividend amount declared',
    },
    {
      title: 'Paid Declarations',
      value: paidDeclarations,
      icon: TrendingUp,
      description: 'Completed dividend payments',
    },
    {
      title: 'Pending Declarations',
      value: pendingDeclarations,
      icon: Users,
      description: 'Awaiting approval or payment',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
