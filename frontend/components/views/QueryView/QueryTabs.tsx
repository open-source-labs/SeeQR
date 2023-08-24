import React, { useState } from 'react';
import styled from 'styled-components';
import { ReactFlowProvider } from 'reactflow';

import { QueryData, ValidTabs } from '../../../types';

import TabSelector from './TabSelector';
import QueryResults from './QueryResults';
import PlanTree from './ExecutionPlan/PlanTree';
import { sidebarWidth, defaultMargin } from '../../../style-variables';

const ToggleDisplay = styled.div<{ $isSelected: boolean }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 200px;
  flex: 1;

  /* Hide unselected tab. This allows us to keep the execution plan always
  rendered and toggle it visible via css, which prevents it's expesive rendering
  from triggering too often */

  /* Remove component from document flow to prevent scrolling if it is a long
  table of results */

  /* Define estimated width so fitView triggered inside TabSelector is close to accurate */

  /* define height to prevent react-flow warnings. Ignored due to flex:1 0 */
  ${({ $isSelected }) => ($isSelected
    ? ''
    : `
    position:fixed;
    visibility: hidden;
    width: calc(100vw - ${sidebarWidth} - (${defaultMargin} * 2));
    z-index: -1
  `)}
`;

interface QueryTabsProps {
  results: QueryData['returnedRows'];
  executionPlan: QueryData['executionPlan'];
}

function QueryTabs({ results, executionPlan }: QueryTabsProps) {
  const [selectedTab, setSelectedTab] = useState<ValidTabs>('Results');

  if (!results && !executionPlan) return null;
  return (
    <ReactFlowProvider>
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
    </ReactFlowProvider>
  );
}

export default QueryTabs;
