import { ViewName } from '../../types';

// these are currently the only possible actions that the app view can take
export type AppViewStateAction =
  | { type: 'SELECTED_VIEW'; payload: ViewName }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'TOGGLE_CONFIG_DIALOG' }
  | { type: 'TOGGLE_CREATE_DIALOG' }
  | { type: 'IS_PG_CONNECTED'; payload: boolean }
  | { type: 'IS_MYSQL_CONNECTED'; payload: boolean };
