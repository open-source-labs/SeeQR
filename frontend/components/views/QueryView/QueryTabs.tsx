// TODO: Add Separator to divide top to bottom 

import React, { useState } from 'react';
import { Box } from '@material-ui/core';
import { QueryData, ValidTabs } from '../../../types';

import TabSelector from './TabSelector';
import QueryResults from './QueryResults';
import QueryPlan from './QueryPlan';

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
      <Box border={0}>
        {selectedTab === 'Results' ? <QueryResults results={results} /> : null}
        {selectedTab === 'Execution Plan' ? (
          <QueryPlan executionPlan={executionPlan} />
        ) : null}
      </Box>
    </div>
  );
};

export default QueryTabs;
