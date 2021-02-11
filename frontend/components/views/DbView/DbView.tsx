import { IpcMainEvent } from 'electron';
import React, { useState, useEffect } from 'react';
import { AppState, isDbLists, DatabaseInfo, TableInfo } from '../../../types';
import TablesSidebar from './TablesSidebar';
import DatabaseDetails from './DatabaseDetails';
// import TableName from './TableName';
import { once } from '../../../lib/utils';

const { ipcRenderer } = window.require('electron');

// emitting with no payload requests backend to send back a db-lists event with list of dbs
const requestDbListOnce = once(() => ipcRenderer.send('return-db-list'));

interface DbViewProps {
  selectedDb: AppState['selectedDb'];
  show: boolean;
}

const DbView = ({ selectedDb, show }: DbViewProps) => {
  const [dbTables, setTables] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableInfo>();
  const [databases, setDatabases] = useState<DatabaseInfo[]>([]);

  useEffect(() => {
    // Listen to backend for updates to list of tables on current db
    const tablesFromBackend = (evt: IpcMainEvent, dbLists: unknown) => {
      if (isDbLists(dbLists)) {
        setDatabases(dbLists.databaseList);
        setTables(dbLists.tableList);
        setSelectedTable(selectedTable || dbLists.tableList[0]);
      }
    };
    ipcRenderer.on('db-lists', tablesFromBackend);
    requestDbListOnce();
    // return cleanup function
    return () => ipcRenderer.removeListener('db-lists', tablesFromBackend);
  });

  if (!show) return null;
  return (
    <>
      {/* Casting to DatabaseInfo since selectedDb will always be found in list of databases */}
      <DatabaseDetails
        db={databases.find((db) => db.db_name === selectedDb) as DatabaseInfo}
      />
      <br />
      <TablesSidebar
        tables={dbTables}
        selectTable={(table: TableInfo) => setSelectedTable(table)}
      />
    </>
  );
};

export default DbView;
