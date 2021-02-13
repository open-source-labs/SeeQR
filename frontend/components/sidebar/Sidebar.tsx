import React, { useState } from 'react';
import { Drawer, IconButton, Tooltip } from '@material-ui/core/';
import { makeStyles } from '@material-ui/core/styles';
import styled from 'styled-components';
import { AppState } from '../../types';
import TopButtons from './TopButtons';
import QueryList from './QueryList';
import DbList from './DbList';
import ViewSelector from './ViewSelector';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';

import { greyDarkest, sidebarWidth, sidebarShowButtonSize } from '../../style-variables';

// TODO: try to refactor with styled components
const useStyles = makeStyles(() => ({
  drawerPaper: {
    width: sidebarWidth,
    padding: 0,
    background: greyDarkest,
    display: 'flex',
    'flex-direction': 'column',
    'align-items': 'center',
  },
}));

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

  const classes = useStyles();

  return (
    <>
      <Tooltip title="Show Sidebar">
        <ShowSidebarBtn onClick={toggleOpen} size="small">
          <ArrowForwardIosIcon />
        </ShowSidebarBtn>
      </Tooltip>
      <Drawer
        variant="persistent"
        anchor="left"
        open={!sidebarIsHidden}
        classes={{ paper: classes.drawerPaper }}
      >
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
      </Drawer>
    </>
  );
};

export default Sidebar;
