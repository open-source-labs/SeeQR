import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@material-ui/core';
import styled from 'styled-components';
import { QueryData } from '../../../types';

const FlexChild = styled(TableContainer)`
  flex: 0 0 auto;
`;

const StyledTableCell = styled(TableCell)`
  border: none;
`;

interface QuerySummaryProps {
  executionPlan: QueryData['executionPlan'];
}

const QuerySummary = ({ executionPlan }: QuerySummaryProps) => {
  const summaryData = {
    'Planning Time': executionPlan?.['Planning Time'],
    'Execution Time': executionPlan?.['Execution Time'],
    'Actual Total Time': executionPlan?.Plan['Actual Total Time'],
  };

  if (!executionPlan) return null;
  return (
    <FlexChild>
      <Table size="small">
        <TableBody>
          <TableRow>
            {Object.entries(summaryData).map(([property, value]) => (
              <StyledTableCell align="center" key={property}>
                <strong>{`${property}: `}</strong>
                {value}
              </StyledTableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </FlexChild>
  );
};

export default QuerySummary;
