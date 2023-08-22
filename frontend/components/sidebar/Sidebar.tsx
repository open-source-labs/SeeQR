// Mui imports
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Drawer, IconButton, Tooltip } from '@mui/material/';

import React from 'react';
import styled from 'styled-components';
import logo from '../../../assets/logo/seeqr_dock.png';

// Types
import { AppState, DatabaseInfo } from '../../types';
import { DBType } from '../../../backend/BE_types';

import BottomButtons from './BottomButtons';
import DbList from './DbList';
import QueryList from './QueryList';
import TopButtons from './TopButtons';
import ViewSelector from './ViewSelector';

import {
  greyDarkest,
  sidebarShowButtonSize,
  sidebarWidth,
} from '../../style-variables';
import {
  useAppViewContext,
  useAppViewDispatch,
} from '../../state_management/Contexts/AppViewContext';

const StyledDrawer = styled(Drawer)`
  & .MuiDrawer-paper {
    width: ${sidebarWidth};
    padding: 0;
    background: ${greyDarkest};
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: hidden;
  }
`;

const Logo = styled.img`
  position: fixed;
  bottom: 100px;
  left: calc(${sidebarWidth} / 2);
  transform: translateX(-50%);
  opacity: 0.5;
  z-index: -1;
  filter: grayscale(100%);
  width: 100px;
  height: 100px;
`;

const ShowSidebarBtn = styled(IconButton)`
  width: 40px;
  height: ${sidebarShowButtonSize};
  position: fixed;
  top: 50%;
  z-index: 200;
  background: #57a777;
  border-radius: 0 15px 15px 0;
  transition: all 0.3s ease;
  &:hover {
    background: #57a777;
    opacity: 0.6;
    color: white;
  }
`;

const HideSidebarBtn = styled(IconButton)`
  width: 40px;
  height: ${sidebarShowButtonSize};
  z-index: 200;
  background: #57a777;
  border-radius: 15px 0 0 15px;
  transition: all 0.3s ease;
  &:hover {
    background: #57a777;
    opacity: 0.6;
    color: white;
  }
`;

const HideSidebarBtnContainer = styled.div`
  position: absolute;
  display: flex;
  width: 25px;
  height: 100vh;
  background: transparent;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  align-self: flex-end;
`;

interface SideBarProps {
  selectedDb: AppState['selectedDb'];
  setSelectedDb: AppState['setSelectedDb'];
  setERView: AppState['setERView'];
  curDBType: DBType | undefined;
  setDBType: (dbType: DBType | undefined) => void;
  DBInfo: DatabaseInfo[] | undefined;
  queryDispatch: ({ type, payload }) => void;
}
function Sidebar({
  selectedDb,
  setSelectedDb,
  setERView,
  curDBType,
  setDBType,
  DBInfo,
  queryDispatch,
}: SideBarProps) {
  // allowing the use of context and dispatch from the parent provider.
  const appViewStateContext = useAppViewContext();
  const appViewDispatchContext = useAppViewDispatch();
  const toggleOpen = () => appViewDispatchContext!({ type: 'TOGGLE_SIDEBAR' });
  /**
   * Show empty query view for user to create new query.
   * Deselects all queries and goes to queryView
   */
  const showEmptyQuery = () => {
    appViewDispatchContext!({ type: 'SELECTED_VIEW', payload: 'queryView' });

    queryDispatch({
      type: 'UPDATE_WORKING_QUERIES',
      payload: undefined,
    });
    // setWorkingQuery(undefined);
  };

  return (
    <>
      {/* this componenet just shows tooltip when you hover your mouse over the sidebar open and close button. */}
      <Tooltip title="Show Sidebar">
        <ShowSidebarBtn onClick={toggleOpen} size="small">
          <ArrowForwardIosIcon />
        </ShowSidebarBtn>
      </Tooltip>

      {/* shows if the default menu is open or closed. */}
      <StyledDrawer
        variant="persistent"
        anchor="left"
        open={!appViewStateContext?.sideBarIsHidden}
      >
        <div>
          <TopButtons />
          <ViewSelector {...{ setERView }} />
        </div>
        {/* this is just the list of all the connected dbs */}
        <DbList
          selectedDb={selectedDb}
          setSelectedDb={setSelectedDb}
          // the question marks are just for typescript because it thinks there could be a null value, so we're just letting it abide by that strict rule that there is a possibility of a null value.
          show={
            appViewStateContext?.selectedView === 'dbView' ||
            appViewStateContext?.selectedView === 'quickStartView' ||
            appViewStateContext?.selectedView === 'newSchemaView' ||
            appViewStateContext?.selectedView === 'threeDView'
          }
          curDBType={curDBType}
          setDBType={setDBType}
          DBInfo={DBInfo}
        />
        {/* this is the view for all your queries that were saved whenever you ran a query */}
        <QueryList
          createQuery={showEmptyQuery}
          show={
            appViewStateContext?.selectedView === 'queryView' ||
            appViewStateContext?.selectedView === 'compareView'
          }
        />
        <BottomButtons />
        <Logo src={logo} alt="Logo" />
        <HideSidebarBtnContainer>
          <Tooltip title="Hide Sidebar">
            <HideSidebarBtn onClick={toggleOpen} size="large">
              <ArrowBackIosIcon />
            </HideSidebarBtn>
          </Tooltip>
        </HideSidebarBtnContainer>
      </StyledDrawer>
    </>
  );
}

export default Sidebar;
