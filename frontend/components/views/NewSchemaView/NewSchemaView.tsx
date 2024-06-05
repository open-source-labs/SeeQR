import { ipcRenderer } from 'electron';
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux'; 
import { Button, Typography, Box } from '@mui/material/';
import styled from 'styled-components';
import {
  DBType,
  TableInfo,
  QueryData
} from '../../../../shared/types/types';
import { defaultMargin } from '../../../style-variables';

// not sure what this is yet...seems necessary for error message listeners
import { sendFeedback } from '../../../lib/utils';

// import child components below
import SchemaName from './SchemaName';
import TablesTabs from '../DbView/TablesTabBar';
import SchemaSqlInput from './SchemaSqlInput';

import { updateWorkingQuery } from '../../../state_management/Slices/QuerySlice';


// top row container
const TopRow = styled(Box)`
  display: flex;
  align-items: flex-end;
  margin: ${defaultMargin} 0;
`;

// Container
const Container = styled.a`
  display: flex;
  justify-content: flex-start;
  padding-top: 0px;
`;

// button elements
const CenterButton = styled(Box)`
  display: flex;
  justify-content: center;
  padding-bottom: 0px;
`;

const RunButton = styled(Button)`
  margin: ${defaultMargin} auto;
`;

const InitButton = styled(Button)`
  margin-left: 2%;
  height: 30px;
  width: 160px;
  font-size: 12px;
`;

const ExportButton = styled(Button)`
  margin-left: 44%;
  height: 30px;
  width: 160px;
  font-size: 12px;
`;

// view container
const NewSchemaViewContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

// Define the props interface for NewSchemaView component
interface NewSchemaViewProps {
  setSelectedDb: (db: string) => void;
  selectedDb: string;
  show: boolean;
  curDBType: DBType | undefined;
  dbTables: TableInfo[];
  selectedTable: TableInfo | undefined;
  setSelectedTable: (tableInfo: TableInfo | undefined) => void;
}

// Define the props interface for NewSchemaView component
function NewSchemaView({
  setSelectedDb,
  selectedDb,
  show,
  curDBType,
  dbTables,
  selectedTable,
  setSelectedTable,
}: NewSchemaViewProps) {
  // Get dispatch function from react-redux
  const dispatch = useDispatch(); 

  const [currentSql, setCurrentSql] = useState('');

  const TEMP_DBTYPE = DBType.Postgres;

  // By leveraging Redux for state management and using useSelector to access the workingQuery, no need for defaultQuery within the component
  // Get working query from Redux store using useSelector
  const localQuery = useSelector((state: any) => state.query.workingQuery);
  // const localQuery: QueryData = useSelector((state: any) => state.query.workingQuery);


  // handles naming of schema
  const onNameChange = (newName: string) => {
    // Update working query in Redux store using dispatch
    dispatch(updateWorkingQuery({ ...localQuery, db: newName }));
    setSelectedDb(newName);
  };

  // handles sql string input
  const onSqlChange = (newSql: string) => {
    setCurrentSql(newSql);
    // Update working query in Redux store using dispatch
    dispatch(updateWorkingQuery({ ...localQuery, sqlString: newSql }));
  };

  // handle intializing new schema
  const onInitialize = () => {
    ipcRenderer
      .invoke(
        'initialize-db',
        {
          newDbName: localQuery.db,
        },
        TEMP_DBTYPE,
      )
      .catch((err) => {
        sendFeedback({
          type: 'error',
          message: err ?? 'Failed to initialize db',
        });
      });
  };

  // handle exporting
  const onExport = () => {
    ipcRenderer
      .invoke(
        'export-db',
        {
          sourceDb: selectedDb,
        },
        curDBType,
      )
      .catch((err) => {
        sendFeedback({
          type: 'error',
          message: err ?? 'Failed to export db',
        });
      });
  };

  // onRun function to handle when user submits sql string to update schema
  const onRun = () => {
    setSelectedDb(localQuery.db);
    // // request backend to run query
    ipcRenderer
      .invoke(
        'update-db',
        {
          sqlString: localQuery.sqlString,
          selectedDb,
        },
        curDBType,
      )
      .then(() => {
        setCurrentSql('');
      })
      .catch((err) => {
        sendFeedback({
          type: 'error',
          message: err ?? 'Failed to Update Schema',
        });
      });
  };

  if (!show) return null;
  return (
    <NewSchemaViewContainer>
      <TopRow>
        <SchemaName name={selectedDb} onChange={onNameChange} />
        <InitButton variant="contained" onClick={onInitialize}>
          Initialize Database
        </InitButton>
        <ExportButton variant="contained" onClick={onExport}>
          Export
        </ExportButton>
      </TopRow>
      <SchemaSqlInput
        sql={currentSql}
        onChange={onSqlChange}
        runQuery={onRun}
      />
      <CenterButton>
        <RunButton variant="contained" onClick={onRun}>
          Update Database
        </RunButton>
      </CenterButton>
      <Container>
        <Typography variant="h4">{`${selectedDb}`}</Typography>
      </Container>
      <TablesTabs
        tables={dbTables}
        selectTable={(table: TableInfo) => setSelectedTable(table)}
        selectedTable={selectedTable}
        selectedDb={selectedDb}
        curDBType={curDBType}
      />
    </NewSchemaViewContainer>
  );
}
export default NewSchemaView;


