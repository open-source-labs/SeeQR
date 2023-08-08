type MenuActions =
  | { type: 'TOGGLE_DIALOG'; dialog: Dialogs }
  | { type: 'CHANGE_VIEW'; newView: Views }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SELECT_DATABASE'; dbName: string }
  | { type: 'SELECT_QUERY' }
  | { type: 'CREATE_DATABASE'; dbName: string }
  | { type: 'FILTER_DATABASE'; filter: Filter };

export default MenuActions;
