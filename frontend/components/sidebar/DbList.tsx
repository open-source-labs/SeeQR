import React, { useState, useEffect } from 'react';
import { IpcMainEvent } from 'electron';
import AddIcon from '@material-ui/icons/Add';
import AddNewDbModal from '../modal/addNewDbModal';
import { AppState, isDbLists } from '../../types';
import { once } from '../../lib/utils'

// TODO: how to type ipcRenderer ?
const { ipcRenderer } = window.require('electron');

// emitting with no payload requests backend to send back a db-lists event with list of dbs
const requestDbListOnce = once(() => ipcRenderer.send('return-db-list'));


interface DbEntryProps {
  db: string;
  isSelected: boolean;
  select: () => void;
}
const DbEntry = ({ db, isSelected, select }: DbEntryProps) => (
  // TODO: conditional style basend on isSelected
  <li onClick={select}>{`${db} ${isSelected ? '<' : ''}`}</li>
);

type DbListProps = Pick<AppState, 'selectedDb' | 'setSelectedDb'> & {show: boolean};

const DbList = ({ selectedDb, setSelectedDb, show }: DbListProps) => {
  const [databases, setDatabases] = useState<string[]>([]);
  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    // Listen to backend for updates to list of available databases
    const dbListFromBackend = (evt: IpcMainEvent, dbLists: unknown) => {
      if (isDbLists(dbLists)) {
        setDatabases(dbLists.databaseList);
      }
    }
    ipcRenderer.on('db-lists', dbListFromBackend);
    requestDbListOnce()
    // return cleanup function
    return () => ipcRenderer.removeListener('db-lists', dbListFromBackend);
  });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const createSelectHandler = (dbName: string) => () => {
    setSelectedDb(dbName);
    ipcRenderer.send('change-db', dbName);
    ipcRenderer.send('return-db-list', dbName);
  };

  if (!show) return null
  return (
    <>
      <ul>
        {databases.map((dbName) => (
          <DbEntry
            key={`dbList_${dbName}`}
            db={dbName}
            isSelected={selectedDb === dbName}
            select={createSelectHandler(dbName)}
          />
        ))}
      </ul>
      <AddIcon color="primary" fontSize="large" onClick={handleClickOpen} />
      <AddNewDbModal open={open} onClose={handleClose} />
    </>
  );
};

export default DbList;
