
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import { useMonthlyTargets } from '@/hooks/useMonthlyTargets';
import ContributionHeader from './contributions/ContributionHeader';
import ContributionProgressCard from './contributions/ContributionProgressCard';
import ContributionStatsGrid from './contributions/ContributionStatsGrid';
import ContributionsList from './contributions/ContributionsList';

type ContributionWithMember = Tables<'contributions'> & {
  members: {
    name: string;
  } | null;
};

const Contributions = () => {
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [contributions, setContributions] = useState<ContributionWithMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonthTotal, setCurrentMonthTotal] = useState(0);
  const { toast } = useToast();
  const { currentTarget, loading: targetLoading, refetch: refetchTarget } = useMonthlyTargets();

  useEffect(() => {
    fetchContributions();
    fetchCurrentMonthTotal();
  }, []);

  const fetchContributions = async () => {
    try {
      const { data, error } = await supabase
        .from('contributions')
        .select(`
          *,
          members (
            name
          )
        `)
        .order('contribution_date', { ascending: false });

      if (error) throw error;
      setContributions(data || []);
    } catch (error) {
      console.error('Error fetching contributions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch contributions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentMonthTotal = async () => {
    try {
      const currentDate = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .rpc('get_monthly_contributions_total', { target_month: currentDate });
      
      setCurrentMonthTotal(data || 0);
    } catch (error) {
      console.error('Error fetching monthly total:', error);
    }
  };

  const handleContributionRecorded = () => {
    fetchContributions();
    fetchCurrentMonthTotal();
  };

  const handleTargetUpdated = () => {
    refetchTarget();
  };

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
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPaymentMethod = (method: string) => {
    switch (method) {
      case 'm_pesa':
        return 'M-Pesa';
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'cash':
        return 'Cash';
      default:
        return method;
    }
  };

  const confirmedContributions = contributions.filter(c => c.status === 'confirmed');
  const averagePerMember = confirmedContributions.length > 0 ? currentMonthTotal / new Set(confirmedContributions.map(c => c.member_id)).size : 0;
  const paymentRate = contributions.length > 0 ? (confirmedContributions.length / contributions.length) * 100 : 100;

  if (loading || targetLoading) {
    return (
      <div className="space-y-6">
        <ContributionHeader 
          onContributionRecorded={handleContributionRecorded}
          onTargetUpdated={handleTargetUpdated}
        />
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Loading contributions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ContributionHeader 
        onContributionRecorded={handleContributionRecorded}
        onTargetUpdated={handleTargetUpdated}
      />

      <ContributionProgressCard
        monthlyTarget={currentTarget}
        currentMonthTotal={currentMonthTotal}
        formatCurrency={formatCurrency}
      />

      <ContributionStatsGrid
        currentMonthTotal={currentMonthTotal}
        averagePerMember={averagePerMember}
        paymentRate={paymentRate}
        formatCurrency={formatCurrency}
      />

      <ContributionsList
        contributions={contributions}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        formatCurrency={formatCurrency}
        getStatusColor={getStatusColor}
        formatPaymentMethod={formatPaymentMethod}
      />
    </div>
  );
};

export default Contributions;
