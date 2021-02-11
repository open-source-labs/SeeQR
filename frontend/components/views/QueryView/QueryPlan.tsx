import React from 'react';
import styled from 'styled-components';
import { QueryData } from '../../../types';

import PlanTree from './ExecutionPlan/PlanTree';

const TreeContainer = styled.div`
  padding: 20px;
`;

interface QueryPlanProps {
  executionPlan: QueryData['executionPlan'];
}

const QueryPlan = ({ executionPlan }: QueryPlanProps) => {
  if (!executionPlan) return null;
  return (
    <TreeContainer>
      <PlanTree data={executionPlan} />
    </TreeContainer>
  );
};

export default QueryPlan;
