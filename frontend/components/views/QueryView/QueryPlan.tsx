import React from 'react';
import { QueryData } from '../../../types';

interface QueryPlanProps {
  executionPlan: QueryData['executionPlan'];
}

const QueryPlan = ({ executionPlan }: QueryPlanProps) => {
  return <>{executionPlan?.toString() || 'Plan'}</>;
};

export default QueryPlan;
