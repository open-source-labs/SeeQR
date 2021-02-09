import React from 'react';
import { Drawer } from '@material-ui/core/';
import { makeStyles } from '@material-ui/core/styles';
import { AppState } from '../../types';
import TopButtons from './TopButtons';
import QueryList from './QueryList';
import DbList from './DbList';
import ViewSelector from './ViewSelector';

import { greyDarkest, sidebarWidth } from '../../style-variables';

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

type SidebarProps = Pick<
  AppState,
  | 'selectedDb'
  | 'selectedView'
  | 'setSelectedDb'
  | 'setSelectedView'
  | 'queries'
  | 'setQueries'
  | 'comparedQueries'
  | 'setComparedQueries'
  | 'workingQuery'
  | 'setWorkingQuery'
>;



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
}: SidebarProps) => {
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
    <Drawer
      variant="permanent"
      anchor="left"
      classes={{ paper: classes.drawerPaper }}
    >
      <TopButtons {...{ selectedView, setSelectedView }} />
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
  );
};

export default Sidebar;
