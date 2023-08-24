import { DBType } from '@mytypes/dbTypes';
import { initialStateType } from '@mytypes/erTypes';
import ERDPsqlReducers from './ERDReducerHelpers/ERDPsqlReducers';
import { posgresAction } from '../Actions/ERDPsqlActions';

export const initialErdState: initialStateType = {
  db_type: DBType.Postgres, // need to update this when exported to main file
  guiTableArray: [], // need a type for GUItable array
  updatesArray: [],
};

type Action = {
  type: posgresAction | any; // need other actions
  payload: any; // We always have a payload
};

export function mainErdReducer(state: initialStateType, action: Action) {
  switch (action.type) {
    case 'SAVE':
      // function sends updates array to backend through ipcmain
      return {
        ...state,
        updatesArray: [],
      };
  }

  /**
   * State Switch from this:
   *
   * Depending on the state of the current active database type, our ERD Reducer can switch to the corresponding database type, which sends the actions off to a unique reducer branch.
   *
   * This allows us to differentiate nuanced conditions such as for example when a MySql table is created it requires a column while for Postgres this is not a requirement
   *  */

  switch (state.db_type) {
    case DBType.Postgres:
      return ERDPsqlReducers(state, action);
    // case DBType.MySQL:
    //   return ERDMySqlReducers(state, action);
    // case DBType.SQLite:
    //   return ERDSqLiteReducers(state, action);
    default:
      return state;
  }
}
