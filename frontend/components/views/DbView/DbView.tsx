import { IpcMainEvent } from 'electron';
import React, { useState, useEffect } from 'react';
import { AppState, isDbLists } from '../../../types';
import TableDetails from './TableDetails';
import TablesSidebar from './TablesSidebar';
import DatabaseDetails from './DatabaseDetails';
import { once } from '../../../lib/utils'

const { ipcRenderer } = window.require('electron');

// emitting with no payload requests backend to send back a db-lists event with list of dbs
const requestDbListOnce = once(() => ipcRenderer.send('return-db-list'));

interface DbViewProps {
  selectedDb: AppState['selectedDb'];
  show: boolean
};

const DbView = ({ selectedDb, show }: DbViewProps) => {
  const [dbTables, setTables] = useState<string[]>([]);
  // TODO: type appropriately once backend provides data
  const [selectedTable, setSelectedTable] = useState<string>('');

  useEffect(() => {
    // TODO: get dbsize info
    // Listen to backend for updates to list of tables on current db
    const tablesFromBackend = (evt: IpcMainEvent, dbLists: unknown) => {
      if (isDbLists(dbLists)) {
        setTables(dbLists.tableList);
        setSelectedTable(selectedTable || dbLists.tableList[0] || '');
      }
    };
    ipcRenderer.on('db-lists', tablesFromBackend);
    requestDbListOnce()
    // return cleanup function
    return () => ipcRenderer.removeListener('db-lists', tablesFromBackend);
  });

  if (!show) return null
  return (
    <>
      <DatabaseDetails db={selectedDb} />
      <TableDetails table={selectedTable} />
      <TablesSidebar
        tables={dbTables}
        selectTable={(table: string) => setSelectedTable(table)}
      />
    </>
  );
};

export default DbView;
