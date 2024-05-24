// Import necessary libraries and components
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { StyledEngineProvider, ThemeProvider, Theme } from '@mui/material/';
import { EventEmitter } from 'events';
import CssBaseline from '@mui/material/CssBaseline';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import GlobalStyle from '../GlobalStyle';
// import { createQuery } from '../lib/queries';
import '../lib/style.css';
import {
  AppState,
  DBType,
  // CreateNewQuery,
  DatabaseInfo,
  DbListsInterface,
  isDbListsInterface,
  // QueryData,
  TableInfo,
} from '../../shared/types/types';

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

import { RootState, AppDispatch } from '../state_management/store';
import { AppViewContextState, AppViewContextDispatch } from '../state_management/Contexts/AppViewContext';
import { QueryContextState, QueryContextDispatch } from '../state_management/Contexts/QueryContext';
import MenuContext from '../state_management/Contexts/MenuContext';
import { submitAsyncToBackend } from '../state_management/Reducers/MenuReducers';
import invoke from '../lib/electronHelper';


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

const Main = styled.main<{ $fullwidth: boolean }>`
  grid-area: ${({ $fullwidth }) => ($fullwidth ? '1 / 1 / -1 / -1' : 'main')};
  background: ${bgColor};
  height: calc(100vh - (2 * ${defaultMargin}));
  max-width: ${({ $fullwidth }) => $fullwidth ? '' : `calc(90vw - ${sidebarWidth})`};
  padding: ${defaultMargin} ${sidebarShowButtonSize};
  margin: 0;
`;

// Define the main App component
function App() {

  const dispatch = useDispatch(); 
  // Connect Redux store
  const appViewState = useSelector((state: RootState) => state.appView);
  const appViewDispatch = useDispatch<AppDispatch>();
  const queryState = useSelector((state: RootState) => state.query);
  const queryDispatch = useDispatch<AppDispatch>();
  const menuState = useSelector((state: RootState) => state.menu);
  const menuDispatch = useDispatch<AppDispatch>();


  // Define local component state
  const [selectedDb, setSelectedDb] = useState<AppState['selectedDb']>('');
  const [ERView, setERView] = useState(true);
  const [DBInfo, setDBInfo] = useState<DatabaseInfo[]>();
  const [curDBType, setDBType] = useState<DBType>();
  const [dbTables, setTables] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableInfo | undefined>();

  // Listen to backend for updates to list of available databases
  useEffect(() => {
    // Listen to backend for updates to list of available databases
    const dbListFromBackend = (
      evt: IpcRendererEvent,
      dbLists: DbListsInterface,
    ) => {
      if (isDbListsInterface(dbLists)) {
        setDBInfo(dbLists.databaseList);
        setTables(dbLists.tableList);
        setSelectedTable(selectedTable || dbTables[0]);
      }
    };
    ipcRenderer.on('db-lists', dbListFromBackend);
    return () => {
      ipcRenderer.removeListener('db-lists', dbListFromBackend);
    };
  });

  // Handle async calls
  const asyncCount = useRef(0);
  useEffect(() => {
    const { issued, resolved, asyncList } = menuState.loading;
    if (issued - resolved > asyncCount.current) {
      submitAsyncToBackend(issued, asyncList, invoke, menuDispatch);
    }
    asyncCount.current = issued - resolved;
  }, [menuState.loading, menuDispatch]);

  // Populate initial dblist
  useEffect(() => {
    const dbListFromBackend = (dbLists: DbListsInterface) => {
      setDBInfo(dbLists.databaseList);
      setTables(dbLists.tableList);
      appViewDispatch({
        type: 'IS_PG_CONNECTED',
        payload: dbLists.databaseConnected.PG,
      });
      appViewDispatch({
        type: 'IS_MYSQL_CONNECTED',
        payload: dbLists.databaseConnected.MySQL,
      });
    };
    menuDispatch({
      type: 'ASYNC_TRIGGER',
      loading: 'LOADING',
      options: {
        event: 'return-db-list',
        callback: dbListFromBackend,
      },
    });
  }, []);

  // Determine which view should be visible
  let shownView;
  switch (appViewState.selectedView) {
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
      if (!queryState.queries?.selected && !selectedDb) {
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

  // Styled Components must be injected last in order to override Material UI style: https://material-ui.com/guides/interoperability/#controlling-priority-3
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={MuiTheme}>
        <MenuContext.Provider value={{ state: menuState, dispatch }}>
          <Spinner />
          <AppContainer>
            <CssBaseline />
            <GlobalStyle />
            <QueryContextState.Provider value={queryState}>
              <QueryContextDispatch.Provider value={queryDispatch}>
                <AppViewContextState.Provider value={appViewState}>
                  <AppViewContextDispatch.Provider value={appViewDispatch}>
                    <Sidebar
                      {...{
                        selectedDb,
                        setSelectedDb,
                        setERView,
                        curDBType,
                        setDBType,
                        DBInfo,
                        queryDispatch,
                      }}
                    />
                  </AppViewContextDispatch.Provider>
                </AppViewContextState.Provider>

                <Main $fullwidth={appViewState.sideBarIsHidden}>
                  <CompareView
                    queries={queryState.comparedQueries}
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
                    selectedDb={selectedDb}
                    setSelectedDb={setSelectedDb}
                    show={shownView === 'queryView'}
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
                    selectedDb={selectedDb}
                    setSelectedDb={setSelectedDb}
                    show={shownView === 'newSchemaView'}
                    curDBType={curDBType}
                    dbTables={dbTables}
                    selectedTable={selectedTable}
                    setSelectedTable={setSelectedTable}
                  />

                  <ConfigView
                    show={appViewState.showConfigDialog}
                    onClose={() =>
                      appViewDispatch({ type: 'TOGGLE_CONFIG_DIALOG' })
                    }
                  />
                  <CreateDBDialog
                    show={appViewState.showCreateDialog}
                    DBInfo={DBInfo}
                    onClose={() =>
                      appViewDispatch({ type: 'TOGGLE_CREATE_DIALOG' })
                    }
                  />
                </Main>
                <FeedbackModal />
              </QueryContextDispatch.Provider>
            </QueryContextState.Provider>
          </AppContainer>
        </MenuContext.Provider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

export default App;



