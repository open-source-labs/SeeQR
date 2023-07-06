import React from 'react';
import { Drawer, IconButton, Tooltip } from '@mui/material/';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import styled from 'styled-components';
import { AppState } from '../../types';
import TopButtons from './TopButtons';
import QueryList from './QueryList';
import DbList from './DbList';
import ViewSelector from './ViewSelector';
import logo from '../../../assets/logo/seeqr_dock.png';
import BottomButtons from './BottomButtons';

import {
  greyDarkest,
  sidebarWidth,
  sidebarShowButtonSize,
} from '../../style-variables';

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
  transition: all .3s ease;
  &:hover {
    background: #57a777;
    opacity: .6;
    color: white;
  }
  `;
  
  const HideSidebarBtn = styled(IconButton)`
  width: 40px;
  height: ${sidebarShowButtonSize};
  z-index: 200;
  background: #57a777;
  border-radius: 15px 0 0 15px;
  transition: all .3s ease;
  &:hover {
    background: #57a777;
    opacity: .6;
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

const Sidebar = ({
  setQueries,
  comparedQueries,
  setComparedQueries,
  selectedView,
  setSelectedView,
  selectedDb,
  setSelectedDb,
  queries,
  workingQuery,
  setWorkingQuery,
  setSidebarHidden,
  sidebarIsHidden,
  setFilePath,
  newFilePath,
  setERView,
  curDBType,
  setDBType,
  DBInfo,
  showCreateDialog,
  setCreateDialog,
  setConfigDialog,
}: AppState) => {
  const toggleOpen = () => setSidebarHidden(!sidebarIsHidden);
  /**
   * Show empty query view for user to create new query.
   * Deselects all queries and goes to queryView
   */
  const showEmptyQuery = () => {
    setSelectedView('queryView');
    setWorkingQuery(undefined);
  };

  return (
    <>
      <Tooltip title="Show Sidebar">
        <ShowSidebarBtn onClick={toggleOpen} size="small">
          <ArrowForwardIosIcon />
        </ShowSidebarBtn>
      </Tooltip>
      <StyledDrawer variant="persistent" anchor="left" open={!sidebarIsHidden}>
        <div>
          <TopButtons
            selectedView={selectedView}
            setSelectedView={setSelectedView}
            setConfigDialog={setConfigDialog}
          />
          <ViewSelector {...{ selectedView, setSelectedView, setERView }} />
        </div>
        <DbList
          selectedDb={selectedDb}
          setSelectedDb={setSelectedDb}
          show={
            selectedView === 'dbView' ||
            selectedView === 'quickStartView' ||
            selectedView === 'newSchemaView' ||
            selectedView === 'threeDView'
          }
          setSelectedView={setSelectedView}
          curDBType={curDBType}
          setDBType={setDBType}
          DBInfo={DBInfo}
          selectedView={selectedView}
        />
        <QueryList
          setComparedQueries={setComparedQueries}
          comparedQueries={comparedQueries}
          setQueries={setQueries}
          queries={queries}
          createQuery={showEmptyQuery}
          workingQuery={workingQuery}
          setWorkingQuery={setWorkingQuery}
          show={selectedView === 'queryView' || selectedView === 'compareView'}
          setFilePath={setFilePath}
          newFilePath={newFilePath}
        />
        <BottomButtons
          showCreateDialog={showCreateDialog}
          setCreateDialog={setCreateDialog}
        />
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
};

export default Sidebar;
