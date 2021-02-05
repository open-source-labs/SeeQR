import React, { useState, useEffect } from 'react';
import GlobalStyle from '../GlobalStyle';
// import styled from 'styled-components'
// import {} from '../style-variables'
import { AppState, userCreateQuery } from '../types';
import SavedQueries from '../classes/SavedQueries';
import type { QueryData } from '../classes/Query';
import Sidebar from './sidebar/Sidebar';
import QueryView from './views/QueryView';
import DbView from './views/DbView';
import CompareView from './views/CompareView';
import QuickStartView from './views/QuickStartView';

const { ipcRenderer } = window.require('electron');

const App = () => {
  const [queries, setQueries] = useState<AppState['queries']>(
    new SavedQueries()
  );

  // store state updated on the instance of SavedQueries. This is used by the
  // SavedQueries class to update state on this component without needing to
  // drill down setQueries to all components that receive queries
  queries.hookStateUpdater(setQueries);

  const [selectedView, setSelectedView] = useState<AppState['selectedView']>(
    'quickStartView'
  );
  const [selectedDb, setSelectedDb] = useState<AppState['selectedDb']>('');

  useEffect(() => {
    // emitting with no payload requests backend to send back a db-lists event with list of dbs
    ipcRenderer.send('return-db-list');
  });

  // TODO: refactor as a component with props ?
  const renderView = () => {
    switch (selectedView) {
      case 'dbView':
        return <DbView />;
      case 'compareView':
        return <CompareView />;
      case 'queryView': {
        if (!queries.selected && !selectedDb) return <QuickStartView />;

        return (
          <QueryView
            query={queries.selected}
            selectedDb={selectedDb}
            createNewQuery={(query: QueryData) => queries.create(query)}
          />
        );
      }
      case 'quickStartView':
      default:
        return <QuickStartView />;
    }
  };

  const createQuery: userCreateQuery = () => {
    queries.deselectAll();
    setSelectedView('queryView');
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
