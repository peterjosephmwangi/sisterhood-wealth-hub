
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExpenseTracker } from './financial/ExpenseTracker';
import { BudgetManager } from './financial/BudgetManager';
import { FinancialReports } from './financial/FinancialReports';
import { FinancialOverview } from './financial/FinancialOverview';

const Financial = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financial Management</h1>
        <p className="text-muted-foreground">
          Manage expenses, budgets, and generate financial reports
        </p>
      </div>

      <FinancialOverview />

      <Tabs defaultValue="expenses" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="expenses">Expense Tracking</TabsTrigger>
          <TabsTrigger value="budgets">Budget Management</TabsTrigger>
          <TabsTrigger value="reports">Financial Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Expense Tracking</CardTitle>
              <CardDescription>
                Record and manage all chama expenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExpenseTracker />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budgets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget Management</CardTitle>
              <CardDescription>
                Set and monitor budgets for different expense categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BudgetManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Reports</CardTitle>
              <CardDescription>
                Generate comprehensive financial reports and analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FinancialReports />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Financial;
