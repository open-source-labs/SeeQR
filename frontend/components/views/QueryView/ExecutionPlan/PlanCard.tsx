import React, { memo, useState } from 'react';
import styled from 'styled-components';
import { Card, Tooltip, LinearProgress } from '@mui/material';
import ms from 'ms';
import type { SizedPlanNode, Totals } from '../../../../lib/flow';
import PlanDetails from './PlanDetails';
import type { Thresholds } from '../../../../types';

import {
  greyMedium,
  greyPrimary,
  planNodeHeight,
  planNodeWidth,
} from '../../../../style-variables';

const StyledCard = styled(Card)<{ $warn: boolean }>`
  width: ${planNodeWidth};
  height: ${planNodeHeight};
  font-size: 10pt;
  padding: 12px;
  background-color: ${greyMedium};
  display: inline-flex;
  flex-direction: column;
  cursor: pointer;
  border-width: 2px;
  border-style: solid;
  border-color: ${({ $warn }) => ($warn ? 'orange' : 'transparent')};
`;

const Soft = styled.span`
  color: ${greyPrimary};
`;

const DurationBar = styled(LinearProgress)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  border-radius: 50px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  width: 100%;
  margin-bottom: 5px;
`;

const Type = styled.span`
  font-weight: bold;
  letter-spacing: 1.5px;
`;

const Time = styled.span`
  font-size: 0.9em;
`;

const Relation = styled.div`
  font-size: 0.9em;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

const MiniStats = styled.div`
  width: 100%;
  margin-top: auto;
  display: grid;
  grid: 'rows accuracy cost' 1fr / 1fr 1fr 1fr;
  text-align: center;
`;

const Accuracy = styled.span<{ $warn: boolean }>`
  grid-area: 'accuracy';
  ${({ $warn }) => ($warn ? 'color:#e92a2a;' : '')}
`;

const formatTime = (time: number) => ms(parseFloat(time.toPrecision(2)), {
  long: true,
});

const totalTime = (plan: SizedPlanNode) => plan['Actual Total Time'] * (plan['Actual Loops'] ?? 1);

const exclusiveTime = (plan: SizedPlanNode) => {
  const childrenTime = plan.children?.reduce((sum, p) => totalTime(p) + sum, 0) ?? 0;
  return totalTime(plan) - childrenTime;
};

interface PlanCardProps {
  plan: SizedPlanNode;
  totals: Totals;
  thresholds: Thresholds;
}

/**
 * Memoizing predicate. Compares plan id's and prevent rerender if equal
 */
const isSameCard = (prevProps: PlanCardProps, nextProps: PlanCardProps) => prevProps.plan.id === nextProps.plan.id
  && prevProps.thresholds === nextProps.thresholds;

function PlanCard({ plan, totals, thresholds }: PlanCardProps) {
  const [detailIsOpen, setDetailOpen] = useState(false);
  const rowRatio = plan['Plan Rows'] / plan['Actual Rows'];
  const exclusive = exclusiveTime(plan);
  const time = totalTime(plan);
  const exclusiveRatio = +((exclusiveTime(plan) / totals.time) * 100).toFixed(
    2,
  );

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setDetailOpen(true);
  };

  return (
    <>
      <StyledCard
        variant="elevation"
        elevation={3}
        raised
        onClick={handleClick}
        $warn={exclusiveRatio > thresholds.percentDuration}
      >
        <Tooltip title={`Percentage of Execution Time: ${exclusiveRatio}%`}>
          <DurationBar variant="determinate" value={exclusiveRatio} />
        </Tooltip>
        <Header>
          <Tooltip title="Node Type">
            <Type>{plan['Node Type']}</Type>
          </Tooltip>
          <Tooltip title={`Exclusive Time out of ${formatTime(time)} total`}>
            <Time>{formatTime(exclusive)}</Time>
          </Tooltip>
        </Header>
        <Tooltip title="Table">
          <Relation>
            {plan['Relation Name']}
            <Soft>
              {plan.Alias && plan.Alias !== plan['Relation Name']
                ? ` (${plan.Alias})`
                : ''}
            </Soft>
          </Relation>
        </Tooltip>
        <Tooltip title="Join type and condition">
          <Relation>
            {plan['Join Type']}
            <Soft>{` ${plan['Hash Cond'] ?? ''}`}</Soft>
          </Relation>
        </Tooltip>
        <MiniStats>
          <Tooltip title="Actual rows emitted">
            <span style={{ gridArea: 'rows' }}>{plan['Actual Rows']}</span>
          </Tooltip>
          <Tooltip title="Planner estimated rows / actual rows emitted">
            <Accuracy $warn={rowRatio > thresholds.rowsAccuracy}>
              {rowRatio.toFixed(2)}
            </Accuracy>
          </Tooltip>
          <Tooltip title="Execution Cost">
            <span style={{ gridArea: 'cost' }}>
              {(plan['Total Cost'] - plan['Startup Cost']).toFixed(1)}
            </span>
          </Tooltip>
        </MiniStats>
      </StyledCard>
      <PlanDetails
        plan={plan}
        open={detailIsOpen}
        handleClose={() => setDetailOpen(false)}
      />
    </>
  );
}

// memoize cards by id to improve performance on Zoom
export default memo(PlanCard, isSameCard);
