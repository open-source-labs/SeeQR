import { IpcMainEvent } from 'electron';
import React, { useState } from 'react';
import { AppState, isDbLists } from '../../../types';
import TableDetails from './TableDetails';
import TablesSidebar from './TablesSidebar';
import DatabaseDetails from './DatabaseDetails';

const { ipcRenderer } = window.require('electron');

type DbViewProps = Pick<AppState, 'selectedDb'>;

const DbView = ({ selectedDb }: DbViewProps) => {
  const [dbTables, setTables] = useState<string[]>([]);
  // TODO: type appropriately once backend provides data
  const [selectedTable, setSelectedTable] = useState<string>('');

  // Listen to backend for updates to list of tables on current db
  // TODO: get dbsize info
  ipcRenderer.on('db-lists', (evt: IpcMainEvent, dbLists: unknown) => {
    if (isDbLists(dbLists)) {
      setTables(dbLists.tableList);
      setSelectedTable(selectedTable || dbLists.tableList[0] || '')
    }
  });

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
