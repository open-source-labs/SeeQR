import React, { useState, memo  } from 'react';
import styled from 'styled-components';
import ReactFlow, { Background } from 'react-flow-renderer';
import buildFlowGraph from '../../../../lib/flow';
import { ExplainJson, Thresholds } from '../../../../types';
import { DarkPaperFull } from '../../../../style-variables';
import FlowControls from './FlowControls';
import nodeTypes from './ExecutionPlanNodeTypes';

interface FlowTreeProps {
  data: ExplainJson;
  thresholds: Thresholds;
}

const FlowTree = ({ data, thresholds }: FlowTreeProps) => {
  const result = buildFlowGraph(data,thresholds,'flowNode','smoothstep');
  return (
    <ReactFlow
      nodes={result.nodes}
      edges={result.edges}
      nodesDraggable={false}
      nodesConnectable={false}
      nodeTypes={nodeTypes}
      minZoom={0.1}
      fitView
      // onLoad={(instance) => instance.fitView({ padding: 0.2 })}
      // improves performance on pan by preventing contant rerenders at the
      // cost of higher startup time
      onlyRenderVisibleElements={false}
    >
      <Background gap={32} />
    </ReactFlow>
)};

// Memoise to prevent rerender on fullscreen toggle
const MemoFlowTree = memo(FlowTree);

// prettier-ignore
const TreeContainer = styled(DarkPaperFull)<{$fullscreen: boolean}>`
${({$fullscreen}) => $fullscreen ? `
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1200;
  width: 100vw;
  height: 100vh;
` : `
  position: relative;
  flex: 1;
`}`;

const defaultThresholds: Thresholds = {
  percentDuration: 30,
  rowsAccuracy: 5,
};

interface PlanTreeProps {
  data: ExplainJson | undefined;
}
const PlanTree = ({ data }: PlanTreeProps) => {
  const [isFullscreen, setFullscreen] = useState(false);
  const [userThresholds, setUserThresholds] = useState(defaultThresholds);

  if (!data) return null;
  return (
    <TreeContainer $fullscreen={isFullscreen}>
      <MemoFlowTree data={data} thresholds={userThresholds} />
      <FlowControls
        toggleFullscreen={() => setFullscreen(!isFullscreen)}
        fullscreen={isFullscreen}
        thresholds={userThresholds}
        setThresholds={setUserThresholds}
      />
    </TreeContainer>
  );
};

export default memo(PlanTree);
