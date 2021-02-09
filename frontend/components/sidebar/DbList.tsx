import React, { useState, useEffect } from 'react';
import { IpcMainEvent } from 'electron';
import { IconButton, Tooltip } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import AddNewDbModal from '../modal/addNewDbModal';
import DbEntry from './DbEntry';
import { AppState, isDbLists } from '../../types';
import { once } from '../../lib/utils';
import {SidebarList} from '../../style-variables'

// TODO: how to type ipcRenderer ?
const { ipcRenderer } = window.require('electron');

// emitting with no payload requests backend to send back a db-lists event with list of dbs
const requestDbListOnce = once(() => ipcRenderer.send('return-db-list'));

type DbListProps = Pick<AppState, 'selectedDb' | 'setSelectedDb'> & {
  show: boolean;
};

const DbList = ({ selectedDb, setSelectedDb, show }: DbListProps) => {
  const [databases, setDatabases] = useState<string[]>([]);
  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    // Listen to backend for updates to list of available databases
    const dbListFromBackend = (evt: IpcMainEvent, dbLists: unknown) => {
      if (isDbLists(dbLists)) {
        setDatabases(dbLists.databaseList);
      }
    };
    ipcRenderer.on('db-lists', dbListFromBackend);
    requestDbListOnce();
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

  if (!show) return null;
  return (
    <>
      <SidebarList>
        {databases.map((dbName) => (
          <DbEntry
            key={`dbList_${dbName}`}
            db={dbName}
            isSelected={selectedDb === dbName}
            select={createSelectHandler(dbName)}
          />
        ))}
      </SidebarList>
      <Tooltip title="Import Database">
        <IconButton onClick={handleClickOpen}>
          <AddIcon fontSize="large" />
        </IconButton>
      </Tooltip>
      {/* Validate Db name doesnt exist */}
      <AddNewDbModal open={open} onClose={handleClose} />
    </>
  );
};

export default DbList;
