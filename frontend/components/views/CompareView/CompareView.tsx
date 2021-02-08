import React from 'react';
import { AppState } from '../../../types';

import CompareChart from './CompareChart';
import CompareTable from './CompareTable';

interface CompareViewProps {
  queries: AppState['queries'];
}

const CompareView = ({ queries }: CompareViewProps) => (
  <div>
    Compare
    <CompareTable queries={queries} />
    <CompareChart queries={queries} />
  </div>
);

export default CompareView;
