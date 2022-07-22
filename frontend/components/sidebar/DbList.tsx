import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { IpcRendererEvent, ipcRenderer } from 'electron';
import { IconButton, Tooltip } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import AddNewDbModal from '../modal/AddNewDbModalCorrect';
import { AppState, isDbLists, DBType } from '../../types';
import { once, sendFeedback } from '../../lib/utils';
import DuplicateDbModal from '../modal/DuplicateDbModal';
import DbEntry from './DbEntry';
import { SidebarList, greyDarkest } from '../../style-variables';

// emitting with no payload requests backend to send back a db-lists event with list of dbs
const requestDbListOnce = once(() => ipcRenderer.send('return-db-list'));

const StyledSidebarList = styled(SidebarList)`
  background-color: ${greyDarkest};
`;

type DbListProps = Pick<
  AppState,
  'selectedDb' | 'setSelectedDb' | 'setSelectedView'
> & {
  show: boolean;
  dbType: DBType;
  setDBType: (DBType) => void;
};

const DbList = ({
  selectedDb,
  setSelectedDb,
  setSelectedView,
  show,
  dbType,
  setDBType
}: DbListProps) => {  
  const [databases, setDatabases] = useState<string[]>([]);
  const [dbTypes, setDBTypes] = useState<DBType[]>([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openDupe, setOpenDupe] = useState(false);
  const [dbToDupe, setDbToDupe] = useState('');

  useEffect(() => {
    // Listen to backend for updates to list of available databases
    const dbListFromBackend = (evt: IpcRendererEvent, dbLists: unknown) => {
      if (isDbLists(dbLists)) {
        setDatabases(dbLists.databaseList.map((db) => db.db_name));
        setDBTypes(dbLists.databaseList.map((db) => db.db_type));
      }
    };
    ipcRenderer.on('db-lists', dbListFromBackend);
    requestDbListOnce();
    // return cleanup function
    return () => {
      ipcRenderer.removeListener('db-lists', dbListFromBackend);
    };
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

  const selectHandler = (dbName: string, dbType: DBType) => {
    // setSelectedView('dbView');
    if (dbName === selectedDb) return;
    ipcRenderer
      .invoke('select-db', dbName, dbType)
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
            dbType={dbTypes[databases.indexOf(dbName)]}
          />
        ))}
        {openDupe ? (
          <DuplicateDbModal
            open={openDupe}
            onClose={handleCloseDupe}
            dbCopyName={dbToDupe}
            databases={databases}
            dbType={dbType}
          />
        ) : null}
      </StyledSidebarList> 
      <AddNewDbModal
        open={openAdd}
        onClose={handleCloseAdd}
        databases={databases}
        dbType={dbType}
      />
    </>
  );
};

export default DbList;
