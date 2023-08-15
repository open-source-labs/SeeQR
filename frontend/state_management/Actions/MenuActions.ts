import { Dialogs, ViewName } from '../../../shared/types/frontendTypes';

export type async = {
  callback?: any;
  args?: any[];
  event: string;
  payload?: any;
};

type MenuActions =
  | { type: 'TOGGLE_DIALOG'; dialog: Dialogs }
  | { type: 'CHANGE_VIEW'; newView: ViewName }
  | {
      type: 'ASYNC_TRIGGER';
      loading: 'LOADING';
      payload: async;
    }
  | {
      type: 'ASYNC_TRIGGER';
      loading: 'IDLE';
      payload: { key: number };
    }
  | { type: 'CHANGE_SAVE_LOCATION' }
  | {
      type: 'TOGGLE_SIDEBAR';
      sidebarState: 'CLOSED' | 'QUERIES' | 'DATABASES';
    };

export default MenuActions;
