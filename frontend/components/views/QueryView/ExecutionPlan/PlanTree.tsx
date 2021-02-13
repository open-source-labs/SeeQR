import React from 'react';
import styled from 'styled-components';
import ReactFlow, {
  Background,
  ReactFlowProvider,
  Handle,
  Position,
  NodeProps,
} from 'react-flow-renderer';
import PlanCard from './PlanCard';
import buildFlowGraph from '../../../../lib/flow';
import { ExplainJson, PlanNode } from '../../../../types';
import {DarkPaperFull} from '../../../../style-variables'

type FlowNodeProps = NodeProps<{ plan: PlanNode }>;

const FlowNodeComponent = ({ data: { plan } }: FlowNodeProps) => (
  <div>
    <Handle
      type="target"
      position={Position.Top}
      style={{ visibility: 'hidden' }}
    />
    <PlanCard plan={plan} />
    <Handle
      type="source"
      position={Position.Bottom}
      style={{ visibility: 'hidden' }}
    />
  </div>
);

const TreeContainer = styled(DarkPaperFull)`
  flex:1;
`

interface PlanTreeProps {
  data: ExplainJson | undefined;
}

const PlanTree = ({ data }: PlanTreeProps) => {
  if (!data) return null;
  return (
    <TreeContainer>
      <ReactFlowProvider>
        <ReactFlow
          elements={buildFlowGraph(data.Plan, 'flowNode', 'smoothstep')}
          nodesDraggable={false}
          nodesConnectable={false}
          nodeTypes={{ flowNode: FlowNodeComponent }}
          minZoom={0.1}
        >
          <Background />
        </ReactFlow>
        {/* <FlowControls /> */}
      </ReactFlowProvider>
    </TreeContainer>
  );
};

export default PlanTree;
