/*
I am expecting an array of objects:

erdObj = [{},{},{},{},{}]

{
  action: string; 'add' | 'drop' | 'alter' | ' column
  tableName: string;
  tableSchema: string;  ???? 
  newTableName?: string; // only with 'alter'
  columnOperations?: {PsqlColumnOperations};  only with 'column'
}

PsqlColumnOperations object will have nique operations for changes in COLUMNS
columnActions currently are: addColumn, dropColumn, alterColumnType( i need to add the text limit for Char later ), renameColumn, togglePrimary, toggleForeign(one for true, one for false), and toggle unique

*/

// MASTER TYPE FOR ERD OBJECT
export type ErdUpdatesType = OperationType[];

// SQL UNION
export type OperationType =
  | PsqlOperationType
  | MySqlOperationType
  | SqLiteOperationType;

// @generic
interface BaseOperation<Action extends string, colOperation = any> {
  action: Action;
  tableName: string;
  tableSchema: string;
  newTableName?: string;
  columnOperations?: colOperation;
}

// PSQL
type PsqlOperationType =
  | BaseOperation<'add'>
  | BaseOperation<'drop'>
  | BaseOperation<'alter'>
  | BaseOperation<'column', PsqlColumnOperations>;

export type PsqlColumnOperations = (
  | { columnAction: 'addColumn'; type?: pSqlTypes }
  | { columnAction: 'dropColumn' }
  | { columnAction: 'alterColumnType'; type: pSqlTypes }
  | { columnAction: 'renameColumn'; newColumnName: string }
  | { columnAction: 'togglePrimary'; isPrimary: boolean }
  | {
      columnAction: 'toggleForeign';
      hasForeign: true;
      foreignTable: string;
      foreignColumn: string;
      foreignConstraint: string;
    }
  | {
      columnAction: 'toggleForeign';
      hasForeign: false;
      foreignConstraint: string;
    }
  | { columnAction: 'toggleUnique'; isUnique: boolean }
) & { columnName: string };

type pSqlTypes = 'CHAR' | 'VARCHAR' | 'TEXT' | 'INT';

// MYSQL
type MySqlOperationType =
  | BaseOperation<'add'>
  | BaseOperation<'drop'>
  | BaseOperation<'alter'>
  | BaseOperation<'column', MySqlColumnOperations>;

interface MySqlColumnOperations {
  // specific things for alter like primary key etc
  columnAction:
    | 'addColumn'
    | 'dropColumn'
    | 'alterColumnType'
    | 'renameColumn'
    | 'togglePrimary' // paired with default
    | 'toggleForeign'
    | 'toggleUnique';

  columnName: string;
  newColumnName?: string; // this is for addColumn only
  type?: 'string'; // could be for addColumn or alterColumm
  hasPrimary?: boolean;

  // foreign stuff
  hasForeign?: boolean;
  foreignConstraint?: string;
  foreignTable?: string;
  foreignColumn?: string;

  // unique:
  hasUnique?: boolean;
  uniqueConstraint?: string;
}

// SQLITE
type SqLiteOperationType =
  | BaseOperation<'add'>
  | BaseOperation<'drop'>
  | BaseOperation<'alter'>
  | BaseOperation<'column', SqLiteColumnOperations>;

interface SqLiteColumnOperations {
  table_name: string;
  // more
}

/*
Example:
array = [
  {
    action: 'alter';
    tableName: 'table1';
    tableSchema: 'public';
    alterOperations: {
      tableAction: 'addColumn'
    };
}
  }
]

*/

// // old
// export type UpdatesObjType = {
//   addTables: AddTablesObjType[];
//   dropTables: DropTablesObjType[];
//   alterTables: AlterTablesObjType[];
// };

// // ADD
// export type AddTablesObjType = {
//   is_insertable_into: 'yes' | 'no';
//   table_catalog: string;
//   table_name: string;
//   table_schema: string; // what is this ?
//   columns: ERTableColumnData[];
//   ericTestUnitTables?: any;
//   col_N?: any;
//   col_T?: any;
//   col_L?: any;
// };

// export interface ERTableColumnData extends TableColumn {
//   new_column_name: string | null;
//   constraint_name: string | null;
//   constraint_type: string | null;
//   foreign_column: string;
//   foreign_table: string;
//   unique?: boolean; // optional until implemented
//   auto_increment?: boolean; // optional until implemented
// }

// // DROP
// export type DropTablesObjType = {
//   table_name: string;
//   table_schema: string;
// };

// // ALTER
// export type AlterTablesObjType = {
//   is_insertable_into: 'yes' | 'no' | null;
//   table_catalog: string | null;
//   table_name: string;
//   new_table_name: string | null;
//   table_schema: string | null;
//   addColumns: AddColumnsObjType[];
//   dropColumns: DropColumnsObjType[];
//   alterColumns: AlterColumnsObjType[];
// };

// export type AddColumnsObjType = {
//   column_name: string | null;
//   data_type: DataTypes;
//   character_maximum_length: number | null;
// };
// export type DropColumnsObjType = {
//   column_name: string;
// };
// export type AlterColumnsObjType = {
//   column_name: string;
//   character_maximum_length: number | null;
//   new_column_name: string | null;
//   add_constraint: AddConstraintObjType[];
//   current_data_type: string | null;
//   data_type: string | null;
//   is_nullable: 'YES' | 'NO' | null;
//   drop_constraint: string[];
//   rename_constraint: string | null;
//   table_schema: string | null;
//   table_name: string | null;
//   constraint_type: 'PRIMARY KEY' | 'FOREIGN KEY' | 'UNIQUE' | null;
// };

// export type AddConstraintObjType = {
//   constraint_type: 'PRIMARY KEY' | 'FOREIGN KEY' | 'UNIQUE' | null;
//   constraint_name: string;
//   foreign_table: string | null;
//   foreign_column: string | null;
// };

/*
const backendObj = {
    database: 'tester2',
    updates: {
     addTables: [
      {
       is_insertable_into: 'yes',
       table_name: 'NewTable8',
       table_schema: 'puclic',
       table_catalog: 'tester2',
       columns: []
      }
     ],
     
     dropTables: [{
      table_name: 'newtable5',
      table_schema: 'puclic'
      }
     ],

     alterTables: [
      {
        is_insertable_into: null,
        table_catalog: 'tester2',
        table_name: 'newtable7',
        new_table_name: null,
        table_schema: 'puclic',
        addColumns: [Array],
        dropColumns: [],
        alterColumns: []
      },
      {
        is_insertable_into: null,
        table_catalog: 'tester2',
        table_name: 'newtable7',
        new_table_name: null,
        table_schema: 'puclic',
        addColumns: [Array],
        dropColumns: [],
        alterColumns: []
      }]
    }
}
*/
