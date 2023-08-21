import { QueryActions } from '../Actions/QueryActions';
import { QueryData, AppState } from '../../types';

// type Field = {
//   title: string;
//   contents: string;
// };

// type Query = {
//   group: string;
//   label: string;
//   database: string;
//   active: boolean;
//   compare: boolean;
//   details: QueryData;
// };

// type QueryState = {
//   fields: Field[];
//   savedQueries: Query[];
// };

export interface QueryState {
  queries: AppState['queries'];
  comparedQueries: AppState['queries'];
  workingQuery: AppState['workingQuery'];
  newFilePath: AppState['newFilePath'];
}
// state: QueryState, action: QueryActions
export const queryReducer = (
  state: QueryState,
  action: QueryActions,
): QueryState => {
  switch (action.type) {
    case 'UPDATE_QUERIES': {
      return state;
    }
    case 'UPDATE_COMPARED_QUERIES': {
      return state;
    }
    case 'UPDATE_WORKING_QUERIES': {
      return state;
    }
    case 'UPDATE_FILEPATH': {
      return state;
    }

    default: {
      return state;
    }
  }
};
