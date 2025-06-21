
import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RecordContributionDialog from './RecordContributionDialog';

interface ContributionHeaderProps {
  onContributionRecorded: () => void;
}

const ContributionHeader = ({ onContributionRecorded }: ContributionHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-gray-900">Contributions</h2>
      <div className="flex space-x-3">
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
        <RecordContributionDialog onContributionRecorded={onContributionRecorded} />
      </div>
    </div>
  );
};

export default ContributionHeader;
