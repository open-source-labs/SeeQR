import React, { useState } from 'react';
import { Tabs, Tab, Button } from '@material-ui/core';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import styled from 'styled-components';
import TableDetails from './TableDetails';
import { AppState, TableInfo } from '../../../types';
import { greyPrimary, greenPrimary } from '../../../style-variables';
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
}

const StyledToggleButtonGroup = styled(ToggleButtonGroup)`
  background-color: ${greenPrimary};
  margin-bottom: 10px;
  `;


const TablesTabs = ({
  tables,
  selectTable,
  selectedTable,
  selectedDb
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
      <StyledToggleButtonGroup
        value={active}
        exclusive
        aria-label="active-view"
      >
        <ToggleButton value="true" aria-label="er" onClick= {() => SetView(true)}>
          ER
        </ToggleButton>
        <ToggleButton value="false" aria-label="table" onClick= {() => SetView(false)}>
          Table
        </ToggleButton>
      </StyledToggleButtonGroup>
      {ErView()}
    </div>
  );
};

export default TablesTabs;
