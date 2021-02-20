import React, { useState, memo } from 'react';
import styled from 'styled-components';
import ReactFlow, {
  Background,
  Handle,
  Position,
  NodeProps,
} from 'react-flow-renderer';
import PlanCard from './PlanCard';
import buildFlowGraph, { SizedPlanNode, Totals } from '../../../../lib/flow';
import { ExplainJson } from '../../../../types';
import { DarkPaperFull } from '../../../../style-variables';
import FlowControls from './FlowControls';

type FlowNodeProps = NodeProps<{ plan: SizedPlanNode; totals: Totals }>;

const FlowNodeComponent = ({ data: { plan, totals } }: FlowNodeProps) => (
  <div>
    <Handle
      type="target"
      position={Position.Top}
      style={{ visibility: 'hidden' }}
    />
    <PlanCard plan={plan} totals={totals} />
    <Handle
      type="source"
      position={Position.Bottom}
      style={{ visibility: 'hidden' }}
    />
  </div>
);

const FlowTree = ({ data }: { data: ExplainJson }) => (
  <ReactFlow
    elements={buildFlowGraph(data, 'flowNode', 'smoothstep')}
    nodesDraggable={false}
    nodesConnectable={false}
    nodeTypes={{ flowNode: FlowNodeComponent }}
    minZoom={0.1}
    onLoad={(instance) => instance.fitView({ padding: 0.2 })}
    // improves performance on pan by preventing contant rerenders at the
    // cost of higher startup time
    onlyRenderVisibleElements={false}
  >
    <Background gap={32} />
  </ReactFlow>
);

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

interface PlanTreeProps {
  data: ExplainJson | undefined;
}
// TODO: spinner for large trees
const PlanTree = ({ data }: PlanTreeProps) => {
  const [isFullscreen, setFullscreen] = useState(false);

  if (!data) return null;
  return (
    <TreeContainer $fullscreen={isFullscreen}>
      <MemoFlowTree data={data} />
      <FlowControls
        toggleFullscreen={() => setFullscreen(!isFullscreen)}
        fullscreen={isFullscreen}
      />
    </TreeContainer>
  );
};

export default memo(PlanTree);
