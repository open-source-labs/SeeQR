import React from 'react';
import { QueryData } from '../../../types';

interface QuerySummaryProps {
  executionPlan: QueryData['executionPlan'];
}

const QuerySummary = ({ executionPlan }: QuerySummaryProps) => {
  return <div>{executionPlan?.toString()}</div>;
};

export default QuerySummary;
