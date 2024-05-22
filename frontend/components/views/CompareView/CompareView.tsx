import React from 'react';
import { AppState } from '../../../../shared/types/types';
import CompareChart from './CompareChart';
import CompareTable from './CompareTable';

interface CompareViewProps {
  queries: AppState['queries'];
  show: boolean;
}

// compare view literally shows the compared view of the statistics of the queries.
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
