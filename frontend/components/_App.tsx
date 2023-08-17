import { EventEmitter } from 'events';
import { StyledEngineProvider, Theme, ThemeProvider } from '@mui/material/';
import CssBaseline from '@mui/material/CssBaseline';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import React, { useEffect, useState, useReducer, createContext } from 'react';
import styled from 'styled-components';

import GlobalStyle from '../GlobalStyle';

import { DBType } from '../../backend/BE_types';
import { createQuery } from '../lib/queries';
import '../lib/style.css';
import { once } from '../lib/utils';
import {
  AppState,
  CreateNewQuery,
  DatabaseInfo,
  DbLists,
  isDbLists,
  QueryData,
  TableInfo,
} from '../types';

import {
  bgColor,
  defaultMargin,
  MuiTheme,
  sidebarShowButtonSize,
  sidebarWidth,
} from '../style-variables';

import Sidebar from './sidebar/Sidebar';

import CompareView from './views/CompareView/CompareView';
import DbView from './views/DbView/DbView';
import NewSchemaView from './views/NewSchemaView/NewSchemaView';
import QueryView from './views/QueryView/QueryView';
import QuickStartView from './views/QuickStartView';
import ThreeDView from './views/ThreeDView/ThreeDView';

import FeedbackModal from './modal/FeedbackModal';
import Spinner from './modal/Spinner';

import ConfigView from './Dialog/ConfigView';
import CreateDBDialog from './Dialog/CreateDBDialog';

import {
  viewStateReducer,
  ViewState,
} from '../state_management/Reducers/AppViewReducer';

declare module '@mui/material/styles/' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

const emitter = new EventEmitter();
emitter.setMaxListeners(20);

const AppContainer = styled.div`
  display: grid;
  grid: 'sidebar main' 1fr / ${sidebarWidth} 1fr;
  padding: 0;
`;

// prettier-ignore lint//
const Main = styled.main<{ $fullwidth: boolean }>`
  grid-area: ${({ $fullwidth }) => ($fullwidth ? '1 / 1 / -1 / -1' : 'main')};
  background: ${bgColor};
  height: calc(100vh - (2 * ${defaultMargin}));
  max-width: ${({ $fullwidth }) =>
    $fullwidth ? '' : `calc(90vw - ${sidebarWidth} )`};
  padding: ${defaultMargin} ${sidebarShowButtonSize};
  margin: 0;
`;

// emitting with no payload requests backend to send back a db-lists event with list of dbs
const requestDbListOnce = once(() => ipcRenderer.send('return-db-list'));

function App() {
  const [queries, setQueries] = useState<AppState['queries']>({});
  const [comparedQueries, setComparedQueries] = useState<AppState['queries']>(
    {},
  );
  const [workingQuery, setWorkingQuery] = useState<AppState['workingQuery']>();
  // const [selectedView, setSelectedView] =
  //   useState<AppState['selectedView']>('dbView');

  const initialViewState: ViewState = {
    selectedView: 'dbView',
    sideBarIsHidden: false,
    showConfigDialog: false,
    showCreateDialog: false,
    PG_isConnected: false,
    MYSQL_isConnected: false,
  };

  const [viewState, viewDispatch] = useReducer(
    viewStateReducer,
    initialViewState,
  );

  const ViewContext = createContext(viewState);

  const [selectedDb, setSelectedDb] = useState<AppState['selectedDb']>('');
  // const [sidebarIsHidden, setSidebarHidden] = useState(false);
  const [newFilePath, setFilePath] = useState<AppState['newFilePath']>('');
  const [ERView, setERView] = useState(true);

  const [DBInfo, setDBInfo] = useState<DatabaseInfo[]>();
  const [curDBType, setDBType] = useState<DBType>();

  const [dbTables, setTables] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableInfo | undefined>();

  // const [PG_isConnected, setPGStatus] = useState(false);
  // const [MYSQL_isConnected, setMYSQLStatus] = useState(false);
  // const [showCreateDialog, setCreateDialog] = useState(false);
  // const [showConfigDialog, setConfigDialog] = useState(false);

  useEffect(() => {
    // Listen to backend for updates to list of available databases
    const dbListFromBackend = (evt: IpcRendererEvent, dbLists: DbLists) => {
      if (isDbLists(dbLists)) {
        setDBInfo(dbLists.databaseList);
        setTables(dbLists.tableList);
        setPGStatus(dbLists.databaseConnected.PG);
        setMYSQLStatus(dbLists.databaseConnected.MySQL);

        setSelectedTable(selectedTable || dbTables[0]);
      }
    };
    ipcRenderer.on('db-lists', dbListFromBackend); // dummy data error here?
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
    case 'threeDView':
      shownView = 'threeDView';
      break;
    case 'quickStartView':
    default:
      shownView = 'quickStartView';
  }

  return (
    // Styled Components must be injected last in order to override Material UI style: https://material-ui.com/guides/interoperability/#controlling-priority-3
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={MuiTheme}>
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
              showCreateDialog,
              setCreateDialog,
              setConfigDialog,
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
              DBInfo={DBInfo}
              dbTables={dbTables}
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
            />
            <QuickStartView show={shownView === 'quickStartView'} />

            <ThreeDView
              show={shownView === 'threeDView'}
              selectedDb={selectedDb}
              dbTables={dbTables}
              dbType={curDBType}
            />

            <NewSchemaView
              query={workingQuery}
              setQuery={setWorkingQuery}
              selectedDb={selectedDb}
              setSelectedDb={setSelectedDb}
              show={shownView === 'newSchemaView'}
              curDBType={curDBType}
              dbTables={dbTables}
              selectedTable={selectedTable}
              setSelectedTable={setSelectedTable}
            />

            <ConfigView
              show={showConfigDialog}
              onClose={() => setConfigDialog(false)}
            />
            <CreateDBDialog
              show={showCreateDialog}
              DBInfo={DBInfo}
              onClose={() => setCreateDialog(false)}
            />
          </Main>
          <FeedbackModal />
        </AppContainer>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

export default App;
