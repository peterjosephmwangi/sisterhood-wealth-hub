
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileText, Download } from 'lucide-react';
import { useFinancialReports } from '@/hooks/useFinancialReports';

const FinancialReports = () => {
  const { generateProfitLossReport, getExpensesByCategory } = useFinancialReports();
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [profitLossData, setProfitLossData] = useState(null);
  const [expensesCategoryData, setExpensesCategoryData] = useState([]);
  const [loading, setLoading] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    
    const [profitLoss, expensesByCategory] = await Promise.all([
      generateProfitLossReport(startDate, endDate),
      getExpensesByCategory(startDate, endDate)
    ]);

    if (profitLoss) {
      setProfitLossData(profitLoss);
    }
    
    if (expensesByCategory) {
      setExpensesCategoryData(expensesByCategory);
    }

    setLoading(false);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C', '#8DD1E1', '#D084D0'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 space-y-2">
          <Label htmlFor="start_date">Start Date</Label>
          <Input
            id="start_date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="flex-1 space-y-2">
          <Label htmlFor="end_date">End Date</Label>
          <Input
            id="end_date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <Button onClick={handleGenerateReport} disabled={loading} className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          {loading ? 'Generating...' : 'Generate Report'}
        </Button>
      </div>

      {profitLossData && (
        <Card>
          <CardHeader>
            <CardTitle>Profit & Loss Statement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Income</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(profitLossData.total_income)}
                </p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(profitLossData.total_expenses)}
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Net Profit</p>
                <p className={`text-2xl font-bold ${profitLossData.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(profitLossData.net_profit)}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Contributions:</span>
                <span>{formatCurrency(profitLossData.total_contributions)}</span>
              </div>
              <div className="flex justify-between">
                <span>Interest Income:</span>
                <span>{formatCurrency(profitLossData.total_interest_income)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-semibold">
                <span>Profit Margin:</span>
                <span>{profitLossData.profit_margin.toFixed(2)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {expensesCategoryData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Expenses by Category (Bar Chart)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={expensesCategoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="category_name" 
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="total_amount" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expenses Distribution (Pie Chart)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expensesCategoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category_name, percent }) => `${category_name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="total_amount"
                    fontSize={10}
                  >
                    {expensesCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {expensesCategoryData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expensesCategoryData.map((category, index) => (
                <div key={category.category_id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded mr-2"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span>{category.category_name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold">{formatCurrency(category.total_amount)}</span>
                    <span className="text-sm text-gray-600 ml-2">({category.expense_count} expenses)</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!profitLossData && !expensesCategoryData.length && (
        <div className="text-center py-8 text-gray-500">
          Select date range and click "Generate Report" to view financial analytics
        </div>
      )}
    </div>
  );
};

export { FinancialReports };
