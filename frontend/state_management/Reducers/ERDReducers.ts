import { initialStateType } from '@mytypes/erTypes';
import { DBType } from '../../../backend/BE_types';

import ERDPsqlReducers from './ERDReducerHelpers/ERDPsqlReducers';
import { posgresAction } from '../Actions/ERDPsqlActions';


export const initialErdState: initialStateType = {
  db_type: DBType.Postgres,
  guiTableArray: [],
  updatesArray: [],
};

export type Action = {
  type: posgresAction | any;
  payload: any;
};

export function mainErdReducer(state: initialStateType | undefined, action: Action): initialStateType {
  // Initialize state if it's undefined
  state = state || initialErdState;

  switch (action.type) {
    case 'SAVE':
      return {
       ...state,
        updatesArray: [],
      };
  }

  // Correctly structured switch block for db_type
  switch (state.db_type) {
    case DBType.Postgres:
      return ERDPsqlReducers(state, action);
    // Add other cases as needed
    default:
      return state;
  }
}

// export const initialErdState: initialStateType = {
//   db_type: DBType.Postgres, // need to update this when exported to main file
//   guiTableArray: [], // need a type for GUItable array
//   updatesArray: [],
// };

// export type Action = {
//   type: posgresAction | any; // need other actions
//   payload: any; // We always have a payload
// };

// export function mainErdReducer(state: initialStateType | undefined , action: Action): initialStateType {

//   state = state || initialErdState;

//   switch (action.type) {
//     case 'SAVE':
//       return {
//        ...state,
//         updatesArray: [],
//       };
//   }

//   switch (state.db_type) {
//     case DBType.Postgres:
//       return ERDPsqlReducers(state, action);
//     // Add other cases as needed
//     default:
//       return state;
//   }

//   // switch (action.type) {
//   //   case 'SAVE':
//   //     // function sends updates array to backend through ipcmain
//   //     return {
//   //       ...state,
//   //       updatesArray: [],
//   //     };
//   }

//   /**
//    * State Switch from this:
//    *
//    * Depending on the state of the current active database type, our ERD Reducer can switch to the corresponding database type, which sends the actions off to a unique reducer branch.
//    *
//    * This allows us to differentiate nuanced conditions such as for example when a MySql table is created it requires a column while for Postgres this is not a requirement
//    *  */

//   switch (state.db_type) {
//     case DBType.Postgres:
//       return ERDPsqlReducers(state, action);
//     // case DBType.MySQL:
//     //   return ERDMySqlReducers(state, action);
//     // case DBType.SQLite:
//     //   return ERDSqLiteReducers(state, action);
//     default:
//       return state;
//   }
// }
