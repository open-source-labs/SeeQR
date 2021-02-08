import React, { useState  } from 'react';
import GlobalStyle from '../GlobalStyle';
// import styled from 'styled-components'
// import {} from '../style-variables'
import { AppState, CreateNewQuery, QueryData } from '../types';
import { createQuery } from '../lib/queries';
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
  const createNewQuery: CreateNewQuery = (query: QueryData) =>
    setQueries(createQuery(queries, query));

  // TODO: refactor as a component with props ?
  const renderView = () => {
    switch (selectedView) {
      case 'dbView':
        if (!selectedDb) return <QuickStartView />;
        return <DbView selectedDb={selectedDb} />;
      case 'compareView':
        return <CompareView queries={comparedQueries} />;
      case 'queryView': {
        if (!queries.selected && !selectedDb) return <QuickStartView />;

        return (
          <QueryView
            query={workingQuery}
            setQuery={setWorkingQuery}
            selectedDb={selectedDb}
            createNewQuery={createNewQuery}
          />
        );
      }
      case 'quickStartView':
      default:
        return <QuickStartView />;
    }
  };

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
      {renderView()}
    </>
  );
};

export default App;
