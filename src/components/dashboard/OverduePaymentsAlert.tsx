
import React from 'react';
import { AlertTriangle, Clock, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useOverduePayments } from '@/hooks/useOverduePayments';

interface OverduePaymentsAlertProps {
  onViewDetails: () => void;
}

const OverduePaymentsAlert = ({ onViewDetails }: OverduePaymentsAlertProps) => {
  const { overdueLoans, missingContributions, summary, loading } = useOverduePayments();

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
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-gray-500">Loading overdue payments...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasOverdueItems = (overdueLoans.length > 0) || (missingContributions.length > 0);

  if (!hasOverdueItems) {
    return (
      <Card className="border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-green-800">All Payments Up to Date</h3>
              <p className="text-sm text-green-600">No overdue loans or missing contributions</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-red-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-red-800">
          <AlertTriangle className="w-5 h-5" />
          <span>Overdue Payments Alert</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {overdueLoans.length > 0 && (
          <Alert className="border-orange-200 bg-orange-50">
            <Clock className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <div>
                <strong>{overdueLoans.length} overdue loans</strong> totaling{' '}
                <strong>{formatCurrency(summary?.overdue_loans_total_amount || 0)}</strong>
              </div>
              <Badge variant="destructive">{overdueLoans.length}</Badge>
            </AlertDescription>
          </Alert>
        )}

        {missingContributions.length > 0 && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <Users className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <div>
                <strong>{missingContributions.length} members</strong> haven't contributed this month
              </div>
              <Badge variant="secondary">{missingContributions.length}</Badge>
            </AlertDescription>
          </Alert>
        )}

        {summary && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Monthly Collection:</span>
              <p className="font-medium">
                {summary.collection_percentage.toFixed(1)}% of target
              </p>
            </div>
            <div>
              <span className="text-gray-600">Collected:</span>
              <p className="font-medium">
                {formatCurrency(summary.current_month_collected)} / {formatCurrency(summary.total_expected_monthly_target)}
              </p>
            </div>
          </div>
        )}

        <Button onClick={onViewDetails} className="w-full" variant="outline">
          View Detailed Report
        </Button>
      </CardContent>
    </Card>
  );
};

export default OverduePaymentsAlert;
