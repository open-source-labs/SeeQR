import React from 'react';
import { AppBar, Tabs, Tab } from '@material-ui/core';
import styled from 'styled-components';
import TableDetails from './TableDetails';
import { TableInfo } from '../../../types';
import { greyMedium } from '../../../style-variables';

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

const StyledTabs = styled(Tabs)`
  background-color: #818584;
  color: white;
`;

const TabPanel = ({ children, value, index }: TabPanelProps) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`scrollable-auto-tabpanel-${index}`}
    aria-labelledby={`scrollable-auto-tab-${index}`}
  >
    {value === index && children}
  </div>
);

const a11yProps = (index: any) => ({
  id: `scrollable-auto-tab-${index}`,
  'aria-controls': `scrollable-auto-tabpanel-${index}`,
});

interface TablesSidebarProps {
  tables: TableInfo[];
  selectTable: (table: TableInfo) => void;
  selectedTable: TableInfo | undefined;
}

const TablesTabs = ({
  tables,
  selectTable,
  selectedTable,
}: TablesSidebarProps) => {
  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    selectTable(tables[newValue]);
  };

  const tableIndex = tables.findIndex(
    ({ table_name }) => table_name === selectedTable?.table_name
  );

  return (
    <>
      <AppBar position="static" color="default">
        <StyledTabs
          value={tableIndex}
          onChange={handleChange}
          indicatorColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          aria-label="scrollable auto tabs example"
        >
          {tables.map(({ table_name: name }, index) => (
            <Tab label={name} {...a11yProps(index)} key={name} />
          ))}
          ;
        </StyledTabs>
      </AppBar>
      <br />
      <br />
      {tables.map((tableMap, index) => (
        <TabPanel value={tableIndex} index={index} key={tableMap.table_name}>
          <TableDetails table={tableMap} />
        </TabPanel>
      ))}
    </>
  );
};

export default TablesTabs;
