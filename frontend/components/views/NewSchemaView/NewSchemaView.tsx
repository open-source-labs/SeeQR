import { ipcRenderer } from 'electron';
import React, { useState } from 'react';
import { Button, Typography } from '@mui/material/';
import Box from '@mui/material/Box';
import styled from 'styled-components';
import {
  QueryData,
  CreateNewQuery,
  AppState,
  TableInfo,
  DatabaseInfo,
} from '../../../types';
import { DBType } from '../../../../backend/BE_types';
import { defaultMargin } from '../../../style-variables';

// not sure what this is yet...seems necessary for error message listeners
import { sendFeedback } from '../../../lib/utils';

// import child components below
import SchemaName from './SchemaName';
import TablesTabs from '../DbView/TablesTabBar';
import SchemaSqlInput from './SchemaSqlInput';

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

// props interface
interface NewSchemaViewProps {
  query?: AppState['workingQuery'];
  setQuery: AppState['setWorkingQuery'];
  createNewQuery: CreateNewQuery;
  setSelectedDb: AppState['setSelectedDb'];
  selectedDb: AppState['selectedDb'];
  show: boolean;
  curDBType: DBType | undefined;
  setDBType: (dbType: DBType | undefined) => void;
  DBInfo: DatabaseInfo[] | undefined;
  setDBInfo: (dbInfo: DatabaseInfo[] | undefined) => void;
  dbTables: TableInfo[];
  setTables: (tableInfo: TableInfo[]) => void;
  selectedTable: TableInfo | undefined;
  setSelectedTable: (tableInfo: TableInfo | undefined) => void;
}

const NewSchemaView = ({
  query,
  setQuery,
  createNewQuery,
  setSelectedDb,
  selectedDb,
  show,
  curDBType,
  setDBType,
  DBInfo,
  setDBInfo,
  dbTables,
  setTables,
  selectedTable,
  setSelectedTable,
}: NewSchemaViewProps) => {
  // additional local state properties using hooks
  // const [dbTables, setTables] = useState<TableInfo[]>([]);
  // const [selectedTable, setSelectedTable] = useState<TableInfo>();
  // const [databases, setDatabases] = useState<DatabaseInfo[]>([]);

  const [currentSql, setCurrentSql] = useState('');
  // const [open, setOpen] = useState(false);

  const TEMP_DBTYPE = DBType.Postgres;

  const defaultQuery: QueryData = {
    label: '', // required by QueryData interface, but not necessary for this view
    db: '', // name that user inputs in SchemaName.tsx
    sqlString: '', // sql string that user inputs in SchemaSqlInput.tsx
    group: '', // group string for sorting queries in accordians
  };

  const localQuery = { ...defaultQuery, ...query };

  // handles naming of schema
  const onNameChange = (newName: string) => {
    setQuery({ ...localQuery, db: newName });
    setSelectedDb(newName);
  };

  // handles sql string input
  const onSqlChange = (newSql: string) => {
    // because App's workingQuery changes ref
    setCurrentSql(newSql);
    setQuery({ ...localQuery, sqlString: newSql });
  };

  // handle intializing new schema
  const onInitialize = () => {
    ipcRenderer
      .invoke(
        'initialize-db',
        {
          newDbName: localQuery.db,
        },
        TEMP_DBTYPE
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
        curDBType
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
        curDBType
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
        // setTables={setTables}
        tables={dbTables}
        selectTable={(table: TableInfo) => setSelectedTable(table)}
        selectedTable={selectedTable}
        selectedDb={selectedDb}
        curDBType={curDBType}
      />
    </NewSchemaViewContainer>
  );
};
export default NewSchemaView;
