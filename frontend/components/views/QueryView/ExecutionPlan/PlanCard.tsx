import React, { memo } from 'react';
import styled from 'styled-components';
import { Card, CardContent, Typography } from '@material-ui/core';
import ms from 'ms';
import type { SizedPlanNode } from '../../../../lib/flow';

import { greyPrimary } from '../../../../style-variables';

const StyledCard = styled(Card)`
  width: 200px;
  display: inline-grid;
  background-color: ${greyPrimary};
`;

interface PlanCardProps {
  plan: SizedPlanNode;
}

/**
 * Memoizing predicate. Compares plan id's and prevent rerender if equal
 */
const isSameCard = (prevProps: PlanCardProps, nextProps: PlanCardProps) =>
  prevProps.plan.id === nextProps.plan.id;

const PlanCard = ({ plan }: PlanCardProps) => (
  <StyledCard variant="elevation" elevation={3} raised>
    <CardContent>
      <Typography gutterBottom variant="body1">
        <strong>{plan['Node Type']}</strong>
      </Typography>
      <Typography variant="caption">
        {/* // TODO: extract formatting */}
        {ms(parseFloat(plan['Actual Total Time'].toPrecision(3)), {
          long: true,
        })}
      </Typography>
      <Typography>
        {plan['Relation Name']}
        {plan.Alias && plan.Alias !== plan['Relation Name']
          ? ` (${plan.Alias})`
          : ''}
      </Typography>
    </CardContent>
  </StyledCard>
);

// memoize cards by id to improve performance on Zoom
export default memo(PlanCard, isSameCard);
