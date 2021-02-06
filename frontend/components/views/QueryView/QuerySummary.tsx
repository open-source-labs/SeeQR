import React from 'react';
import { Query } from '../../../types';

interface QuerySummaryProps {
  executionPlan: Query['executionPlan'];
}

const QuerySummary = ({ executionPlan }: QuerySummaryProps) => {
  return <div>{executionPlan}</div>;
};

export default QuerySummary;
