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

// menuDispatch({type: 'ASYNC_TRIGGER', payload: {
//   dispatch: databaseDispatch,
//   action: 'UPDATE_DBLIST',
//   event: 'create-db',
//   payload: {name: 'newdbname', type: DBType}
// }})

// useEffect(()=>{
//   const result = await ipcRenderer.invoke(event, payload)
//   dispatch({type: action, payload: result})
// }, [menuState.loading.queue])
