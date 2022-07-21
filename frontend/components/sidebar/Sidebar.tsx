import React, { useState } from 'react';
import { Drawer, IconButton, Tooltip } from '@material-ui/core/';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import styled from 'styled-components';
import { AppState, TableInfo } from '../../types';
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
  width: ${sidebarShowButtonSize};
  height: ${sidebarShowButtonSize};
  position: fixed;
  top: 50%;
  z-index: 200;
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
  dbType,
  setDBType
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
        <TopButtons
          selectedView={selectedView}
          setSelectedView={setSelectedView}
          toggleOpen={toggleOpen}
        />
        <ViewSelector {...{ selectedView, setSelectedView, setERView }} />
        <DbList
          selectedDb={selectedDb}
          setSelectedDb={setSelectedDb}
          show={selectedView === 'dbView' || selectedView === 'quickStartView' || selectedView === 'newSchemaView'}
          setSelectedView={setSelectedView}
          dbType={dbType}
          setDBType={setDBType}
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
          selectedDb={selectedDb}
          selectedView={selectedView}
          setSelectedView={setSelectedView}
          setSelectedDb={setSelectedDb}
        />
        <Logo src={logo} alt="Logo" />
      </StyledDrawer>
    </>
  );
};

export default Sidebar;
