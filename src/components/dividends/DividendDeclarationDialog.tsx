
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useDividends, DividendCalculation } from '@/hooks/useDividends';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const DividendDeclarationDialog = () => {
  const [open, setOpen] = useState(false);
  const [periodStart, setPeriodStart] = useState<Date>();
  const [periodEnd, setPeriodEnd] = useState<Date>();
  const [totalDividend, setTotalDividend] = useState('');
  const [notes, setNotes] = useState('');
  const [calculations, setCalculations] = useState<DividendCalculation[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const { createDividendDeclaration, calculateDividends, loading } = useDividends();

  const handleCalculatePreview = async () => {
    if (!periodStart || !periodEnd || !totalDividend) return;

    const results = await calculateDividends(
      format(periodStart, 'yyyy-MM-dd'),
      format(periodEnd, 'yyyy-MM-dd'),
      parseFloat(totalDividend)
    );
    
    setCalculations(results);
    setShowPreview(true);
  };

  const handleSubmit = async () => {
    if (!periodStart || !periodEnd || !totalDividend) return;

    try {
      await createDividendDeclaration({
        declaration_date: format(new Date(), 'yyyy-MM-dd'),
        dividend_period_start: format(periodStart, 'yyyy-MM-dd'),
        dividend_period_end: format(periodEnd, 'yyyy-MM-dd'),
        total_dividend_amount: parseFloat(totalDividend),
        dividend_per_share: 0, // Will be calculated based on contributions
        calculation_method: 'contribution_based',
        status: 'declared',
        notes,
      });

      // Reset form
      setPeriodStart(undefined);
      setPeriodEnd(undefined);
      setTotalDividend('');
      setNotes('');
      setCalculations([]);
      setShowPreview(false);
      setOpen(false);
    } catch (error) {
      console.error('Error creating dividend declaration:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Declare Dividend
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Declare New Dividend</DialogTitle>
          <DialogDescription>
            Create a new dividend declaration for the specified period
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="period-start">Period Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !periodStart && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {periodStart ? format(periodStart, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={periodStart}
                    onSelect={setPeriodStart}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="period-end">Period End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !periodEnd && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {periodEnd ? format(periodEnd, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={periodEnd}
                    onSelect={setPeriodEnd}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="total-dividend">Total Dividend Amount (KES)</Label>
            <Input
              id="total-dividend"
              type="number"
              value={totalDividend}
              onChange={(e) => setTotalDividend(e.target.value)}
              placeholder="Enter total dividend amount"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter any additional notes"
              rows={3}
            />
          </div>

          {!showPreview && (
            <Button
              onClick={handleCalculatePreview}
              disabled={!periodStart || !periodEnd || !totalDividend}
              variant="outline"
            >
              Preview Dividend Distribution
            </Button>
          )}

          {showPreview && calculations.length > 0 && (
            <div className="space-y-2">
              <Label>Dividend Distribution Preview</Label>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Contributions</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Dividend Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {calculations.map((calc) => (
                      <TableRow key={calc.member_id}>
                        <TableCell>{calc.member_name}</TableCell>
                        <TableCell>KES {calc.member_contribution.toLocaleString()}</TableCell>
                        <TableCell>{calc.contribution_percentage.toFixed(2)}%</TableCell>
                        <TableCell>KES {calc.dividend_amount.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!showPreview || calculations.length === 0 || loading}
          >
            {loading ? 'Creating...' : 'Create Declaration'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
