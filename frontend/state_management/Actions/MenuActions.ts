export type Views =
  | 'compareView'
  | 'dbView'
  | 'queryView'
  | 'quickStartView'
  | 'newSchemaView'
  | 'threeDView';

// Edited by Derek. Added fillers to remove error codes for these types.
export type Dialogs = string | null; // REVIEW: filler
export type Filter = string | null; // REVIEW: filler

export type MenuActions =
  | { type: 'TOGGLE_DIALOG'; dialog: Dialogs }
  | { type: 'CHANGE_VIEW'; newView: Views }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SELECT_DATABASE'; dbName: string }
  | { type: 'SELECT_QUERY' }
  | { type: 'CREATE_DATABASE'; dbName: string }
  | { type: 'FILTER_DATABASE'; filter: Filter };
