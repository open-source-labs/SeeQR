import { IpcRendererEvent, ipcRenderer } from 'electron';
import React, { useState, useEffect } from 'react';
import { Button } from '@material-ui/core';
import styled from 'styled-components';
import { AppState, isDbLists, DatabaseInfo, TableInfo } from '../../../types';
import { DBType } from '../../../../backend/BE_types';
import TablesTabs from './TablesTabBar';
import DatabaseDetails from './DatabaseDetails';
import { once } from '../../../lib/utils';
import DummyDataModal from '../../modal/DummyDataModal';
import { sidebarShowButtonSize } from '../../../style-variables';
// emitting with no payload requests backend to send back a db-lists event with list of dbs
const requestDbListOnce = once(() => ipcRenderer.send('return-db-list'));

interface DbViewProps {
  selectedDb: AppState['selectedDb'];
  show: boolean;
  setERView: (boolean) => void;
  ERView: boolean;
  curDBType: DBType | undefined;
  setDBType: (dbType: DBType | undefined) => void;
  DBInfo: DatabaseInfo[] | undefined;
  setDBInfo: (dbInfo: DatabaseInfo[] | undefined) => void;
  dbTables: TableInfo[];
  setTables: (tableInfo: TableInfo[]) => void;
  selectedTable: TableInfo | undefined;
  setSelectedTable: (tableInfo: TableInfo | undefined) => void;
}

const StyledDummyButton = styled(Button)`
  position: fixed;
  top: 260px;
  right: ${sidebarShowButtonSize};
`;

const DbView = ({ selectedDb, show, setERView, ERView, curDBType, setDBType, DBInfo, setDBInfo, dbTables, setTables, selectedTable, setSelectedTable}: DbViewProps) => {
  // const [databases, setDatabases] = useState<DatabaseInfo[]>([]);

  const [open, setOpen] = useState(false);
  
// console.log('DB props', curDBType, selectedDb)
  

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const db = DBInfo?.find((dbi) => dbi.db_name === selectedDb);

  if (!show) return null;
  return (
    <>
      <DatabaseDetails db={db} />
      <br />
      <TablesTabs
        // setTables={setTables}
        tables={dbTables}
        selectTable={(table: TableInfo) => setSelectedTable(table)}
        selectedTable={selectedTable}
        selectedDb={selectedDb}
        setERView={setERView}
        curDBType={curDBType}
      />
      <br />
      <br />
      {(selectedTable && !ERView) ? (
        <StyledDummyButton
          variant="contained"
          color="primary"
          onClick={handleClickOpen}
        >
          Generate Dummy Data
        </StyledDummyButton>
      ) : null}
      <DummyDataModal
        open={open}
        onClose={handleClose}
        dbName={db?.db_name}
        tableName={selectedTable?.table_name}
        curDBType={curDBType}
      />
    </>
  );
};

export default DbView;
