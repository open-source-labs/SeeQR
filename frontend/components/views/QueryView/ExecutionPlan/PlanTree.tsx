import React from 'react';
import { Tree, TreeNode } from 'react-organizational-chart';

import PlanCard from './PlanCard';
import { PlanNode, ExplainJson } from '../../../../types';
import { greenPrimary } from '../../../../style-variables';


interface PlanTreeNodeProps {
  plan: PlanNode;
}

const PlanTreeNode = ({ plan }: PlanTreeNodeProps) => (
  <TreeNode label={<PlanCard plan={plan} />}>
    {plan.Plans?.map((child) => (
      <PlanTreeNode plan={child} />
    ))}
  </TreeNode>
);

interface PlanTreeProps {
  data: ExplainJson;
}

const PlanTree = ({ data }: PlanTreeProps) => (
  <Tree
    lineWidth="2px"
    lineColor={`${greenPrimary}`}
    lineBorderRadius="10px"
    label={<PlanCard plan={data.Plan} />}
  >
    {data?.Plan?.Plans?.map((plan) => (
      <PlanTreeNode plan={plan} />
    ))}
  </Tree>
);

export default PlanTree;
