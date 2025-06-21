
import React from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ContributionFiltersProps {
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
}

const ContributionFilters = ({ selectedMonth, setSelectedMonth }: ContributionFiltersProps) => {
  return (
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
  );
};

export default ContributionFilters;
