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
} from '@mui/material';
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
  table: TableInfo | undefined,
  nguyen: string
}

// SELECT * FROM table.table_name
function TableDetails({ table, nguyen }: TableDetailsProps) {
  //in props we also need access to the database from DatabaseDetails.tsx

  // ipcRenderer.invoke('run-query-select-all', DB, table.table_name)
  console.log(nguyen)
  return (
    <>
      <Typography variant="h3">{`${table?.table_name}`}</Typography>
      <br />
      <TableContainer component={StyledPaper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                {table?.columns.map((row) => (
                  <StyledCell key={row?.column_name}>
                    {`${row?.column_name} (${row?.data_type}${
                      row?.character_maximum_length
                        ? `(${row.character_maximum_length})`
                        : ''
                    }) `}
                  </StyledCell>
                ))}
              </TableCell>
            </TableRow>
          </TableHead>
          {/* <TableBody></TableBody> */}
        </Table>
      </TableContainer>
    </>
  );
}

export default TableDetails;
