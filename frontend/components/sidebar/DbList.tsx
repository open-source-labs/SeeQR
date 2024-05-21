import React, { useState } from 'react';
import styled from 'styled-components';
import { ipcRenderer } from 'electron';
import { IconButton, Tooltip, Menu, MenuItem } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddNewDbModal from '../modal/AddNewDbModalCorrect';
import { AppState, DatabaseInfo, DBType } from '../../../shared/types/types';
import { sendFeedback } from '../../lib/utils';
import DuplicateDbModal from '../modal/DuplicateDbModal';
import DbEntry from './DbEntry';
import { SidebarList, greyDarkest } from '../../style-variables';
import {
  useAppViewContext,
  useAppViewDispatch,
} from '../../state_management/Contexts/AppViewContext';

const StyledSidebarList = styled(SidebarList)`
  background-color: ${greyDarkest};
  width: 90%;
  align-self: flex-start;
  overflow: auto;
  max-height: calc(100vh - 300px);
  ::-webkit-scrollbar {
    width: 5px;
  }
  ::-webkit-scrollbar-track {
    border-radius: 5px;
    background: rgba(255, 255, 255, 0.1);
  }
  ::-webkit-scrollbar-thumb {
    background: white;
    border-radius: 5px;
  }
`;

type DbListProps = Pick<AppState, 'selectedDb' | 'setSelectedDb'> & {
  show: boolean;
  curDBType: DBType | undefined;
  setDBType: (dbType: DBType | undefined) => void;
  DBInfo: DatabaseInfo[] | undefined;
};

function DbList({
  selectedDb,
  setSelectedDb,
  show,
  curDBType,
  setDBType,
  DBInfo,
}: DbListProps) {
  const [openAdd, setOpenAdd] = useState(false);
  const [openDupe, setOpenDupe] = useState(false);
  const [dbToDupe, setDbToDupe] = useState('');

  // filter button
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [filterBy, setFilterBy] = useState<string>('All');
  const openFilter = Boolean(anchorEl);

  // I think this returns undefined if DBInfo is falsy idk lol
  const dbNames = DBInfo?.map((dbi) => dbi.db_name);

  const appViewStateContext = useAppViewContext();
  const appViewDispatchContext = useAppViewDispatch();

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
    if (appViewStateContext?.selectedView === 'threeDView') {
      appViewDispatchContext!({
        type: 'SELECTED_VIEW',
        payload: 'threeDView',
      });
    } else {
      appViewDispatchContext!({
        type: 'SELECTED_VIEW',
        payload: 'dbView',
      });
    }
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
        }),
      );
  };

  const handleClickFilter = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleCloseFilter = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(null);
    setFilterBy(e.currentTarget.innerText || filterBy);
  };

  //  filter options
  const dbNamesArr = [
    'All',
    'MySql',
    'Postgres',
    'RDS Mysql',
    'RDS Postgres',
    'SQLite',
  ];

  const dbNamesObj = {
    All: 'all',
    MySql: 'mysql',
    Postgres: 'pg',
    'RDS Mysql': 'rds-mysql',
    'RDS Postgres': 'rds-pg',
    SQLite: 'sqlite',
  };

  if (!show) return null;
  return (
    <>
      <div style={{ display: 'flex' }}>
        <Tooltip title="Filter By Database">
          <IconButton onClick={handleClickFilter}>
            <FilterListIcon fontSize="large" />
          </IconButton>
        </Tooltip>
        <Menu
          id="filter-menu"
          MenuListProps={{
            'aria-labelledby': 'filter',
          }}
          anchorEl={anchorEl}
          open={openFilter}
          onClose={handleCloseFilter}
        >
          {dbNamesArr.map((option) => (
            <MenuItem
              key={option}
              selected={option === filterBy}
              onClick={handleCloseFilter}
              sx={{ color: 'black' }}
            >
              {option}
            </MenuItem>
          ))}
        </Menu>
        <Tooltip title="Import Database">
          <IconButton onClick={handleClickOpenAdd} size="large">
            <UploadFileIcon fontSize="large" />
          </IconButton>
        </Tooltip>
      </div>
      <StyledSidebarList>
        {DBInfo?.map((dbi): JSX.Element | undefined => {
          if (dbi.db_type === dbNamesObj[filterBy] || filterBy === 'All') {
            return (
              <DbEntry
                key={`dbList_${dbi.db_name}_${dbi.db_type}`}
                db={dbi.db_name}
                isSelected={selectedDb === dbi.db_name}
                select={selectHandler}
                duplicate={() => handleClickOpenDupe(dbi.db_name)}
                dbType={dbi.db_type}
              />
            );
          }
          return undefined;
        })}
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
}

export default DbList;
