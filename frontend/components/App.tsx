import React, { useState, useEffect } from 'react';
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
import { AppState, CreateNewQuery, QueryData, DBType, isDbLists, DatabaseInfo, TableInfo, DbLists } from '../types';
import { createQuery, key } from '../lib/queries';
import Sidebar from './sidebar/Sidebar';
import QueryView from './views/QueryView/QueryView';
import DbView from './views/DbView/DbView';
import CompareView from './views/CompareView/CompareView';
import QuickStartView from './views/QuickStartView';
import NewSchemaView from './views/NewSchemaView/NewSchemaView';
import FeedbackModal from './modal/FeedbackModal';
import Spinner from './modal/Spinner';
import { once, } from './../lib/utils';
import { IpcRendererEvent, ipcRenderer } from 'electron';

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
  max-width: ${({ $fullwidth }) => ($fullwidth ? '' : `calc(90vw - ${sidebarWidth} )`)};
  padding: ${defaultMargin} ${sidebarShowButtonSize};
  margin: 0;
`;

// emitting with no payload requests backend to send back a db-lists event with list of dbs
const requestDbListOnce = once(() => ipcRenderer.send('return-db-list'));

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
  const [newFilePath, setFilePath] = useState<AppState['newFilePath']>('');
  const [ERView, setERView] = useState(true);

  const [DBInfo, setDBInfo] = useState<DatabaseInfo[]>();
  const [curDBType, setDBType] = useState<DBType>();

  const [dbTables, setTables] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableInfo | undefined>();

  useEffect(() => {
    // Listen to backend for updates to list of available databases
    const dbListFromBackend = (evt: IpcRendererEvent, dbLists: DbLists) => {
      if (isDbLists(dbLists)) {
        setDBInfo(dbLists.databaseList);
        setTables(dbLists.tableList);
        setSelectedTable(selectedTable? selectedTable : dbTables[0]);
      }
    };
    ipcRenderer.on('db-lists', dbListFromBackend);
    requestDbListOnce();
    // return cleanup function
    return () => {
      ipcRenderer.removeListener('db-lists', dbListFromBackend);
    };
  });

  /**
   * Hook to create new Query from data
   */
  const createNewQuery: CreateNewQuery = (query: QueryData) => {
    // Only save query to saved queries if it contains all minimum information
    if (query.label && query.db && query.sqlString && query.group) {
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
    case 'newSchemaView': 
      shownView = 'newSchemaView';
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
              setFilePath,
              newFilePath,
              setERView,
              curDBType,
              setDBType,
              DBInfo,
              setDBInfo,
              dbTables,
              setTables,
              selectedTable,
              setSelectedTable
            }}
          />
          <Main $fullwidth={sidebarIsHidden}>
            <CompareView
              queries={comparedQueries}
              show={shownView === 'compareView'}
            />
            <DbView 
              selectedDb={selectedDb} 
              show={shownView === 'dbView'}
              setERView={setERView} 
              ERView={ERView}
              curDBType={curDBType}
              setDBType={setDBType}
              DBInfo={DBInfo}
              setDBInfo={setDBInfo}
              dbTables={dbTables}
              setTables={setTables}
              selectedTable={selectedTable}
              setSelectedTable={setSelectedTable}
            />
            <QueryView
              query={workingQuery}
              setQuery={setWorkingQuery}
              selectedDb={selectedDb}
              setSelectedDb={setSelectedDb}
              createNewQuery={createNewQuery}
              show={shownView === 'queryView'}
              queries={queries}
              curDBType={curDBType}
              setDBType={setDBType}
              DBInfo={DBInfo}
              setDBInfo={setDBInfo}
            />
            <QuickStartView show={shownView === 'quickStartView'} />
            <NewSchemaView 
              query={workingQuery}
              setQuery={setWorkingQuery}
              selectedDb={selectedDb}
              setSelectedDb={setSelectedDb}
              createNewQuery={createNewQuery}
              show={shownView === 'newSchemaView'} 
              curDBType={curDBType}
              setDBType={setDBType}
              DBInfo={DBInfo}
              setDBInfo={setDBInfo}
              dbTables={dbTables}
              setTables={setTables}
              selectedTable={selectedTable}
              setSelectedTable={setSelectedTable}
            />
          </Main>
          <FeedbackModal />
        </AppContainer>
      </MuiThemeProvider>
    </StylesProvider>
  );
};

export default App;
