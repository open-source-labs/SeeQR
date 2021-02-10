import React from 'react';
import { Typography, Button, ButtonGroup, Container } from '@material-ui/core';
import styled from 'styled-components';
import { MuiTheme } from '../../../style-variables';
import { TableInfo } from '../../../types';

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
  tables: TableInfo[];
  selectTable: (table: TableInfo) => void;
}

const TablesSidebar = ({ tables, selectTable }: TablesSidebarProps) => (
  <>
    {/* <MuiThemeProvider theme={MuiTheme}> */}
    <Typography>Tables</Typography>
    <ul>
      {tables.map((table) => (
        <TableEntry
          key={`tablelist_${table.table_catalog}_${table.table_name}`}
          table={table.table_name}
          select={() => selectTable(table)}
        />
      ))}
    </ul>
    <Button
      variant="contained"
      color="primary"
      onClick={() => console.log('generate dummy data')}
    >
      Generate Dummy Data
    </Button>
    {/* </MuiThemeProvider> */}
  </>
);

export default TablesSidebar;
