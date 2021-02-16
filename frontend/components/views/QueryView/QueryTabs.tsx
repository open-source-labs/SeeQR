// TODO: Add Separator to divide top to bottom

import React, { useState } from 'react';
import styled from 'styled-components';
import { QueryData, ValidTabs } from '../../../types';

import TabSelector from './TabSelector';
import QueryResults from './QueryResults';
import PlanTree from './ExecutionPlan/PlanTree';

const ToggleDisplay = styled.div<{ $isSelected: boolean }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  flex: 1;

  /* Hide unselected tab. This allows us to keep the execution plan always
  rendered and toggle it visible via css, which prevents it's expesive rendering
  from triggering too often */

  /* Remove component from document flow to prevent scrolling if it is a long
  table of results */

  /* define height to prevent react-flow warnings. Ignored due to flex:1 0 */
  ${({ $isSelected }) => ($isSelected ? '' : `
    position:fixed;
    visibility: hidden;
    width:1px;
    height: 1px;
    z-index: -1
  `)}
  
`;

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
      <ToggleDisplay $isSelected={selectedTab === 'Results'}>
        <QueryResults results={results} />
      </ToggleDisplay>
      <ToggleDisplay $isSelected={selectedTab === 'Execution Plan'}>
        <PlanTree data={executionPlan} />
      </ToggleDisplay>
    </>
  );
};

export default QueryTabs;
