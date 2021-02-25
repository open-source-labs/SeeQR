import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
} from '@material-ui/core';
import styled from 'styled-components';
import { greyDark, greyPrimary } from '../../../style-variables';
import { TableInfo } from '../../../types';

const StyledPaper = styled(({ ...other }) => (
  <Paper elevation={8} {...other} />
))`
  background: ${greyDark};
`;

const StyledCell = styled(TableCell)`
  border-bottom: 1px solid ${greyPrimary};
`;

interface TableDetailsProps {
  table: TableInfo | undefined;
}

const TableDetails = ({ table }: TableDetailsProps) => (
  <>
    <Typography variant="h3">{`${table?.table_name}`}</Typography>
    <br />
    <TableContainer component={StyledPaper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <strong>Column</strong>
            </TableCell>
            <TableCell align="right">
              <strong>Type</strong>
            </TableCell>
            <TableCell align="right">
              <strong>Is Nullable?</strong>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {table?.columns.map((row) => (
            <TableRow key={row.column_name}>
              <StyledCell key={row?.column_name}>{row?.column_name}</StyledCell>
              <StyledCell align="right">
                {`${row?.data_type}${
                  row?.character_maximum_length
                    ? `(${row.character_maximum_length})`
                    : ''
                }`}
              </StyledCell>
              <StyledCell align="right">{row?.is_nullable}</StyledCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </>
);

export default TableDetails;
