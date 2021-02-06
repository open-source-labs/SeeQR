/**
 * This file contains common types that need to be used across the frontend
 */

import type { SavedQueries, QueryData } from './classes/SavedQueries';

export type { SavedQueries, QueryData };
// Rename Query type for ease of use
export type Query = SavedQueries.Query;

type ViewName = 'compareView' | 'dbView' | 'queryView' | 'quickStartView';

export interface AppState {
  selectedView: ViewName;
  setSelectedView: (selView: ViewName) => void;
  selectedDb: string;
  setSelectedDb: (selDb: string) => void;
  queries: SavedQueries;
}

export type userCreateQuery = () => void;
export type CreateNewQuery = (query: QueryData) => void;

// Electron Interface //

// Due to legacy reasons data arriving from the backend is being treated as
// unknown types until full typing can be implemented on the backend

/**
 * Fake type guard that asserts a type to simplify tests inside real type guards
 */
// type assertions don't work with arrow functions https://github.com/microsoft/TypeScript/issues/34523
function assumeType <T>(x: unknown): asserts x is T {} 

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

interface ExplainJson {
  Plan: PlanNode;
  'Planning Time': number;
  'Execution Time': number;
}
export type ExplainResult = [ExplainJson];

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

    if (!obj.queryStatistics[0].Plan) return false;
  } catch (e) {
    return false;
  }
  return true;
};
