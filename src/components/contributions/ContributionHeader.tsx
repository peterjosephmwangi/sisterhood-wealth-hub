
import React from 'react';
import { Plus, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ContributionHeader = () => {
  return (
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
  );
};

export default ContributionHeader;
