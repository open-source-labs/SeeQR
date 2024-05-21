import { ipcRenderer } from 'electron';
import React, { useEffect, useState } from 'react';
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
import { TableInfo, DBType } from '../../../../shared/types/types';

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
  selectedDb: string;
  curDBType: DBType | undefined;
}

function TableDetails({ table, selectedDb, curDBType }: TableDetailsProps) {
  const [data, setData] = useState([]);
  const onDisplay = () => {
    ipcRenderer
      .invoke(
        'run-select-all-query',
        {
          sqlString: `SELECT * FROM ${table?.table_name}`,
          selectedDb,
        },
        curDBType,
      )
      .then((data) => {
        setData(data);
      })
      .catch((err) => {
        console.error('Error in onDisplay ', err);
      });
  };

  useEffect(() => {
    onDisplay();
  }, [table, selectedDb, curDBType]);

  return (
    <>
      <Typography variant="h3">{`${table?.table_name}`}</Typography>
      <br />
      <TableContainer component={StyledPaper}>
        <Table>
          <TableHead>
            <TableRow>
              {table?.columns.map((row) => (
                <TableCell>
                  {`${row?.column_name} (${row?.data_type} ${row.character_maximum_length})`}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.map((element) => (
              <TableRow>
                {Object.keys(element).map((column) => (
                  <TableCell key={element}>{element[column]}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

export default TableDetails;
