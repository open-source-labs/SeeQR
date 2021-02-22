import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { IpcMainEvent } from 'electron';
import { IconButton, Tooltip } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import AddNewDbModal from '../modal/AddNewDbModalCorrect';
import { AppState, isDbLists } from '../../types';
import { once, sendFeedback } from '../../lib/utils';
import DuplicateDbModal from '../modal/DuplicateDbModal';
import DbEntry from './DbEntry';
import logo from '../../../assets/logo/seeqr_dock.png';
import { SidebarList } from '../../style-variables';
import { greyDarkest } from '../../style-variables';

// TODO: how to type ipcRenderer ?
const { ipcRenderer } = window.require('electron');

// emitting with no payload requests backend to send back a db-lists event with list of dbs
const requestDbListOnce = once(() => ipcRenderer.send('return-db-list'));

const StyledSidebarList = styled(SidebarList)`
  background-color: ${greyDarkest};
`;

type DbListProps = Pick<AppState, 'selectedDb' | 'setSelectedDb'> & {
  show: boolean;
};

const DbList = ({ selectedDb, setSelectedDb, show }: DbListProps) => {
  const [databases, setDatabases] = useState<string[]>([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openDupe, setOpenDupe] = useState(false);
  const [dbToDupe, setDbToDupe] = useState('');

  useEffect(() => {
    // Listen to backend for updates to list of available databases
    const dbListFromBackend = (evt: IpcMainEvent, dbLists: unknown) => {
      if (isDbLists(dbLists)) {
        setDatabases(dbLists.databaseList.map((db) => db.db_name));
      }
    };
    ipcRenderer.on('db-lists', dbListFromBackend);
    requestDbListOnce();
    // return cleanup function
    return () => ipcRenderer.removeListener('db-lists', dbListFromBackend);
  });

  const handleClickOpenAdd = () => {
    setOpenAdd(true);
  };

  const handleCloseAdd = () => {
    setOpenAdd(false);
  };

  const handleClickOpenDupe = (dbName: string) => {
    setDbToDupe(dbName);
    setOpenDupe(true);
  };

  const handleCloseDupe = () => {
    setOpenDupe(false);
  };

  const selectHandler = (dbName: string) => {
    if (dbName === selectedDb) return 
    ipcRenderer
      .invoke('select-db', dbName)
      .then(() => {
        setSelectedDb(dbName);
      })
      .catch(() =>
        sendFeedback({
          type: 'error',
          message: `Failed to connect to ${dbName}`,
        })
      );
  };

  if (!show) return null;
  return (
    <>
      <Tooltip title="Import Database">
        <IconButton onClick={handleClickOpenAdd}>
          <AddIcon fontSize="large" />
        </IconButton>
      </Tooltip>
      <StyledSidebarList>
        {databases.map((dbName) => (
          <DbEntry
            key={`dbList_${dbName}`}
            db={dbName}
            isSelected={selectedDb === dbName}
            select={selectHandler}
            duplicate={() => handleClickOpenDupe(dbName)}
          />
        ))}
        {openDupe ? (
          <DuplicateDbModal
            open={openDupe}
            onClose={handleCloseDupe}
            dbCopyName={dbToDupe}
            databases={databases}
          />
        ) : null}
      </StyledSidebarList>
      <AddNewDbModal
        open={openAdd}
        onClose={handleCloseAdd}
        databases={databases}
      />
    </>
  );
};

export default DbList;
