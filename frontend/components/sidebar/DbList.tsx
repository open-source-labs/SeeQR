import React, { useState } from 'react';
import { IpcMainEvent } from 'electron';
import AddIcon from '@material-ui/icons/Add';
import AddNewDbModal from '../modal/addNewDbModal';
import { AppState, isDbLists } from '../../types';

// TODO: how to type ipcRenderer ?
const { ipcRenderer } = window.require('electron');

type DbListProps = Pick<AppState, 'selectedDb' | 'setSelectedDb'>;

interface DbEntryProps {
  db: string;
  isSelected: boolean;
  select: () => void;
}
const DbEntry = ({ db, isSelected, select }: DbEntryProps) => (
  // TODO: conditional style basend on isSelected
  <li onClick={select}>{`${db} ${isSelected ? '<' : ''}`}</li>
);

const DbList = ({ selectedDb, setSelectedDb }: DbListProps) => {
  const [databases, setDatabases] = useState<string[]>([]);

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // Listen to backend for updates to list of available databases
  ipcRenderer.on('db-lists', (evt: IpcMainEvent, dbLists: unknown) => {
    if (isDbLists(dbLists)) {
      setDatabases(dbLists.databaseList);
    }
    // TODO: handle false bug
  });

  const createSelectHandler = (dbName: string) => () => {
    setSelectedDb(dbName);
    ipcRenderer.send('change-db', dbName);
  };

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



