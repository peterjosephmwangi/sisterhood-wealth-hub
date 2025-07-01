
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DividendDeclarationDialog } from './dividends/DividendDeclarationDialog';
import { DividendDeclarationsList } from './dividends/DividendDeclarationsList';
import { DividendPaymentsList } from './dividends/DividendPaymentsList';
import { DividendStatsCards } from './dividends/DividendStatsCards';
import { useDividends } from '@/hooks/useDividends';

const Dividends = () => {
  const { dividendDeclarations, loading } = useDividends();
  const [selectedDeclarationId, setSelectedDeclarationId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dividends</h1>
          <p className="text-muted-foreground">
            Manage dividend declarations and payments to members
          </p>
        </div>
        <DividendDeclarationDialog />
      </div>

      <DividendStatsCards declarations={dividendDeclarations} />

      <Tabs defaultValue="declarations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="declarations">Dividend Declarations</TabsTrigger>
          <TabsTrigger value="payments">Member Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="declarations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dividend Declarations</CardTitle>
              <CardDescription>
                View and manage all dividend declarations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DividendDeclarationsList
                declarations={dividendDeclarations}
                loading={loading}
                onSelectDeclaration={setSelectedDeclarationId}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Member Dividend Payments</CardTitle>
              <CardDescription>
                Manage dividend payments to individual members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DividendPaymentsList
                selectedDeclarationId={selectedDeclarationId}
                declarations={dividendDeclarations}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dividends;
