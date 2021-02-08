import React, { useState } from 'react';
import GlobalStyle from '../GlobalStyle';
// import styled from 'styled-components'
// import {} from '../style-variables'
import { AppState, CreateNewQuery, QueryData } from '../types';
import { createQuery, key } from '../lib/queries';
import Sidebar from './sidebar/Sidebar';
import QueryView from './views/QueryView/QueryView';
import DbView from './views/DbView/DbView';
import CompareView from './views/CompareView/CompareView';
import QuickStartView from './views/QuickStartView';

const App = () => {
  const [queries, setQueries] = useState<AppState['queries']>({});
  const [comparedQueries, setComparedQueries] = useState<AppState['queries']>(
    {}
  );
  const [workingQuery, setWorkingQuery] = useState<AppState['workingQuery']>();
  const [selectedView, setSelectedView] = useState<AppState['selectedView']>(
    'quickStartView'
  );

  const [selectedDb, setSelectedDb] = useState<AppState['selectedDb']>('');

  /**
   * Hook to create new Query from data
   */
  const createNewQuery: CreateNewQuery = (query: QueryData) => {
    const newQueries = createQuery(queries, query);
    setQueries(newQueries);
    // we must set working query to newly created query otherwise query view won't update
    setWorkingQuery(newQueries[key(query)]);
  };

  // determine which view should be visible depending on selected view and
  // prerequisites for each view
  let shownView: AppState['selectedView'];
  switch (selectedView) {
    case 'compareView':
      shownView = 'compareView';
      break;
    case 'dbView':
      if (!selectedDb) {
        shownView = 'quickStartView';
        break;
      }
      shownView = 'dbView';
      break;
    case 'queryView':
      if (!queries.selected && !selectedDb) {
        shownView = 'quickStartView';
        break;
      }
      shownView = 'queryView';
      break;
    case 'quickStartView':
    default:
      shownView = 'quickStartView';
  }

  return (
    <>
      <GlobalStyle />
      <Sidebar
        {...{
          queries,
          setQueries,
          comparedQueries,
          setComparedQueries,
          selectedView,
          setSelectedView,
          selectedDb,
          setSelectedDb,
          workingQuery,
          setWorkingQuery,
        }}
      />
      <CompareView
        queries={comparedQueries}
        show={shownView === 'compareView'}
      />
      <DbView selectedDb={selectedDb} show={shownView === 'dbView'} />
      <QueryView
        query={workingQuery}
        setQuery={setWorkingQuery}
        selectedDb={selectedDb}
        setSelectedDb={setSelectedDb}
        createNewQuery={createNewQuery}
        show={shownView === 'queryView'}
      />
      <QuickStartView show={shownView === 'quickStartView'} />
    </>
  );
};

export default App;
