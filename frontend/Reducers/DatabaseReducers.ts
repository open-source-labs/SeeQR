import { ipcRenderer } from 'electron';
import databaseActions from '../Actions/databaseActions';

type TableChange<C extends 'CREATE' | 'ALTER' | 'DELETE'> = {
  dbName: string;
  dbType: DBType;
  tableName: string;
  changeType: C;
  changeDetails: C extends 'ALTER' ? any : never;
};

type databaseState<C extends 'CREATE' | 'ALTER' | 'DELETE'> = {
  dbList: DBList;
  selectedDb: { name: string; type: DBType };
  selectedTable: TableInfo | null;
  currentChanges: TableChange<C>[];
};

function databaseReducer<C extends 'CREATE' | 'ALTER' | 'DELETE'>(
  state: databaseState<C>,
  action: databaseActions,
) {
  switch (action.type) {
    case 'ADD_TABLE': {
      // add table with name to selected db

      return state;
    }

    /*  Keep this local to ERTables stuff
    case 'EDIT_TABLE': {
      // modify currentChanges; don't send to back end yet
      return state;
    }
 */

    case 'GENERATE_DATA': {
      // invoke event to populate selected table on selected db with dummy data
      // TODO: initiate Loading, move this stuff to a useEffect

      ipcRenderer
        .invoke(
          'generate-dummy-data',
          {
            dbName: state.selectedDb.name,
            tableName: state.selectedTable,
            rows: action.rows,
          },
          state.selectedDb.type,
        )
        .then(({ newDbList, feedback }) =>
          // TODO: do something with the feedback
          ({ ...state, dbList: newDbList }),
        )
        .catch(
          (err) =>
            // TODO: feedback modal integration
            state,
        );
      return state;
    }
    case 'SAVE_CHANGES': {
      // send currentChanges to backend
      // TODO: initiate loading DOES NOT WORK RIGHT NOW

      // TODO: move backendObj creation here
      const backendObj = null;

      ipcRenderer
        .invoke(
          'ertable-schemaupdate',
          backendObj,
          state.selectedDb.name,
          state.selectedDb.type,
        )
        .then(({ newDbList, feedback }) =>
          // TODO: feedback modal integration

          ({ ...state, dbList: newDbList }),
        )
        .catch((err) => state);

      return state;
    }
    case 'SELECT_TABLE': {
      // change active table on current active db

      return { ...state, selectedTable: action.table };
    }
    case 'CREATE_DATABASE': {
      // send database name and type to backend to add
      // TODO: MORE ASYNC TO DO ONCE I GET IT ALL IN ORDER
      return state;
    }
    /* case 'FILTER_DATABASE': {
      // keep to local state in DBList.tsx for now
      return state;
    } */
    case 'SELECT_DATABASE': {
      // change active database
      return {
        ...state,
        selectedDb: { name: action.dbName, type: action.dbType },
      };
    }
    case 'IMPORT_DATABASE': {
      // invoke event to backend to get a db from a file
      // TODO: MORE ASYNC TO DO
      return state;
    }
    case 'DELETE_DATABASE': {
      // invoke event to backend to drop database
      // TODO: MORE ASYNC TO DO
      return state;
    }
    case 'DUPLICATE_DATABASE': {
      // invoke event to backend to create new duplicate db
      // TODO: MORE ASYNC TO DO
      return state;
    }

    default:
      return state;
  }
}

export default databaseReducer;
