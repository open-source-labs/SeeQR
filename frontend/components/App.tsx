import React, { useState } from 'react';
import styled from 'styled-components';
import { MuiThemeProvider } from '@material-ui/core/';
import { StylesProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import {
  MuiTheme,
  bgColor,
  sidebarWidth,
  defaultMargin,
  sidebarShowButtonSize,
} from '../style-variables';
import GlobalStyle from '../GlobalStyle';
import { AppState, CreateNewQuery, QueryData } from '../types';
import { createQuery, key } from '../lib/queries';
import Sidebar from './sidebar/Sidebar';
import QueryView from './views/QueryView/QueryView';
import DbView from './views/DbView/DbView';
import CompareView from './views/CompareView/CompareView';
import QuickStartView from './views/QuickStartView';
import FeedbackModal from './modal/FeedbackModal';
import Spinner from './modal/Spinner';

const AppContainer = styled.div`
  display: grid;
  grid: 'sidebar main' 1fr / ${sidebarWidth} 1fr;
  padding: 0;
`;

// prettier-ignore
const Main = styled.main<{ $fullwidth: boolean }>`
  grid-area: ${({ $fullwidth }) => ($fullwidth ? '1 / 1 / -1 / -1' : 'main')};
  background: ${bgColor};
  height: calc(100vh - (2 * ${defaultMargin}));
  max-width: ${({ $fullwidth }) => ($fullwidth ? '' : `calc(100vw - ${sidebarWidth} )`)};
  padding: ${defaultMargin} ${sidebarShowButtonSize};
  margin: 0;
`;

const App = () => {
  const [queries, setQueries] = useState<AppState['queries']>({});
  const [comparedQueries, setComparedQueries] = useState<AppState['queries']>(
    {}
  );
  const [workingQuery, setWorkingQuery] = useState<AppState['workingQuery']>();
  const [selectedView, setSelectedView] = useState<AppState['selectedView']>(
    'dbView'
  );

  const [selectedDb, setSelectedDb] = useState<AppState['selectedDb']>('');
  const [sidebarIsHidden, setSidebarHidden] = useState(false);

  /**
   * Hook to create new Query from data
   */
  const createNewQuery: CreateNewQuery = (query: QueryData) => {
    // Only save query to saved queries if it contains all minimum information
    if (query.label && query.db && query.sqlString) {
      const newQueries = createQuery(queries, query);
      setQueries(newQueries);
    }
    // we must set working query to newly created query otherwise query view won't update
    setWorkingQuery(query);
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
    // Styled Components must be injected last in order to override Material UI style: https://material-ui.com/guides/interoperability/#controlling-priority-3
    <StylesProvider injectFirst>
      <MuiThemeProvider theme={MuiTheme}>
        <Spinner />
        <AppContainer>
          <CssBaseline />
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
              setSidebarHidden,
              sidebarIsHidden,
            }}
          />
          <Main $fullwidth={sidebarIsHidden}>
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
          </Main>
          <FeedbackModal />
        </AppContainer>
      </MuiThemeProvider>
    </StylesProvider>
  );
};

export default App;
