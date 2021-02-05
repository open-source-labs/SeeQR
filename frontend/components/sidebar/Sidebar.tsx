import React from 'react';
import { AppState, userCreateQuery } from '../../types';
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
> & {createQuery : userCreateQuery};

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
  selectedView,
  setSelectedView,
  selectedDb,
  setSelectedDb,
  createQuery,
  queries,
}: SidebarProps) => {
  const renderList = () => {
    switch (selectedView) {
      case 'queryView':
        return (
          <QueryList
            queries={queries}
            createQuery={createQuery}
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
