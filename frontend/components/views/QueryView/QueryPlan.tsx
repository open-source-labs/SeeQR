import React from 'react';
import { Query } from '../../../types';

interface QueryPlanProps {
  executionPlan: Query['executionPlan'];
}

const QueryPlan = ({ executionPlan }: QueryPlanProps) => {
  return <>{executionPlan || 'Plan'}</>;
};

export default QueryPlan;
