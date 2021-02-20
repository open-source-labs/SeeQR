import React, { memo } from 'react';
import styled from 'styled-components';
import { Card, Tooltip } from '@material-ui/core';
import ms from 'ms';
import type { SizedPlanNode } from '../../../../lib/flow';

import {
  greyMedium,
  greyPrimary,
  greenPrimary,
  planNodeHeight,
  planNodeWidth,
} from '../../../../style-variables';

const StyledCard = styled(Card)`
  width: ${planNodeWidth};
  height: ${planNodeHeight};
  font-size: 10pt;
  padding: 12px;
  background-color: ${greyMedium};
  display: inline-flex;
  flex-direction: column;
`;

const Soft = styled.span`
  color: ${greyPrimary};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  width: 100%;
  margin-bottom: 5px;
`;

const Type = styled.span`
  font-size: 1.2em;
  font-weight: bold;
  letter-spacing: 1.5px;
`;

const Time = styled(Soft)`
  font-size: 0.9em;
`;

const Relation = styled.div``;

const MiniStats = styled.div`
  width: 100%;
  margin-top: auto;
  display: grid;
  grid: 'rows accuracy cost' 1fr / 1fr 1fr 1fr;
  text-align: center;
`;

const formatTime = (time: number) =>
  ms(parseFloat(time.toPrecision(2)), {
    long: true,
  });

interface PlanCardProps {
  plan: SizedPlanNode;
}

/**
 * Memoizing predicate. Compares plan id's and prevent rerender if equal
 */
const isSameCard = (prevProps: PlanCardProps, nextProps: PlanCardProps) =>
  prevProps.plan.id === nextProps.plan.id;

const PlanCard = ({ plan }: PlanCardProps) => {
  const rowRatio = plan['Plan Rows'] / plan['Actual Rows'];

  return (
    <StyledCard variant="elevation" elevation={3} raised>
      <Header>
        <Tooltip title="Node Type">
          <Type>{plan['Node Type']}</Type>
        </Tooltip>
        <Tooltip title="Actual Total Time">
          <Time>{formatTime(plan['Actual Total Time'])}</Time>
        </Tooltip>
      </Header>
      <Tooltip title="Target of operation">
        <Relation>
          {plan['Relation Name']}
          <Soft>
            {plan.Alias && plan.Alias !== plan['Relation Name']
              ? ` (${plan.Alias})`
              : ''}
          </Soft>
        </Relation>
      </Tooltip>
      <MiniStats>
        <Tooltip title="Actual rows emitted">
          <span style={{ gridArea: 'rows' }}>{plan['Actual Rows']}</span>
        </Tooltip>
        <Tooltip title="Planner estimated rows / actual rows emitted">
          <span style={{ gridArea: 'accuracy' }}>{rowRatio.toFixed(2)}</span>
        </Tooltip>
        <Tooltip title="Total Cost">
          <span style={{ gridArea: 'cost' }}>{plan['Total Cost']}</span>
        </Tooltip>
      </MiniStats>
    </StyledCard>
  );
};

// memoize cards by id to improve performance on Zoom
export default memo(PlanCard, isSameCard);
