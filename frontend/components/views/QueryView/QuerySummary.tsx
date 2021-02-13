import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@material-ui/core';
import styled from 'styled-components'
import { QueryData } from '../../../types';

const StyledTableCell = styled(TableCell)`
border:none;
`

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
    <TableContainer>
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
    </TableContainer>
  );
};

export default QuerySummary;
