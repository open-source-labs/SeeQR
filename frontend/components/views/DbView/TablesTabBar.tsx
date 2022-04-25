import React, { useState } from 'react';
import { Tabs, Tab, Button } from '@material-ui/core';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import styled from 'styled-components';
import TableDetails from './TableDetails';
import { AppState, TableInfo } from '../../../types';
import { greyPrimary } from '../../../style-variables';
import ERTables from '../ERTables/ERTabling';
import updateSchema from './sample-updateschema';
import { sendFeedback } from '../../../lib/utils';

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

const StyledTabs = styled(Tabs)`
  background-color: ${greyPrimary};
  color: white;
  border-radius: 5px;
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

interface TablesTabBarProps {
  tables: TableInfo[];
  selectTable: (table: TableInfo) => void;
  selectedTable: TableInfo | undefined;
  selectedDb: AppState['selectedDb'];
  setERView?: (boolean) => void;
}

const StyledViewButton = styled(Button)`
  margin: 1rem;
  margin-left: 0rem;
`;

const TablesTabs = ({ 
  tables,
  selectTable,
  selectedTable,
  selectedDb,
  setERView
}: TablesTabBarProps) => {
  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    selectTable(tables[newValue]);
  };

  const tableIndex = tables.findIndex(
    ({ table_name }) => table_name === selectedTable?.table_name
  );

  const [active, setActive] = useState(true);
  const SetView = (active) => {
    setActive(active);
  };

  const ErView = () => (
    <div>
      { active ? (
        <ERTables tables={tables} selectedDb={selectedDb} />
      ) : (
        <>
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
          <br />
          <br />
          {tables.map((tableMap, index) => (
            <TabPanel
              value={tableIndex}
              index={index}
              key={tableMap.table_name}
            >
              <TableDetails table={tableMap} />
            </TabPanel>
          ))}
        </>
      )}
    </div>
  );

  return (
    <div>
<StyledViewButton
        variant="contained"
        color="primary"
        onClick={() => {
          SetView(true)
          if(setERView) setERView(true)
        }}
      >
        ER DIAGRAM
      </StyledViewButton>
      <StyledViewButton
        variant="contained"
        color="primary"
        onClick={() => {
          SetView(false)
          if(setERView) setERView(false)
        }}
      >
        TABLE
      </StyledViewButton>
      {ErView()}
    </div>
  );
};

export default TablesTabs;
