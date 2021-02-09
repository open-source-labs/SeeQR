import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@material-ui/core';
import { QueryData } from '../../../types';

interface QuerySummaryProps {
  executionPlan: QueryData['executionPlan'];
}

const QuerySummary = ({ executionPlan }: QuerySummaryProps) => {
  const summaryData = {
    'Plannin Time': executionPlan?.['Planning Time'],
    'Execution Time': executionPlan?.['Execution Time'],
    'Actual Total Time': executionPlan?.Plan['Actual Total Time'],
  };

  if (!executionPlan) return null
  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            {Object.keys(summaryData).map((property: string) => (
              <TableCell>{property}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            {Object.values(summaryData).map((value: number | undefined) => (
              <TableCell>{value}</TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default QuerySummary;
