import React, { useState, useEffect } from 'react';
import { Plus, Filter, Download, Calendar, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

type ContributionWithMember = Tables<'contributions'> & {
  members: {
    name: string;
  } | null;
};

const Contributions = () => {
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [contributions, setContributions] = useState<ContributionWithMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthlyTarget] = useState(120000); // KSh 120,000
  const [currentMonthTotal, setCurrentMonthTotal] = useState(0);
  const { toast } = useToast();

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

  const progress = (currentMonthTotal / monthlyTarget) * 100;

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Contributions</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Loading contributions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Contributions</h2>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Record Contribution
          </Button>
        </div>
      </div>

      {/* Monthly Progress */}
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

      {/* Filters and Stats */}
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

      {/* Contributions List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent Contributions</CardTitle>
            <div className="flex items-center space-x-3">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  <SelectItem value="june">June 2024</SelectItem>
                  <SelectItem value="may">May 2024</SelectItem>
                  <SelectItem value="april">April 2024</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
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
    </div>
  );
};

export default Contributions;
