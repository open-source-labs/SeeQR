// Define the state type
import { AppViewStateAction } from '../Actions/AppViewActions';
// notice in the view state for sidebarishidden, showconfig dialog, and show create dialog, those are just toggles, so there is no payload. When invoked with the specific action type, it just toggles true or false for the variable.
export interface AppViewState {
  selectedView: string;
  sideBarIsHidden: boolean;
  showConfigDialog: boolean;
  showCreateDialog: boolean;
  PG_isConnected: boolean;
  MYSQL_isConnected: boolean;
}

// eslint-disable-next-line import/prefer-default-export
// This reducer is for all the pieces of viewstate. When you select a view, toggle the sidebar, etc/
export const appViewStateReducer = (
  state: AppViewState,
  action: AppViewStateAction,
): AppViewState => {
  switch (action.type) {
    case 'SELECTED_VIEW':
      return { ...state, selectedView: action.payload };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sideBarIsHidden: !state.sideBarIsHidden };
    case 'TOGGLE_CONFIG_DIALOG':
      return { ...state, showConfigDialog: !state.showConfigDialog };
    case 'TOGGLE_CREATE_DIALOG':
      return { ...state, showCreateDialog: !state.showCreateDialog };
    case 'IS_PG_CONNECTED':
      return { ...state, PG_isConnected: action.payload };
    case 'IS_MYSQL_CONNECTED':
      return { ...state, MYSQL_isConnected: action.payload };
    default:
      return state;
  }
};
