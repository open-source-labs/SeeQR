type databaseActions =
  | { type: 'ADD_TABLE' }
  | { type: 'SAVE_CHANGES' }
  | { type: 'EDIT_TABLE' }
  // | { type: 'SELECT_TABLE'; table: TableInfo }
  | { type: 'GENERATE_DATA'; rows: any }
  // | { type: 'SELECT_DATABASE'; dbName: string; dbType: DBType }
  | { type: 'CREATE_DATABASE'; dbName: string }
  | { type: 'IMPORT_DATABASE' }
  | { type: 'DUPLICATE_DATABASE' }
  | { type: 'DELETE_DATABASE' };
// | { type: 'FILTER_DATABASE'; filter: Filter };

export default databaseActions;
