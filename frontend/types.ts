import {TABLE_HEADER, TABLE_FIELD} from './constants/constants'

/**
 * This file contains common types that need to be used across the frontend
 */

type ViewName = 'compareView' | 'dbView' | 'queryView' | 'quickStartView' | 'newSchemaView';

export interface AppState {
  selectedView: ViewName;
  setSelectedView: (selView: ViewName) => void;
  selectedDb: string;
  setSelectedDb: (selDb: string) => void;
  workingQuery: QueryData | undefined;
  setWorkingQuery: (selQuery: QueryData | undefined) => void;
  queries: Record<string, QueryData>;
  setQueries: (queries: Record<string, QueryData>) => void;
  comparedQueries: Record<string, QueryData>;
  setComparedQueries: (comparedQueries: Record<string, QueryData>) => void;
  setSidebarHidden: (isHidden: boolean) => void;
  sidebarIsHidden: boolean;
  setFilePath: (filePath: string) => void;
  newFilePath: string
}

export interface FilePath {
  cancelled: boolean,
  filePath: string
}

export type CreateNewQuery = (query: QueryData) => void;

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
  group: string

  // flag: boolean

}

export type ValidTabs = 'Results' | 'Execution Plan';

export type FeedbackSeverity = 'error' | 'success' | 'info' | 'warning';

export interface Feedback {
  type: FeedbackSeverity;
  message: string | Record<string, unknown>;
}

// thresholds for execution plan tree visual warnings
export interface Thresholds {
  percentDuration: number;
  rowsAccuracy: number;
}

// Electron Interface //

// Due to legacy reasons some data arriving from the backend is being treated as
// unknown types until full typing can be implemented on the backend

/**
 * Fake type guard that asserts a type to simplify tests inside real type guards
 */
// type assertions don't work with arrow functions https://github.com/microsoft/TypeScript/issues/34523
function assumeType<T>(x: unknown): asserts x is T {}

export interface DatabaseInfo {
  /**
   * Database name as available in Postgres
   */
  db_name: string;
  /**
   * Pretty string of database size
   */
  db_size: string;
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
  is_nullable: 'yes' | 'no';
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

export interface DbLists {
  databaseList: DatabaseInfo[];
  tableList: TableInfo[];
}


/**
 * Type guard that checks if obj is compatible with type DbLists
 */
export const isDbLists = (obj: unknown): obj is DbLists => {
  try {
    assumeType<DbLists>(obj);
    if (!obj.databaseList || !obj.tableList) return false;
    if (!Array.isArray(obj.databaseList) || !Array.isArray(obj.tableList))
      return false;
    if (obj.databaseList[0] && typeof obj.databaseList[0].db_name !== 'string')
      return false;
    if (obj.databaseList[0] && typeof obj.databaseList[0].db_size !== 'string')
      return false;
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
}

/**
 * 
 * This section contains the types used for ER Tabling
 * 
 * 
 */

export type ERTablingConstants = {TABLE_HEADER} | {TABLE_FIELD};

export type NodeTypes = {
  tableHeader: JSX.Element
  tableField: JSX.Element
}

export type ERTableColumnData = {
  constraint_type: string;
  column_name: string;
  data_type: string;
  character_maximum_length: number;
  unique?: boolean; // optional until implemented
  auto_increment?: boolean; // optional until implemented
  foreign_column: string[];
  foreign_table: string[];
}







