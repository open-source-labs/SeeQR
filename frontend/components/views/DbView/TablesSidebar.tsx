import React, { useState } from 'react';
import { Typography, Button } from '@material-ui/core';
import styled from 'styled-components';

import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';
import TableDetails from './TableDetails';
import { TableInfo } from '../../../types';
import { sidebarWidth, defaultMargin } from '../../../style-variables';

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
    {value === index && (
      <Box p={5}>
        <Typography>{children}</Typography>
      </Box>
    )}
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

const viewWidth = `calc( 100vw - ${sidebarWidth} - (${defaultMargin} * 3))`;

const StyledTabs = styled(Tabs)`
  max-width: ${viewWidth};
  width: ${viewWidth};
`;

const TablesSidebar = ({ tables }: TablesSidebarProps) => {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  return (
    <>
      <AppBar position="static" color="default">
        <StyledTabs
          value={value}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          aria-label="scrollable auto tabs example"
          centered
        >
          {tables.map((tableMap, index) => (
            <Tab label={tableMap.table_name} {...a11yProps(index)} />
          ))}
          ;
        </StyledTabs>
      </AppBar>
      {tables.map((tableMap, index) => (
        <TabPanel value={value} index={index}>
          <TableDetails table={tableMap} />
        </TabPanel>
      ))}
      <Button
        variant="contained"
        color="primary"
        onClick={() => console.log('generate dummy data')}
      >
        Generate Dummy Data
      </Button>
    </>
  );
};

export default TablesSidebar;
