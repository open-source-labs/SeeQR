// TODO: Add Separator to divide top to bottom

import React, { useState } from 'react';
import styled from 'styled-components';
import { Paper } from '@material-ui/core';
import { QueryData, ValidTabs } from '../../../types';
import { greyDark, tableWidth, DarkPaperFull } from '../../../style-variables';

import TabSelector from './TabSelector';
import QueryResults from './QueryResults';
import PlanTree from './ExecutionPlan/PlanTree';

interface QueryTabsProps {
  results: QueryData['returnedRows'];
  executionPlan: QueryData['executionPlan'];
}

const QueryTabs = ({ results, executionPlan }: QueryTabsProps) => {
  const [selectedTab, setSelectedTab] = useState<ValidTabs>('Results');

  if (!results && !executionPlan) return null;
  return (
    <>
      <TabSelector
        selectedTab={selectedTab}
        select={(tab: ValidTabs) => setSelectedTab(tab)}
      />
      {selectedTab === 'Results' ? <QueryResults results={results} /> : null}
      {selectedTab === 'Execution Plan' ? (
        <PlanTree data={executionPlan} />
      ) : null}
    </>
  );
};

export default QueryTabs;
