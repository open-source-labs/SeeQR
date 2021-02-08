import React from 'react';
import { AppState } from '../../types';
import TopButtons from './TopButtons';
import QueryList from './QueryList';
import DbList from './DbList';

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
> 

type ViewSelectorProps = Pick<AppState, 'selectedView' | 'setSelectedView'>;

/**
 * Selector for view on sidebar. Updates App state with selected view
 */
const ViewSelector = ({ selectedView, setSelectedView }: ViewSelectorProps) => (
  <div>
    <button type="button" onClick={() => setSelectedView('queryView')}>
      Queries
    </button>
    <button type="button" onClick={() => setSelectedView('dbView')}>
      Databases
    </button>
  </div>
);

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
    setSelectedView('queryView')
    setWorkingQuery(undefined)
  }

  const renderList = () => {
    switch (selectedView) {
      case 'queryView':
        return (
          <QueryList
            setComparedQueries={setComparedQueries}
            comparedQueries={comparedQueries}
            setQueries={setQueries}
            queries={queries}
            createQuery={showEmptyQuery}
            workingQuery={workingQuery}
            setWorkingQuery={setWorkingQuery}
          />
        );
      case 'dbView':
        return <DbList {...{ selectedDb, setSelectedDb }} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <TopButtons {...{ selectedView, setSelectedView }} />
      <ViewSelector {...{ selectedView, setSelectedView }} />
      {renderList()}
    </div>
  );
};

export default Sidebar;
