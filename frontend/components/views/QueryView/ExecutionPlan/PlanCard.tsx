import React from 'react';
import styled from 'styled-components';
import { Card, CardContent, CardActions, Typography } from '@material-ui/core';
import ms from 'ms';
import { PlanNode } from '../../../../types';
import { greyPrimary } from '../../../../style-variables';

const StyledCard = styled(Card)`
  width: 200px;
  display: inline-grid;
  background-color: ${greyPrimary};
`;

interface PlanCardProps {
  plan: PlanNode;
}

const PlanCard = ({ plan }: PlanCardProps) => (
  <>
    <StyledCard variant="elevation" elevation={3} raised>
      <CardContent>
        <Typography gutterBottom variant='body1'><strong>{plan['Node Type']}</strong></Typography>
        <Typography variant='caption'>
          {/* // TODO: extract formatting */}
          {ms(parseFloat(plan['Actual Total Time'].toPrecision(3)), {
            long: true,
          })}
        </Typography>
        <Typography>
          {plan['Relation Name']}
          {plan.Alias && plan.Alias !== plan['Relation Name'] ? ` (${plan.Alias})` : ''}
        </Typography>
      </CardContent>
      {/* <CardActions></CardActions> */}
    </StyledCard>
  </>
);
export default PlanCard;
