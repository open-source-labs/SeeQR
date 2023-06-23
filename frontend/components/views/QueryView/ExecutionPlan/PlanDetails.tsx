import React from 'react';
import {
  Modal,
  Backdrop,
  Fade,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material';
import styled from 'styled-components';
import {
  DarkPaperFull,
  greyLightest,
  greyLighter,
  greyDarkest,
} from '../../../../style-variables';
import type { SizedPlanNode } from '../../../../lib/flow';

const StyledModal = styled(Modal)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LightPaper = styled(DarkPaperFull)`
  background: ${greyLightest};
  padding: 50px;
  color: ${greyDarkest};
  width: fit-content;
  min-width: 400px;
  max-width: 80vw;
  max-height: 80vh;
`;

const StyledRow = styled(TableRow)<{$i: number}>`
  background: ${({$i}) => $i % 2 ? 'none' : greyLighter};
`

const StyledCell = styled(TableCell)`
  color: ${greyDarkest};
  padding: 10px;
`;

interface PlanDetailsProps {
  plan: SizedPlanNode;
  open: boolean;
  handleClose: () => void;
}

// hide SizedNode type properties added for internal use and children
const visibleProperties = ([property]: [string, any]) => {
  switch (property) {
    case 'id':
    case 'width':
    case 'height':
    case 'children':
    case 'Plans':
      return false;
    default:
      return true;
  }
};

const detailRows = (plan: SizedPlanNode) =>
  Object.entries(plan)
    .filter(visibleProperties)
    .map(([property, value], index) => (
      <StyledRow key={property} $i={index}>
        <StyledCell>{property}</StyledCell>
        <StyledCell align="right">
          {/* insert spaces after commas to ensure wrapping is possible. Necessary for long Output strings */}
          {value?.toString().replace(/,/g, ', ') ?? ''}
        </StyledCell>
      </StyledRow>
    ));

const PlanDetails = ({ plan, open, handleClose }: PlanDetailsProps) => (
  <StyledModal
    aria-labelledby="transition-modal-title"
    aria-describedby="transition-modal-description"
    open={open}
    onClose={handleClose}
    closeAfterTransition
    BackdropComponent={Backdrop}
    BackdropProps={{
      timeout: 500,
    }}
  >
    <Fade in={open}>
      <TableContainer component={LightPaper}>
        <Table size="small">
          <TableBody>{detailRows(plan)}</TableBody>
        </Table>
      </TableContainer>
    </Fade>
  </StyledModal>
);

export default PlanDetails;
