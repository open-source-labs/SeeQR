type QueryActions =
  | { type: 'TEXT_INPUT'; field: string; payload: string }
  | { type: 'RUN_QUERY' }
  | { type: 'FORMAT_QUERY'; payload: string }
  | { type: 'TOGGLE_COMPARISON' }
  | { type: 'DELETE_QUERY' }
  | { type: 'SAVE_QUERY' }
  | { type: 'IMPORT_QUERY' }
  | { type: 'SELECT_QUERY' };

export default QueryActions;
