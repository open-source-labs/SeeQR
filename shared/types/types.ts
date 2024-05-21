/**
 * This section contains common types that need to be used across the backend
 */
import { PoolOptions } from 'mysql2';
import { PoolConfig } from 'pg';

// Electron Interface //

// Due to legacy reasons some data arriving from the backend is being treated as
// unknown types until full typing can be implemented on the backend

/**
 * Fake type guard that asserts a type to simplify tests inside real type guards
 */
// type assertions don't work with arrow functions https://github.com/microsoft/TypeScript/issues/34523
function assumeType<T>(x: unknown): asserts x is T {}

export enum DBType {
  Postgres = 'pg',
  MySQL = 'mysql',
  RDSPostgres = 'rds-pg',
  RDSMySQL = 'rds-mysql',
  CloudDB = 'cloud-database', // added for cloud dbs
  SQLite = 'sqlite',
  directPGURI = 'directPGURI',
}

export enum LogType {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  NORMAL = 'NORMAL',
  SEND = 'SEND',
  RECEIVE = 'RECEIVE',
}
export interface ColumnObj {
  column_name: string;
  data_type: string;
  character_maximum_length: number | null;
  is_nullable: string;
  constraint_type: string | null;
  foreign_table: string | null;
  foreign_column: string | null;
}

export interface dbDetails {
  db_name: string;
  db_size: string;
  db_type: DBType;
}
export interface TableDetails {
  table_catalog: string;
  table_schema: string;
  table_name: string;
  is_insertable_into: string;
  columns?: ColumnObj[];
}
export interface DBListInterface {
  databaseConnected: {
    PG: boolean;
    MySQL: boolean;
    RDSPG: boolean;
    RDSMySQL: boolean;
    SQLite: boolean;
    directPGURI: boolean;
  };
  databaseList: dbDetails[];
  tableList: TableDetails[];
}

// need to figure out how to integrate dblistinterface and dblistinterfaces
export interface DbListsInterface {
  databaseConnected: {
    PG: boolean;
    MySQL: boolean;
    RDSPG: boolean;
    RDSMySQL: boolean;
    SQLite: boolean;
    directPGURI: boolean;
  };
  databaseList: DatabaseInfo[];
  tableList: TableInfo[];
  dbType: DBType;
}

/**
 * Type guard that checks if obj is compatible with type DbListsInterface
 */
export const isDbListsInterface = (obj: unknown): obj is DbListsInterface => {
  try {
    assumeType<DbListsInterface>(obj);
    if (!obj.databaseList || !obj.tableList) return false;
    if (!Array.isArray(obj.databaseList) || !Array.isArray(obj.tableList))
      return false;
    if (obj.databaseList[0] && typeof obj.databaseList[0].db_name !== 'string')
      return false;
    // if (obj.databaseList[0] && typeof obj.databaseList[0].db_size !== 'string' )
    //   return false;
    if (obj.tableList[0] && typeof obj.tableList[0].table_name !== 'string')
      return false;
    if (obj.tableList[0] && typeof obj.tableList[0].table_catalog !== 'string')
      return false;
    if (obj.tableList[0] && typeof obj.tableList[0].table_schema !== 'string')
      return false;
  } catch (e) {
    return false;
  }
  return true;
};

export type DummyRecords = [string[], ...Array<(string | number)[]>];

export type BackendObjType = {
  database: string;
  updates: UpdatesObjType;
};

// choose one above or below : Check how this object is being made
// export type BackendObjType = {
//   current: {
//     database: string;
//     updates: UpdatesObjType;
//   };
// };

// export interface DocConfigFile {
//   mysql: { user: string; password: string; port: number };
//   pg: { user: string; password: string; port: number };
//   rds_mysql: { user: string; password: string; port: number; host: string };
//   rds_pg: { user: string; password: string; port: number; host: string };
//   sqlite: { path: '' };
//   directPGURI: { uri: '' };
// }

export interface DocConfigFile {
  mysql_options: { user: string; password: string; port: number } & PoolOptions;
  pg_options: { user: string; password: string; port: number } & PoolConfig;
  rds_mysql_options: {
    user: string;
    password: string;
    port: number;
    host: string;
  } & PoolOptions;
  rds_pg_options: {
    user: string;
    password: string;
    port: number;
    host: string;
  } & PoolConfig;
  sqlite_options: { filename: string };
  directPGURI_options: { connectionString: string } & PoolConfig;
}

export type dbsInputted = {
  pg: boolean;
  msql: boolean;
  rds_pg: boolean;
  rds_msql: boolean;
  sqlite: boolean;
  directPGURI: boolean;
};

type configExists = {
  pg: boolean;
  msql: boolean;
  rds_pg: boolean;
  rds_msql: boolean;
  sqlite: boolean;
  directPGURI: boolean;
};

type combined = {
  dbsInputted: dbsInputted;
  configExists: configExists;
};

export interface MysqlQueryResolve {} // not implemented yet

// Where do we use DBFunctions?
export interface DBFunctions {
  pg_uri: string;
  curPG_DB: string;
  curMSQL_DB: string;
  curRDS_MSQL_DB: any;
  curRDS_PG_DB: {
    user: string;
    password: string;
    host: string;
  };
  curSQLite_DB: { path: string };
  curdirectPGURI_DB: string;
  dbsInputted: dbsInputted;

  setBaseConnections: () => Promise<combined>;
  query: (text: string, params: (string | number)[], dbType: DBType) => void;
  connectToDB: (db: string, dbType?: DBType) => Promise<void>;
  disconnectToDrop: (dbType: DBType) => Promise<void>;
  getLists: (dbName: string, dbType?: DBType) => Promise<DBListInterface>;
  getTableInfo: (tableName: string, dbType: DBType) => Promise<ColumnObj[]>;
  getDBNames: (dbType: DBType) => Promise<dbDetails[]>;
  getColumnObjects: (tableName: string, dbType: DBType) => Promise<ColumnObj[]>;
  getDBLists: (dbType: DBType, dbName: string) => Promise<TableDetails[]>;
  sampler: (queryString: string) => Promise<number>;
}

// export interface DBFunctions extends DocConfigFile {
//   pg_uri: string;
//   dbsInputted: dbsInputted;

//   setBaseConnections: () => Promise<combined>;
//   query: (text: string, params: (string | number)[], dbType: DBType) => any;
//   connectToDB: (db: string, dbType?: DBType) => Promise<void>;
//   disconnectToDrop: (dbType: DBType) => Promise<void>;
//   getLists: (dbName?: string, dbType?: DBType) => Promise<DBList>;
//   getTableInfo: (tableName: string, dbType: DBType) => Promise<ColumnObj[]>;
//   getDBNames: (dbType: DBType) => Promise<dbDetails[]>;
//   getColumnObjects: (tableName: string, dbType: DBType) => Promise<ColumnObj[]>;
//   getDBLists: (dbType: DBType, dbName: string) => Promise<TableDetails[]>;
//   sampler: (queryString: string) => Promise<number>;
// }

// definition: for connection Models
export interface connectionModelType {
  setBaseConnections: () => Promise<combined>;
  connectToDB: (db: string, dbType?: DBType) => Promise<void>;
  disconnectToDrop: (dbType: DBType) => Promise<void>;
}

/**
 * FRONTEND TABLE TYPES
 */

export type initialStateType = {
  db_type: DBType;
  guiTableArray: any[]; // for now any
  updatesArray: ErdUpdatesType;
};

// currently unused
export interface ErdDBInfo {
  db_name: string;
  db_type: DBType; // table catalog
  db_size_kb: number; // used to be string
}

// currently unused
export type ErdTables = TableType[];

// currently unused
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
  data_type: PSqlDataType | MySqlDataType | SqLiteDataType;
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

type SqLiteDataType = 'NULL' | 'INTEGER' | 'REAL' | 'TEXT' | 'BLOB' | 'NUMERIC';

interface PsqlColumn extends BaseColumn {
  is_identity: boolean;
}

interface MySqlColumn extends BaseColumn {
  column_key: string;
  extra: string[];
}

interface SqLiteColumn extends BaseColumn {
  // add sqlite specific column data
}

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

export type ViewName =
  | 'compareView'
  | 'dbView'
  | 'queryView'
  | 'quickStartView'
  | 'newSchemaView'
  | 'threeDView';

// export type Dialogs = implement dialogs type
export interface AppState {
  // createNewQuery: CreateNewQuery;
  selectedDb: string;
  setSelectedDb: (selDb: string) => void;
  workingQuery: QueryData | undefined;
  // setWorkingQuery: (selQuery: any) => void;
  queries: Record<string, QueryData>;
  // setQueries: (queries: Record<string, QueryData>) => void;
  comparedQueries: Record<string, QueryData>;
  // setComparedQueries: (comparedQueries: Record<string, QueryData>) => void;
  // setFilePath: (filePath: string) => void;
  newFilePath: string;
  setERView?: (boolean) => void;
  curDBType: DBType | undefined;
  setDBType: (dbType: DBType | undefined) => void;
  DBInfo: DatabaseInfo[] | undefined;
  setDBInfo?: (dbInfo: DatabaseInfo[] | undefined) => void;
  dbTables?: TableInfo[];
  setTables?: (tableInfo: TableInfo[]) => void;
  selectedTable?: TableInfo | undefined;
  setSelectedTable?: (tableInfo: TableInfo | undefined) => void;
}

// Not used currently
export interface FilePath {
  cancelled: boolean;
  filePath: string;
}

export type CreateNewQuery = (query: QueryData, queries: any) => void;

export interface QueryData {
  /**
   * SQL string as inputted by user
   */
  sqlString: string;
  /**
   * pg rows returned from running query on db.
   */
  returnedRows?: Record<string, unknown>[];
  /**
   * Execution Plan. Result of running EXPLAIN (FORMAT JSON, ANALYZE)
   */
  executionPlan?: ExplainJson;
  /**
   * Name of PG database that this query is run on
   */
  db: string;
  /**
   * User given label that identifies query
   */
  label: string;
  /**
   * User given group for acordian grouping
   */
  group: string;

  // flag: boolean

  numberOfSample: number;
  totalSampleTime: number | string;
  minimumSampleTime: number | string;
  maximumSampleTime: number | string;
  averageSampleTime: number | string;
}

export type ValidTabs = 'Results' | 'Execution Plan';

export type FeedbackSeverity = '' | 'error' | 'success' | 'info' | 'warning';

export interface Feedback {
  type: FeedbackSeverity;
  message: string | Record<string, unknown>;
}

// thresholds for execution plan tree visual warnings
export interface Thresholds {
  percentDuration: number;
  rowsAccuracy: number;
}

export interface DatabaseInfo {
  /**
   * Database name as available in Postgres
   */
  db_name: string;
  /**
   * Pretty string of database size
   */
  db_size: string;

  // Origin of this DB
  db_type: DBType;
}

export interface TableColumn {
  /**
   * Column name as available in Postgres
   */
  column_name: string;
  /**
   * Type of data that can be inserted into Column
   */
  data_type: string;
  /**
   * Maximum char length if data type is char and length is defined. Otherwise null
   */
  character_maximum_length: number | null;
  /**
   * Can this column receive Null values or not?
   */
  is_nullable: 'YES' | 'NO';
}

export interface TableInfo {
  /**
   * Table name as available in Postgres
   */
  table_name: string;
  /**
   * Database that contains this table
   */
  table_catalog: string;
  /**
   * Schema that owns this table
   */
  table_schema: string;
  /**
   * Is table read only?
   */
  is_insertable_into: 'yes' | 'no';
  columns: TableColumn[];
}

// type of node when explain is run with Analyze and Costs
// optionals vs mandatory were guessed based on examples. Needs confirmation
export interface PlanNode {
  'Node Type': string;
  'Join Type'?: string;
  'Startup Cost': number;
  'Total Cost': number;
  'Plan Rows': number;
  'Plan Width': number;
  'Actual Startup Time': number;
  'Actual Total Time': number;
  'Actual Rows': number;
  'Actual Loops'?: number;
  'Inner Unique'?: boolean;
  /**
   * Condition for Hash Operation
   *
   * ex: SELECT name FROM people p JOIN species s ON  **p.species_id = s._id**
   */
  'Hash Cond'?: string;
  /**
   * Name of relation plan operates on. i.e. table name
   */
  'Relation Name'?: string;
  /**
   * Alias given to relation in query.
   *
   * ex: SELECT name FROM people **p**
   */
  Alias?: string;
  Plans?: PlanNode[];
}

export interface ExplainJson {
  Plan: PlanNode;
  'Planning Time': number;
  'Execution Time': number;
  numberOfSample: number;
  totalSampleTime: number;
  minimumSampleTime: number;
  maximumSampleTime: number;
  averageSampleTime: number;
}

/**
 *
 * This section contains the types used for ER Tabling
 *
 *
 */
// Type never used
export type ERTablingConstants =
  | { TABLE_HEADER }
  | { TABLE_FIELD }
  | { TABLE_FOOTER };

// used with react flow not sure if this is needed
export type NodeTypes = {
  tableHeader: JSX.Element;
  tableField: JSX.Element;
  tableFooter: JSX.Element;
};

export interface ERTableData extends TableInfo {
  columns: ERTableColumnData[];
  new_table_name: string | null;
}

export interface ERTableColumnData extends TableColumn {
  new_column_name: string | null;
  constraint_name: string | null;
  constraint_type: string | null;
  foreign_column: string;
  foreign_table: string;
  unique?: boolean; // optional until implemented
  auto_increment?: boolean; // optional until implemented
}
type DataTypes = 'integer' | 'bigint' | 'varchar' | 'date' | null;
type DataTypesMySQL = 'int' | 'bigint' | 'varchar' | 'date' | null;

export type AddColumnsObjType = {
  column_name: string | null;
  data_type: DataTypes;
  character_maximum_length: number | null;
};
export type DropColumnsObjType = {
  column_name: string;
};
export type AlterColumnsObjType = {
  column_name: string;
  character_maximum_length: number | null;
  new_column_name: string | null;
  add_constraint: AddConstraintObjType[];
  current_data_type: string | null;
  data_type: string | null;
  is_nullable: 'YES' | 'NO' | null;
  drop_constraint: string[];
  rename_constraint: string | null;
  table_schema: string | null;
  table_name: string | null;
  constraint_type: 'PRIMARY KEY' | 'FOREIGN KEY' | 'UNIQUE' | null;
};

export type AddConstraintObjType = {
  constraint_type: 'PRIMARY KEY' | 'FOREIGN KEY' | 'UNIQUE' | null;
  constraint_name: string;
  foreign_table: string | null;
  foreign_column: string | null;
};

export type AddTablesObjType = {
  is_insertable_into: 'yes' | 'no';
  table_catalog: string;
  table_name: string;
  table_schema: string;
  columns: ERTableColumnData[];
  ericTestUnitTables?: any;
  col_N?: any;
  col_T?: any;
  col_L?: any;
};

export type DropTablesObjType = {
  table_name: string;
  table_schema: string;
};
export type AlterTablesObjType = {
  is_insertable_into: 'yes' | 'no' | null;
  table_catalog: string | null;
  table_name: string;
  new_table_name: string | null;
  table_schema: string | null;
  addColumns: AddColumnsObjType[];
  dropColumns: DropColumnsObjType[];
  alterColumns: AlterColumnsObjType[];
};

export type UpdatesObjType = {
  addTables: AddTablesObjType[];
  dropTables: DropTablesObjType[];
  alterTables: AlterTablesObjType[];
};

export type SchemaStateObjType = {
  database: string;
  tableList: TableInfo[];
};

export type TableHeaderDataObjectType = {
  table_name: string;
  schemaStateCopy: any;
  setSchemaState: (string) => {};
  backendObj: BackendObjType;
};

export type TableHeaderNodeType = {
  data: TableHeaderDataObjectType;
  id: string;
  position: {
    x: number;
    y: number;
  };
  tableName: string;
  type: string;
};
