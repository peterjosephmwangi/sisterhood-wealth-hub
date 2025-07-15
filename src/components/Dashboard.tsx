import React, { useState } from 'react';
import { DollarSign, Users, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useNextMeeting } from '@/hooks/useNextMeeting';
import { useMonthlyTargets } from '@/hooks/useMonthlyTargets';
import { useInterestProfits } from '@/hooks/useInterestProfits';
import ProcessLoanDialog from '@/components/dashboard/ProcessLoanDialog';
import RecordRepaymentDialog from '@/components/dashboard/RecordRepaymentDialog';
import InterestProfitCard from '@/components/dashboard/InterestProfitCard';
import InterestProfitDialog from '@/components/dashboard/InterestProfitDialog';
import InterestProfitStats from '@/components/dashboard/InterestProfitStats';
import OverduePaymentsAlert from '@/components/dashboard/OverduePaymentsAlert';
import OverduePaymentsReport from '@/components/dashboard/OverduePaymentsReport';

const Dashboard = () => {
  const [showOverdueReport, setShowOverdueReport] = useState(false);
  
  const { stats, loading, refetch } = useDashboardData();
  const { nextMeeting, loading: meetingLoading } = useNextMeeting();
  const { currentTarget, loading: targetLoading } = useMonthlyTargets();
  const { totalInterestProfit, loading: profitLoading } = useInterestProfits();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getNextMeetingInfo = () => {
    if (meetingLoading) {
      return {
        days: 'Loading...',
        info: 'Checking schedule...'
      };
    }
    
    if (!nextMeeting) {
      return {
        days: 'No meeting',
        info: 'No upcoming meetings'
      };
    }

    const daysText = nextMeeting.days_until === 0 ? 'Today' : 
                    nextMeeting.days_until === 1 ? 'Tomorrow' : 
                    `${nextMeeting.days_until} days`;
    
    return {
      days: daysText,
      info: `${formatTime(nextMeeting.meeting_time)} at ${nextMeeting.location}`
    };
  };

  const nextMeetingInfo = getNextMeetingInfo();

  // Calculate progress towards current month target
  const getCurrentMonthProgress = () => {
    if (targetLoading || loading) return '+0% towards target';
    const progress = currentTarget > 0 ? ((stats.totalContributions / currentTarget) * 100) : 0;
    return `${progress.toFixed(1)}% of monthly target`;
  };

  const dashboardStats = [
    {
      title: 'Total Contributions',
      value: loading ? 'Loading...' : formatCurrency(stats.totalContributions),
      change: getCurrentMonthProgress(),
      icon: DollarSign,
      positive: true,
    },
    {
      title: 'Active Members',
      value: loading ? 'Loading...' : stats.activeMembers.toString(),
      change: '+2 new members',
      icon: Users,
      positive: true,
    },
    {
      title: 'Available Loans',
      value: loading ? 'Loading...' : formatCurrency(stats.availableLoanFund),
      change: 'Ready for disbursement',
      icon: TrendingUp,
      positive: true,
    },
    {
      title: 'Next Meeting',
      value: nextMeetingInfo.days,
      change: nextMeetingInfo.info,
      icon: Calendar,
      positive: true,
    },
  ];

  const handleLoanProcessed = () => {
    refetch();
  };

  const handleRepaymentRecorded = () => {
    refetch();
  };

  if (loading || targetLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-600 to-green-600 rounded-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Welcome back, Admin!</h2>
          <p className="text-purple-100">Loading your chama data...</p>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-green-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome back, Admin!</h2>
        <p className="text-purple-100">Here's what's happening with your chama today.</p>
      </div>

      {/* Overdue Payments Alert */}
      <OverduePaymentsAlert onViewDetails={() => setShowOverdueReport(true)} />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="flex items-center mt-4">
                  {stat.positive ? (
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-sm ml-1 ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Interest Profit Statistics */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Interest Profit Overview</h3>
        <InterestProfitStats />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start bg-purple-600 hover:bg-purple-700">
              <DollarSign className="w-4 h-4 mr-2" />
              Record Contribution
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Users className="w-4 h-4 mr-2" />
              Add New Member
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Meeting
            </Button>
            <ProcessLoanDialog onLoanProcessed={handleLoanProcessed} />
            <RecordRepaymentDialog onRepaymentRecorded={handleRepaymentRecorded} />
            <InterestProfitDialog />
          </CardContent>
        </Card>

        {/* Interest Profit Card */}
        <InterestProfitCard />
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentActivities.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent activities</p>
            ) : (
              stats.recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.member_name}</p>
                    <p className="text-sm text-gray-600">{activity.action}</p>
                  </div>
                  <div className="text-right">
                    {activity.amount > 0 && (
                      <p className="font-medium text-green-600">{formatCurrency(activity.amount)}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Overdue Payments Report Dialog */}
      <OverduePaymentsReport 
        open={showOverdueReport} 
        onOpenChange={setShowOverdueReport} 
      />
    </div>
  );
};

export default Dashboard;
