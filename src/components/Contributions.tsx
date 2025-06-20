
import React, { useState } from 'react';
import { Plus, Filter, Download, Calendar, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Contributions = () => {
  const [selectedMonth, setSelectedMonth] = useState('all');

  const contributions = [
    {
      id: 1,
      member: 'Grace Wanjiku',
      amount: 5000,
      date: '2024-06-15',
      method: 'M-Pesa',
      status: 'Confirmed',
    },
    {
      id: 2,
      member: 'Mary Kamau',
      amount: 5000,
      date: '2024-06-14',
      method: 'Bank Transfer',
      status: 'Confirmed',
    },
    {
      id: 3,
      member: 'Sarah Muthoni',
      amount: 5000,
      date: '2024-06-13',
      method: 'Cash',
      status: 'Confirmed',
    },
    {
      id: 4,
      member: 'Joyce Njeri',
      amount: 5000,
      date: '2024-06-12',
      method: 'M-Pesa',
      status: 'Pending',
    },
  ];

  const monthlyTarget = 120000; // KSh 120,000
  const currentMonth = contributions.reduce((sum, contrib) => sum + contrib.amount, 0);
  const progress = (currentMonth / monthlyTarget) * 100;

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
          <CardTitle>June 2024 Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Monthly Target</span>
              <span className="font-semibold">KSh {monthlyTarget.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-purple-600 to-green-600 h-3 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Collected: KSh {currentMonth.toLocaleString()}</span>
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
                <p className="text-2xl font-bold text-gray-900">KSh {currentMonth.toLocaleString()}</p>
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
                <p className="text-2xl font-bold text-gray-900">KSh {(currentMonth / 4).toLocaleString()}</p>
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
                <p className="text-2xl font-bold text-gray-900">100%</p>
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
                  <h3 className="font-medium text-gray-900">{contribution.member}</h3>
                  <p className="text-sm text-gray-600">{contribution.date} • {contribution.method}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="font-semibold text-green-600">
                    KSh {contribution.amount.toLocaleString()}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    contribution.status === 'Confirmed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {contribution.status}
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
