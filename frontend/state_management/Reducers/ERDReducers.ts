import { ERDActions, ColumnOperations } from '../Actions/ERDActions';

export interface ERDState {
  tableName: string;
  columns: ColumnOperations[];
}

// eslint-disable-next-line import/prefer-default-export
export function erdReducer(state: ERDState[], action: ERDActions) {
  switch (action.type) {
    case 'ADD_TABLE': {
    }
    case 'EDIT_TABLE': {
      return state;
    }
    case 'GENERATE_DATA': {
      return state;
    }
    case 'SAVE_CHANGES': {
      return state;
    }
    case 'SELECT_TABLE': {
      return state;
    }
    default:
      break;
  }
}
