import React, { useState } from 'react';
import { Query } from '../../../types';

import QueryResults from './QueryResults';
import QueryPlan from './QueryPlan';

type ValidTabs = 'Results' | 'Execution Plan';

interface TabSelectorProps {
  selectedTab: ValidTabs;
  select: (tab: ValidTabs) => void;
}

const TabSelector = ({ selectedTab, select }: TabSelectorProps) => {
  const tabs: ValidTabs[] = ['Results', 'Execution Plan'];

  return (
    <div>
      {tabs.map((tab: ValidTabs) => (
        <button type="button" onClick={() => select(tab)} key={`querytab_${tab}`}>
          {`${tab}${selectedTab === tab ? ' <' : ''}`}
        </button>
      ))}
    </div>
  );
};

interface QueryTabsProps {
  results: Query['returnedRows'];
  executionPlan: Query['executionPlan'];
}

const QueryTabs = ({ results, executionPlan }: QueryTabsProps) => {
  const [selectedTab, setSelectedTab] = useState<ValidTabs>('Results');

  return (
    <div>
      <TabSelector
        selectedTab={selectedTab}
        select={(tab: ValidTabs) => setSelectedTab(tab)}
      />
      <div>
        {selectedTab === 'Results' ? <QueryResults results={results} /> : null}
        {selectedTab === 'Execution Plan' ? (
          <QueryPlan executionPlan={executionPlan} />
        ) : null}
      </div>
    </div>
  );
};

export default QueryTabs;
