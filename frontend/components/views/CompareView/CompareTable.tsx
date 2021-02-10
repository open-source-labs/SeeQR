import React from 'react';
import { AppState } from '../../../types';

interface CompareTableProps {
  queries: AppState['queries'];
}

const CompareTable = ({ queries }: CompareTableProps) => {
  return <div>Compare Table</div>;
};

export default CompareTable;
