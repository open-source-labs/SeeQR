import React from 'react';
import { QueryData } from '../../../types';

interface QueryResultsProps {
  results: QueryData['returnedRows'];
}

const QueryResults = ({ results }: QueryResultsProps) => {
  return <>{results?.toString() || 'results'}</>;
};

export default QueryResults;
