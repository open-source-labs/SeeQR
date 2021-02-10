// TODO: Implement first/last buttons for pagination https://material-ui.com/components/tables/#custom-pagination-actions
// TODO: dark scrollbar for table
// TODO: line up right margin with codemirror margin

import React from 'react';
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
import { QueryData } from '../../../types';
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

interface Column {
  name: string;
  align: 'left' | 'right';
}

// TODO: temporary. In future we should get data type from table schema
const isNumber = (val: unknown) => {
  if (typeof val === 'number') return true;
  const numberRgx = /^-?[0-9.]+$/;
  if (numberRgx.test(val as string)) return true;
  return false;
};

const buildColumns = (row: Record<string, unknown>): Column[] =>
  Object.entries(row).map(([column, value]) => ({
    name: column,
    align: isNumber(value) ? 'right' : 'left',
  }));

interface QueryResultsProps {
  results: QueryData['returnedRows'];
}

const QueryResults = ({ results }: QueryResultsProps) => {
  if (!results || !results.length) return null;

  const [page, setPage] = React.useState(0);
  const rowsPerPage = 10

  // reset page to 1 if page is further than it could reasonable be. e.g. if
  // user edits a query that had many pages of results while being in the last
  // page and new query has a single page
  if (page * rowsPerPage > results.length) setPage(0);

  const columns = buildColumns(results[0]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };


  // if there are performance issues, look into https://material-ui.com/components/tables/#virtualized-table
  return (
    <>
      <TableContainer component={StyledPaper}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.name} align={column.align}>
                  <strong>{column.name}</strong>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {results
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => (
                // TODO: figure out react key
                <TableRow hover role="checkbox" tabIndex={-1}>
                  {columns.map((column) => (
                    <StyledCell
                      align={column.align}
                      key={`${column.name}_${row[column.name]}`}
                    >
                      {/* // TODO: how to properly type this? */}
                      {(row[column.name] as any)?.toString()}
                    </StyledCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        // if there is only one option the dropdown is not displayed
        rowsPerPageOptions={[10]}
        component="div"
        count={results.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onChangePage={handleChangePage}
      />
    </>
  );
};

export default QueryResults;
