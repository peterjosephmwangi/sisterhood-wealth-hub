
import React from 'react';
import RecordContributionDialog from './RecordContributionDialog';
import SetTargetDialog from './SetTargetDialog';

interface ContributionHeaderProps {
  onContributionRecorded: () => void;
  onTargetUpdated?: () => void;
}

const ContributionHeader = ({ onContributionRecorded, onTargetUpdated }: ContributionHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Contributions</h1>
        <p className="text-gray-600 mt-1">Track and manage member contributions</p>
      </div>
      <div className="flex gap-2 w-full sm:w-auto">
        <div className="flex-1 sm:flex-initial">
          <SetTargetDialog onTargetUpdated={onTargetUpdated} />
        </div>
        <RecordContributionDialog onContributionRecorded={onContributionRecorded} />
      </div>
    </div>
  );
};

export default ContributionHeader;
