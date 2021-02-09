import React, { useState } from 'react';
import { Container } from '@material-ui/core';
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

  return (
    <div>
      <TabSelector
        selectedTab={selectedTab}
        select={(tab: ValidTabs) => setSelectedTab(tab)}
      />
      <Container>
        {selectedTab === 'Results' ? <QueryResults results={results} /> : null}
        {selectedTab === 'Execution Plan' ? (
          <QueryPlan executionPlan={executionPlan} />
        ) : null}
      </Container>
    </div>
  );
};

export default QueryTabs;
