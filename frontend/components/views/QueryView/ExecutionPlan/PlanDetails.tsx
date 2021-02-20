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
} from '@material-ui/core';
import styled from 'styled-components';
import {
  DarkPaperFull,
  greyLightest,
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
`;

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
    .map(([property, value]) => (
      <TableRow key={property}>
        <StyledCell>{property}</StyledCell>
        <StyledCell align="right">{value?.toString() ?? ''}</StyledCell>
      </TableRow>
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
