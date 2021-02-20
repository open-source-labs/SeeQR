import React from 'react';
import { Drawer, IconButton, Tooltip } from '@material-ui/core/';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import styled from 'styled-components';
import { AppState } from '../../types';
import TopButtons from './TopButtons';
import QueryList from './QueryList';
import DbList from './DbList';
import ViewSelector from './ViewSelector';
import logo from '../../../assets/logo/seeqr_dock.png';

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
  bottom: 10px;
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
        <ViewSelector {...{ selectedView, setSelectedView }} />
        <DbList
          selectedDb={selectedDb}
          setSelectedDb={setSelectedDb}
          show={selectedView === 'dbView'}
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
        />
        <Logo src={logo} alt="Logo" />
      </StyledDrawer>
    </>
  );
};

export default Sidebar;
