import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { IpcRendererEvent, ipcRenderer } from 'electron';
import { IconButton, Tooltip } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import AddNewDbModal from '../modal/AddNewDbModalCorrect';
import {
  AppState,
  isDbLists,
  DatabaseInfo,
  TableInfo,
} from '../../types';
import { DBType } from '../../../backend/BE_types';
import { sendFeedback } from '../../lib/utils';
import DuplicateDbModal from '../modal/DuplicateDbModal';
import DbEntry from './DbEntry';
import { SidebarList, greyDarkest } from '../../style-variables';

const StyledSidebarList = styled(SidebarList)`
  background-color: ${greyDarkest};
`;

type DbListProps = Pick<
  AppState,
  'selectedDb' | 'setSelectedDb' | 'setSelectedView'
> & {
  show: boolean;
  curDBType: DBType | undefined;
  setDBType: (dbType: DBType | undefined) => void;
  DBInfo: DatabaseInfo[] | undefined;
  setDBInfo: (dbInfo: DatabaseInfo[] | undefined) => void;
  dbTables: TableInfo[];
  setTables: (tableInfo: TableInfo[]) => void;
  selectedTable: TableInfo | undefined;
  setSelectedTable: (tableInfo: TableInfo | undefined) => void;
};

const DbList = ({
  selectedDb,
  setSelectedDb,
  setSelectedView,
  show,
  curDBType,
  setDBType,
  DBInfo,
  setDBInfo,
  dbTables,
  setTables,
  selectedTable,
  setSelectedTable,
}: DbListProps) => {
  const [openAdd, setOpenAdd] = useState(false);
  const [openDupe, setOpenDupe] = useState(false);
  const [dbToDupe, setDbToDupe] = useState('');

  // I think this returns undefined if DBInfo is falsy idk lol
  const dbNames = DBInfo?.map((dbi) => dbi.db_name);

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

  const selectHandler = (dbName: string, cdbt: DBType | undefined) => {
    setSelectedView('dbView');
    if (dbName === selectedDb) return;
    ipcRenderer
      .invoke('select-db', dbName, cdbt)
      .then(() => {
        setSelectedDb(dbName);
        setDBType(cdbt);
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
        {DBInfo?.map((dbi) => (
          <DbEntry
            key={`dbList_${dbi.db_name}`}
            db={dbi.db_name}
            isSelected={selectedDb === dbi.db_name}
            select={selectHandler}
            duplicate={() => handleClickOpenDupe(dbi.db_name)}
            dbType={dbi.db_type}
          />
        ))}
        {openDupe ? (
          <DuplicateDbModal
            open={openDupe}
            onClose={handleCloseDupe}
            dbCopyName={dbToDupe}
            dbNames={dbNames}
            curDBType={curDBType}
          />
        ) : null}
      </StyledSidebarList>
      <AddNewDbModal
        open={openAdd}
        onClose={handleCloseAdd}
        dbNames={dbNames}
        curDBType={curDBType}
      />
    </>
  );
};

export default DbList;
