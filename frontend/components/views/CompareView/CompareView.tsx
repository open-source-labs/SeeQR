import React from 'react';
import { AppState } from '../../../types';

import CompareChart from './CompareChart';
import CompareTable from './CompareTable';

interface CompareViewProps {
  queries: AppState['queries'];
  show: boolean;
}

function CompareView({ queries, show }: CompareViewProps) {
  if (!show) return null;
  return (
    <div>
      <CompareChart queries={queries} />
      <CompareTable queries={queries} />
    </div>
  );
}

export default CompareView;
