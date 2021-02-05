import React, { useState } from 'react';
import GlobalStyle from '../GlobalStyle';
// import styled from 'styled-components'
// import {} from '../style-variables'
import { AppState, CreateQuery } from '../types';
import SavedQueries from '../classes/SavedQueries';
import Sidebar from './sidebar/Sidebar';
import QueryView from './views/QueryView';
import DbView from './views/DbView';
import CompareView from './views/CompareView';

const App = () => {
  const [queries, setQueries] = useState<AppState['queries']>(
    new SavedQueries()
  );
  queries.hookStateUpdater(setQueries);

  const [selectedView, setSelectedView] = useState<AppState['selectedView']>(
    'queryView'
  );
  const [selectedDb, setSelectedDb] = useState<AppState['selectedDb']>('');

  const renderView = () => {
    switch (selectedView) {
      case 'queryView': {
        if (!queries.selected) return null;
        return <QueryView query={queries.selected} />;
      }
      case 'dbView':
        return <DbView />;
      case 'compareView':
        return <CompareView />;
      default:
        return null;
    }
  };

  const createQuery: CreateQuery = () => {
    // TODO: notify user that no db has been selected
    if (!selectedDb) return;
    queries.create('Untitled', selectedDb);
  };

  // TODO: Temp test
  if (!queries.length) {
    queries.set('ClaudioLabel', 'MainDb', {
      label: 'ClaudioLabel',
      db: 'MainDb',
      sqlString: 'SELECT * FROM people;',
    });
  }

  return (
    <>
      <GlobalStyle />
      <Sidebar
        {...{
          queries,
          selectedView,
          setSelectedView,
          selectedDb,
          setSelectedDb,
          createQuery,
        }}
      />
      {renderView()}
    </>
  );
};

export default App;
