import { DBType } from './dbTypes';
/**
 * FRONTEND TABLE TYPES
 */

export type initialStateType = {
  db_type: DBType;
  guiTableArray: any[]; // for now any
  updatesArray: ErdUpdatesType;
};

export interface ErdDBInfo {
  db_name: string;
  db_type: DBType; // table catalog
  db_size_kb: number; // used to be string
}

export type ErdTables = TableType[];

export type TableType = PsqlTable | MysqlTable | SqLiteTable;

type BaseTable = {
  table_name: string;
  allows_insert?: boolean;
  columns: ColumnType[];
  // table_catalog: string; // name of the databse MOVE TO BE
};

interface PsqlTable extends BaseTable {
  table_schema: string;
}

interface MysqlTable extends BaseTable {
  information_schema: string;
}

interface SqLiteTable extends BaseTable {
  sqlite_schema: string;
}

type ColumnType = PsqlColumn | MySqlColumn | SqLiteColumn;

type BaseColumn = {
  name: string;
  data_type: PSqlDataType | MySqlDataType;
  character_maximum_length?: number;
  is_primary: boolean;
  has_foreign: boolean;
  is_nullable: boolean; // forgot to add this to backend
  is_unique: boolean;
  // need a constraint here
};

export type PSqlDataType =
  | 'SMALLINT'
  | 'INTEGER'
  | 'BIGINT'
  | 'CHAR'
  | 'VARCHAR'
  | 'TEXT'
  | 'REAL'
  | 'DOUBLE PRECISION'
  | 'DATE'
  | 'TIMESTAMP'
  | 'BOOLEAN'
  | 'BYTEA'
  | 'UUID'
  | 'JSON'
  | 'JSONB';

type MySqlDataType =
  | 'TINYINT'
  | 'SMALLINT'
  | 'MEDIUMINT'
  | 'INT'
  | 'BIGINT'
  | 'FLOAT'
  | 'DOUBLE'
  | 'DECIMAL'
  | 'CHAR'
  | 'VARCHAR'
  | 'TINYTEXT'
  | 'TEXT'
  | 'MEDIUMTEXT'
  | 'LONGTEXT'
  | 'DATE'
  | 'TIME'
  | 'DATETIME'
  | 'TIMESTAMP'
  | 'YEAR'
  | 'BINARY'
  | 'VARBINARY'
  | 'TINYBLOB'
  | 'BLOB'
  | 'MEDIUMBLOB'
  | 'LONGBLOB'
  | 'ENUM'
  | 'SET'
  | 'JSON';

interface PsqlColumn extends BaseColumn {
  is_identity: boolean;
}

interface MySqlColumn extends BaseColumn {
  column_key: string;
  extra: string[];
}

interface SqLiteColumn extends BaseColumn {}

/**
 * ERD TO BACKEND TYPES
 */
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

export enum TableOperationAction {
  add = 'add',
  drop = 'drop',
  alter = 'alter',
  column = 'column',
}

// PSQL
export type PsqlOperationType =
  | BaseOperation<'add'>
  | BaseOperation<'drop'>
  | BaseOperation<'alter'>
  | BaseOperation<'column', PsqlColumnOperations>;

export enum ColumnOperationAction {
  add_column = 'addColumn',
  drop_column = 'dropColumn',
  alter_type = 'alterColumnType',
  rename_column = 'renameColumn',
  toggle_primary = 'togglePrimary',
  toggle_foreign = 'toggleForeign',
  toggle_unique = 'toggleUnique',
}

export type PsqlColumnOperations = (
  | { columnAction: 'addColumn'; type?: PSqlDataType } // add column probably doesn't need type since we are adding each operation sequentially
  | { columnAction: 'dropColumn' }
  | { columnAction: 'alterColumnType'; type: PSqlDataType }
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
  // missing action for nullable
  | { columnAction: 'toggleUnique'; isUnique: boolean }
) & { columnName: string };

// MYSQL
export type MySqlOperationType =
  | BaseOperation<'add'>
  | BaseOperation<'drop'>
  | BaseOperation<'alter'>
  | BaseOperation<'column', MySqlColumnOperations>;

interface MySqlColumnOperations {
  // tbd
}

// SQLITE
export type SqLiteOperationType =
  | BaseOperation<'add'>
  | BaseOperation<'drop'>
  | BaseOperation<'alter'>
  | BaseOperation<'column', SqLiteColumnOperations>;

interface SqLiteColumnOperations {
  // tbd
}
