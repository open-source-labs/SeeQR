import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { ipcRenderer } from 'electron';
import { IconButton, Tooltip, Menu, MenuItem } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddNewDbModal from '../modal/AddNewDbModalCorrect';
import { DatabaseInfo, DBType } from '../../../shared/types/types';
import { sendFeedback } from '../../lib/utils';
import DuplicateDbModal from '../modal/DuplicateDbModal';
import DbEntry from './DbEntry';
import { SidebarList, greyDarkest } from '../../style-variables';
import { RootState, AppDispatch } from '../../state_management/store';
import { selectedView } from '../../state_management/Slices/AppViewSlice';

// Styled component for the sidebar list
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

// Define props for DbList component
type DbListProps = {
  selectedDb: string;
  setSelectedDb: (dbName: string) => void;
  show: boolean;
  curDBType?: DBType;
  setDBType: (dbType: DBType | undefined) => void;
  DBInfo?: DatabaseInfo[];
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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [filterBy, setFilterBy] = useState<string>('All');
  const openFilter = Boolean(anchorEl);

  // Extract dbNames from DBInfo if it exists
  const dbNames = DBInfo ? DBInfo.map((dbi) => dbi.db_name) : [];

  const dbNamesArr = [
    'All',
    'MySql',
    'Postgres',
    'RDS Mysql',
    'RDS Postgres',
    'SQLite',
  ];
  // Map filter options to their corresponding database types
  const dbNamesObj = {
    All: 'all',
    MySql: 'mysql',
    Postgres: 'pg',
    'RDS Mysql': 'rds-mysql',
    'RDS Postgres': 'rds-pg',
    SQLite: 'sqlite',
  };

  const dispatch = useDispatch<AppDispatch>();
  const appViewState = useSelector((state: RootState) => state.appView);

  // Handlers for opening and closing modals
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
  // Handler for selecting a database
  const selectHandler = (dbName: string, cdbt: DBType | undefined) => {
    const viewType =
      appViewState.selectedView === 'threeDView' ? 'threeDView' : 'dbView';
    dispatch(selectedView(viewType));
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
  // Handlers for opening and closing filter menu
  const handleClickFilter = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleCloseFilter = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(null);
    setFilterBy(e.currentTarget.innerText || filterBy);
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
