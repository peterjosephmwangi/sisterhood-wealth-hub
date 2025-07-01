
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { DividendDeclaration, useDividends } from '@/hooks/useDividends';

interface DividendDeclarationsListProps {
  declarations: DividendDeclaration[];
  loading: boolean;
  onSelectDeclaration: (id: string) => void;
}

export const DividendDeclarationsList: React.FC<DividendDeclarationsListProps> = ({
  declarations,
  loading,
  onSelectDeclaration,
}) => {
  const { updateDividendStatus } = useDividends();

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      declared: "outline",
      approved: "default",
      paid: "secondary",
      cancelled: "destructive",
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleStatusUpdate = async (declarationId: string, newStatus: string) => {
    await updateDividendStatus(declarationId, newStatus);
  };

  if (loading) {
    return <div>Loading dividend declarations...</div>;
  }

  if (declarations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No dividend declarations found.</p>
        <p className="text-sm text-muted-foreground">Create your first dividend declaration to get started.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Declaration Date</TableHead>
          <TableHead>Period</TableHead>
          <TableHead>Total Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {declarations.map((declaration) => (
          <TableRow key={declaration.id}>
            <TableCell>
              {format(new Date(declaration.declaration_date), 'PPP')}
            </TableCell>
            <TableCell>
              {format(new Date(declaration.dividend_period_start), 'MMM dd')} - {' '}
              {format(new Date(declaration.dividend_period_end), 'MMM dd, yyyy')}
            </TableCell>
            <TableCell>
              KES {declaration.total_dividend_amount.toLocaleString()}
            </TableCell>
            <TableCell>
              {getStatusBadge(declaration.status)}
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => onSelectDeclaration(declaration.id)}
                  >
                    View Payments
                  </DropdownMenuItem>
                  {declaration.status === 'declared' && (
                    <DropdownMenuItem
                      onClick={() => handleStatusUpdate(declaration.id, 'approved')}
                    >
                      Approve
                    </DropdownMenuItem>
                  )}
                  {declaration.status === 'approved' && (
                    <DropdownMenuItem
                      onClick={() => handleStatusUpdate(declaration.id, 'paid')}
                    >
                      Mark as Paid
                    </DropdownMenuItem>
                  )}
                  {declaration.status !== 'cancelled' && declaration.status !== 'paid' && (
                    <DropdownMenuItem
                      onClick={() => handleStatusUpdate(declaration.id, 'cancelled')}
                      className="text-destructive"
                    >
                      Cancel
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
