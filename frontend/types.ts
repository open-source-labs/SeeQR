/**
 * This file contains common types that need to be used across the frontend
 */

type ViewName = 'compareView' | 'dbView' | 'queryView' | 'quickStartView';

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
}

export type ValidTabs = 'Results' | 'Execution Plan';

export type FeedbackSeverity = 'error' | 'success' | 'info' | 'warning';

export interface Feedback {
  type: FeedbackSeverity;
  message: string | Record<string, unknown>;
}

// Electron Interface //

// Due to legacy reasons data arriving from the backend is being treated as
// unknown types until full typing can be implemented on the backend

/**
 * Fake type guard that asserts a type to simplify tests inside real type guards
 */
// type assertions don't work with arrow functions https://github.com/microsoft/TypeScript/issues/34523
function assumeType<T>(x: unknown): asserts x is T {}

export interface DbLists {
  databaseList: string[];
  tableList: string[];
}

/**
 * Type guard that checks if obj is compatible with type DbLists
 */
export const isDbLists = (obj: unknown): obj is DbLists => {
  try {
    assumeType<DbLists>(obj);
    if (!obj.databaseList || !(obj as DbLists).tableList) return false;
    if (!Array.isArray(obj.databaseList) || !Array.isArray(obj.tableList))
      return false;
    if (obj.databaseList[0] && typeof obj.databaseList[0] !== 'string')
      return false;
    if (obj.tableList[0] && typeof obj.tableList[0] !== 'string') return false;
  } catch (e) {
    return false;
  }
  return true;
};

// type of node when explain is run with Analyze and Costs
// TODO: optionals vs mandatory were guessed based on examples. Needs confirmation
interface PlanNode {
  'Node Type': string;
  'Join Type'?: string;
  'Startup Cost': number;
  'Total Cost': number;
  'Plan Rows': number;
  'Plan Width': number;
  'Actual Startup Time': number;
  'Actual Total Time': number;
  'Actual Rows': number;
  'Actual Loops': number;
  'Inner Unique'?: boolean;
  'Hash Cond'?: string;
  Plans?: PlanNode[];
}

export interface ExplainJson {
  Plan: PlanNode;
  'Planning Time': number;
  'Execution Time': number;
}

type ExplainResult = [{ 'QUERY PLAN': [ExplainJson] }];

export interface BackendQueryData {
  queryString: string;
  queryData: Record<string, unknown>[];
  queryStatistics: ExplainResult;
  queryCurrentSchema: string;
  queryLabel: string;
}

export const isBackendQueryData = (obj: unknown): obj is BackendQueryData => {
  // assume obj is of BackenQueryData type and perform checks. If obj is not an
  // object try/catch handles error
  try {
    assumeType<BackendQueryData>(obj);
    if (typeof obj.queryString !== 'string') return false;
    if (typeof obj.queryLabel !== 'string') return false;
    if (typeof obj.queryCurrentSchema !== 'string') return false;
    if (!Array.isArray(obj.queryData)) return false;

    // if queryData array is not empty and first element is not an object
    if (
      obj.queryData[0] &&
      (typeof obj.queryData[0] !== 'object' || obj.queryData[0] === null)
    )
      return false;

    if (!obj.queryStatistics[0]['QUERY PLAN'][0].Plan) return false;
  } catch (e) {
    return false;
  }
  return true;
};
