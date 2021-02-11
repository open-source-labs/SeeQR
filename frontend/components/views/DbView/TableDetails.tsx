import React from 'react';
import { TableInfo } from '../../../types';
import { Typography } from '@material-ui/core';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
} from '@material-ui/core';
import styled from 'styled-components';
import {
  greyDark,
  greyPrimary,
  defaultMargin,
  sidebarWidth,
} from '../../../style-variables';

const tableWidth = `calc(100vw - (${defaultMargin} * 3) - ${sidebarWidth})`;

const StyledPaper = styled(({ ...other }) => (
  <Paper elevation={8} {...other} />
))`
  background: ${greyDark};
  min-width: ${tableWidth};
  width: ${tableWidth};
`;

const StyledCell = styled(TableCell)`
  border-bottom: 1px solid ${greyPrimary};
`;

interface TableDetailsProps {
  table: TableInfo | undefined;
}

// TODO: don't render if no table is received
const TableDetails = ({ table }: TableDetailsProps) => (
  <>
    <Typography variant="h3">{`${table?.table_name}`}</Typography>
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
              <strong>Modifiers</strong>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {table?.columns.map((row) => (
            <TableRow key={row.column_name}>
              <StyledCell key={row?.column_name}>{row?.column_name}</StyledCell>
              <StyledCell align="right">{row?.data_type}</StyledCell>
              <StyledCell align="right">
                {(row?.character_maximum_length, row?.is_nullable)}
              </StyledCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </>
);

export default TableDetails;
