export interface ColumnOperations {
  columnName: string;
  columnType: string;
  columnSize: number;
  columnConstraint: string;
  columnIsPrimaryKey?: boolean;
  columnIsForeignKey?: boolean;
  columntFKTableReference?: string;
  columnFKFieldReference?: string;
  columnIsUnique?: boolean;
}

export interface Payload {
  tableName: string;
  newTableName?: string;
  columnOperations?: ColumnOperations;
}

// edited by derek 8/14. Added in a payload. Not sure if this is needed.
export type ERDActions =
  | {
      type: 'ADD_TABLE';
      payload: Payload;
    }
  | { type: 'SAVE_CHANGES'; payload?: number | string | null }
  | { type: 'EDIT_TABLE'; payload?: number | string | null }
  | { type: 'SELECT_TABLE'; payload?: number | string | null }
  | { type: 'GENERATE_DATA'; payload?: number | string | null };

// What Tony expects - added by Derek 8/14
// export interface ERDState {
//   action: 'add' | 'drop' | 'alter' | 'column' | '';
//   tableName: string;
//   tableSchema?: string;
//   newTableName?: string;
//   columnOperations?: ColumnOperations;
// }

// export interface ColumnOperations {
//   columnName: string;
//   columnType: string;
//   columnConstraint: string;
// }
