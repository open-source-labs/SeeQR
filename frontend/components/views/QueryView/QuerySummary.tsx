import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material';
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
    // 'Planning Time': executionPlan?.['Planning Time'],
    // 'Execution Time': executionPlan?.['Execution Time'],
    'Number of Sample': executionPlan?.numberOfSample,
    'Total Sample Time': executionPlan?.totalSampleTime + 'ms',
    'Minmum Sample Time': executionPlan?.minimumSampleTime + 'ms',
    'Maximum Sample Time': executionPlan?.maximumSampleTime + 'ms',
    'Average Sample Time': executionPlan?.averageSampleTime + 'ms',
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
