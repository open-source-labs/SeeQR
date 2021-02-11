import React from 'react';
import styled from 'styled-components';
import { Card, CardContent, CardActions, Typography } from '@material-ui/core';
import ms from 'ms';
import { PlanNode } from '../../../../types';

const StyledCard = styled(Card)`
  width: 200px;
  display: inline-grid;
`;

interface PlanCardProps {
  plan: PlanNode;
}

const PlanCard = ({ plan }: PlanCardProps) => (
  <>
    <StyledCard variant="elevation" elevation={3} raised>
      <CardContent>
        <Typography gutterBottom>{plan['Node Type']}</Typography>
        <Typography>
          {/* // TODO: extract formatting */}
          {ms(parseFloat(plan['Actual Total Time'].toPrecision(3)), {
            long: true,
          })}
        </Typography>
        <Typography>
          {plan['Relation Name']}
          {plan.Alias ? `(${plan.Alias})` : ''}
        </Typography>
      </CardContent>
      {/* <CardActions></CardActions> */}
    </StyledCard>
  </>
);
export default PlanCard;
