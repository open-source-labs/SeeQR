import React, { useState } from 'react';
import { Tabs, Tab, Button } from '@material-ui/core';
import styled from 'styled-components';
import TableDetails from './TableDetails';
import { TableInfo } from '../../../types';
import { greyPrimary } from '../../../style-variables';
import ERTables from '../ERTables/ERTabling';
import updateSchema from './sample-updateschema';
import { sendFeedback } from '../../../lib/utils';
import ERTables from '../ERTables/ErTabling';


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
}

const StyledViewButton = styled(Button)`
  margin: 1rem;
  margin-left: 0rem;
`;

const TablesTabs = ({
  tables,
  selectTable,
  selectedTable,
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
      {active ? (<ERTables tables={tables} />) :
        (
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
              <TabPanel value={tableIndex} index={index} key={tableMap.table_name}>
                <TableDetails table={tableMap} />
              </TabPanel>
            ))}
          </>
        )
      }
    </div>
  )

  return (
    <div>
      <StyledViewButton
        variant="contained"
        color="primary"
        onClick={() => SetView(true)}
      >
        ER
      </StyledViewButton>
      <StyledViewButton
        variant="contained"
        color="primary"
        onClick={() => SetView(false)}
      >
        TABLE
      </StyledViewButton>
      {ErView()}
    </div>
  );
};

export default TablesTabs;