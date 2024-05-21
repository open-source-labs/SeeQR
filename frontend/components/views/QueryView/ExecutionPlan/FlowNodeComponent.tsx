import React from 'react';
import { Position, NodeProps, Handle } from 'reactflow';
import PlanCard from './PlanCard';
import { SizedPlanNode, Totals } from '../../../../lib/flow';
import { Thresholds } from '../../../../../shared/types/types';

type FlowNodeProps = NodeProps<{
  plan: SizedPlanNode;
  totals: Totals;
  thresholds: Thresholds;
}>;

function FlowNodeComponent({
  data: { plan, totals, thresholds },
}: FlowNodeProps) {
  return (
    <div>
      <Handle
        type="target"
        position={Position.Top}
        style={{ visibility: 'hidden' }}
      />
      <PlanCard plan={plan} totals={totals} thresholds={thresholds} />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ visibility: 'hidden' }}
      />
    </div>
  );
}

export default FlowNodeComponent;
