import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from '@material-ui/core';
import styled from 'styled-components';
import { QueryData } from '../../../types';
import { greyPrimary, DarkPaperFull } from '../../../style-variables';

const StyledCell = styled(TableCell)`
  border-bottom: 1px solid ${greyPrimary};
`;

interface Column {
  name: string;
  align: 'left' | 'right';
}

// temporary. In future we should get data type from table schema since that's more accurate
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
// console.log('buildColumns: QueryResults', buildColumns);
interface QueryResultsProps {
  results: QueryData['returnedRows'];
}

const QueryResults = ({ results }: QueryResultsProps) => {
  if (!results || !results.length) return null;
  // console.log('Results: QueryResults', results);
  const [page, setPage] = React.useState(0);
  const rowsPerPage = 10;

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
    <DarkPaperFull>
      <TableContainer>
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
                <TableRow
                  hover
                  role="checkbox"
                  tabIndex={-1}
                  key={Object.values(row).join()}
                >
                  {columns.map((column) => (
                    <StyledCell
                      align={column.align}
                      key={`${column.name}_${row[column.name]}`}
                    >
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
        onPageChange={handleChangePage}
      />
    </DarkPaperFull>
  );
};

export default QueryResults;
