import React from 'react';
import { Typography, Button, ButtonGroup, Container } from '@material-ui/core';
import styled from 'styled-components';
import { MuiTheme } from '../../../style-variables';
import {
  selectedColor,
  textColor,
  defaultMargin,
} from '../../../style-variables';

const TableBtnGroup = styled(ButtonGroup)`
  margin: ${defaultMargin} 5px;
`;

interface TableEntryProps {
  table: string;
  select: () => void;
}

const TableEntry = ({ table, select }: TableEntryProps) => (
  <Button color="primary" onClick={select}>
    {table}
  </Button>
);

interface TablesSidebarProps {
  tables: string[];
  selectTable: (table: string) => void;
}

const TablesSidebar = ({ tables, selectTable }: TablesSidebarProps) => (
  <>
    <Typography>Tables</Typography>
    <TableBtnGroup variant="contained" color="primary" fullWidth>
      {tables.map((table: string) => (
        <TableEntry
          key={`tablelist_${table}`}
          table={table}
          select={() => selectTable(table)}
        />
      ))}
    </TableBtnGroup>
    <Button
      variant="contained"
      color="primary"
      onClick={() => console.log('generate dummy data')}
    >
      Generate Dummy Data
    </Button>
  </>
);

export default TablesSidebar;
