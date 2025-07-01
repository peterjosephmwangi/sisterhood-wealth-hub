
import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { DividendDeclaration, useDividends } from '@/hooks/useDividends';

interface DividendPaymentsListProps {
  selectedDeclarationId: string | null;
  declarations: DividendDeclaration[];
}

export const DividendPaymentsList: React.FC<DividendPaymentsListProps> = ({
  selectedDeclarationId,
  declarations,
}) => {
  const {
    memberDividends,
    fetchMemberDividendsByDeclaration,
    updateMemberDividendPayment,
  } = useDividends();

  const [currentDeclarationId, setCurrentDeclarationId] = useState<string>(
    selectedDeclarationId || ''
  );
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedMemberDividend, setSelectedMemberDividend] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentReference, setPaymentReference] = useState('');

  useEffect(() => {
    if (selectedDeclarationId) {
      setCurrentDeclarationId(selectedDeclarationId);
    }
  }, [selectedDeclarationId]);

  useEffect(() => {
    if (currentDeclarationId) {
      fetchMemberDividendsByDeclaration(currentDeclarationId);
    }
  }, [currentDeclarationId]);

  const handleMarkAsPaid = (memberDividend: any) => {
    setSelectedMemberDividend(memberDividend);
    setPaymentDialogOpen(true);
  };

  const handlePaymentConfirm = async () => {
    if (!selectedMemberDividend) return;

    await updateMemberDividendPayment(
      selectedMemberDividend.id,
      'paid',
      paymentMethod,
      paymentReference
    );

    setPaymentDialogOpen(false);
    setSelectedMemberDividend(null);
    setPaymentMethod('');
    setPaymentReference('');
  };

  const getPaymentStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "outline",
      paid: "secondary",
      failed: "destructive",
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Label htmlFor="declaration-select">Select Declaration:</Label>
        <Select value={currentDeclarationId} onValueChange={setCurrentDeclarationId}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Select a dividend declaration" />
          </SelectTrigger>
          <SelectContent>
            {declarations.map((declaration) => (
              <SelectItem key={declaration.id} value={declaration.id}>
                {new Date(declaration.declaration_date).toLocaleDateString()} - 
                KES {declaration.total_dividend_amount.toLocaleString()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {currentDeclarationId && memberDividends.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Contribution</TableHead>
              <TableHead>Percentage</TableHead>
              <TableHead>Dividend Amount</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {memberDividends.map((memberDividend: any) => (
              <TableRow key={memberDividend.id}>
                <TableCell>{memberDividend.members?.name || 'Unknown'}</TableCell>
                <TableCell>
                  KES {memberDividend.member_contribution_amount.toLocaleString()}
                </TableCell>
                <TableCell>
                  {memberDividend.contribution_percentage.toFixed(2)}%
                </TableCell>
                <TableCell>
                  KES {memberDividend.dividend_amount.toLocaleString()}
                </TableCell>
                <TableCell>
                  {getPaymentStatusBadge(memberDividend.payment_status)}
                </TableCell>
                <TableCell>
                  {memberDividend.payment_status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => handleMarkAsPaid(memberDividend)}
                    >
                      Mark as Paid
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : currentDeclarationId ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No member dividends found for this declaration.</p>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Select a dividend declaration to view member payments.</p>
        </div>
      )}

      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
            <DialogDescription>
              Mark dividend payment as paid for {selectedMemberDividend?.members?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="payment-method">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="m_pesa">M-Pesa</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="payment-reference">Payment Reference (Optional)</Label>
              <Input
                id="payment-reference"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="Enter payment reference or transaction ID"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePaymentConfirm} disabled={!paymentMethod}>
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
