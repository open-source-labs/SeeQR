type MenuActions =
  | { type: 'TOGGLE_DIALOG'; dialog: Dialogs }
  | { type: 'CHANGE_VIEW'; newView: ViewName }
  | {
      type: 'ASYNC_TRIGGER';
      loading: 'LOADING';
      payload: {
        dispatch: any;
        action: string;
        event: string;
        payload: any;
      };
    }
  | {
      type: 'ASYNC_TRIGGER';
      loading: 'IDLE';
      payload: { key: Record<string, any> };
    }
  | { type: 'CHANGE_SAVE_LOCATION' }
  | {
      type: 'TOGGLE_SIDEBAR';
      sidebarState: 'CLOSED' | 'QUERIES' | 'DATABASES';
    };

export default MenuActions;
