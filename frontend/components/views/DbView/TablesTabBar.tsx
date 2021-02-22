import React, { useState } from 'react';
import { Typography, Button, AppBar, Tabs, Tab } from '@material-ui/core';
import TableDetails from './TableDetails';
import { TableInfo } from '../../../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

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
}

const TablesTabs = ({ tables }: TablesSidebarProps) => {
  // const classes = useStyles();
  const [value, setValue] = useState(0);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  return (
    <>
      <AppBar position="static" color="default">
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          aria-label="scrollable auto tabs example"
        >
          {tables.map(({ table_name: name }, index) => (
            <Tab label={name} {...a11yProps(index)} key={name} />
          ))}
          ;
        </Tabs>
      </AppBar>
      <br />
      {tables.map((tableMap, index) => (
        <TabPanel value={value} index={index} key={tableMap.table_name}>
          <TableDetails table={tableMap} />
        </TabPanel>
      ))}
    </>
  );
};

export default TablesTabs;
