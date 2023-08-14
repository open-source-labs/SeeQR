import { MenuActions, Views, Dialogs } from '../Actions/MenuActions';
import { TableInfo } from '../../types';

type MenuState = {
  selectedView: Views;
  selectedDb: string;
  selectedTable: TableInfo | null;
  sidebarState: 'CLOSED' | 'QUERIES' | 'DATABASES';
  visibleDialog: Dialogs | null;
};

function menuReducer(state: MenuState, action: MenuActions) {
  switch (action.type) {
    case 'CHANGE_VIEW': {
      const updatedState = { ...state, selectedView: action.newView };
      return updatedState;
    }
    case 'CREATE_DATABASE': {
      return state;
    }
    case 'FILTER_DATABASE': {
      return state;
    }
    case 'SELECT_DATABASE': {
      return state;
    }
    case 'SELECT_QUERY': {
      return state;
    }
    case 'TOGGLE_DIALOG': {
      return state;
    }
    case 'TOGGLE_SIDEBAR': {
      return state;
    }

    default:
      return state;
  }
}

export default menuReducer;
