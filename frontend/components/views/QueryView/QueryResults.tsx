import React from 'react';
import { Query } from '../../../types';

interface QueryResultsProps {
  results: Query['returnedRows'];
}

const QueryResults = ({ results }: QueryResultsProps) => {
  return <>{results || 'results'}</>;
};

export default QueryResults;
