type ERDActions =
  | { type: 'ADD_TABLE' }
  | { type: 'SAVE_CHANGES' }
  | { type: 'EDIT_TABLE' }
  | { type: 'SELECT_TABLE' }
  | { type: 'GENERATE_DATA' };

export default ERDActions;
