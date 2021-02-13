// TODO: Add Separator to divide top to bottom 

import React, { useState } from 'react';
import styled from 'styled-components'
import {  Paper } from '@material-ui/core';
import { QueryData, ValidTabs } from '../../../types';
import {
  greyDark,
  defaultMargin,
  sidebarWidth,
} from '../../../style-variables';

import TabSelector from './TabSelector';
import QueryResults from './QueryResults';
import PlanTree from './ExecutionPlan/PlanTree'

const tableWidth = `calc(100vw - (${defaultMargin} * 3) - ${sidebarWidth})`;

const StyledPaper = styled(({ ...other }) => (
  <Paper elevation={8} {...other} />
))`
  background: ${greyDark};
  min-width: ${tableWidth};
  width: ${tableWidth};
`;

interface QueryTabsProps {
  results: QueryData['returnedRows'];
  executionPlan: QueryData['executionPlan'];
}

const QueryTabs = ({ results, executionPlan }: QueryTabsProps) => {
  const [selectedTab, setSelectedTab] = useState<ValidTabs>('Results');

  if (!results && !executionPlan) return null
  return (
    <div>
      <TabSelector
        selectedTab={selectedTab}
        select={(tab: ValidTabs) => setSelectedTab(tab)}
      />
      <StyledPaper>
        {selectedTab === 'Results' ? <QueryResults results={results} /> : null}
        {selectedTab === 'Execution Plan' ? (
          <PlanTree data={executionPlan} />
        ) : null}
      </StyledPaper>
    </div>
  );
};

export default QueryTabs;
