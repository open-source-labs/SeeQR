/**
 * This file contains common types that need to be used across the frontend
 */

import type { SavedQueries, QueryData} from './classes/SavedQueries';

export type { SavedQueries, QueryData };
// Rename Query type for ease of use
export type Query = SavedQueries.Query

type ViewName = 'compareView' | 'dbView' | 'queryView' | 'quickStartView';

export interface AppState {
  selectedView: ViewName;
  setSelectedView: (selView: ViewName) => void;
  selectedDb: string;
  setSelectedDb: (selDb: string) => void;
  queries: SavedQueries;
}

export type userCreateQuery = () => void;

// Electron Interface //

// Due to legacy reasons data arriving from the backend is being treated as
// unknown types until full typing can be implemented on the backend

export interface DbLists {
  databaseList: string[];
  tableList: string[];
}

/**
 * Type guard that checks if obj is compatible with type DbLists
 */
export const isDbLists = (obj: unknown): obj is DbLists => {
  // TODO: is it error to access property of primitive type? if so, need to guard against that
  if (!(obj as DbLists).databaseList || !(obj as DbLists).tableList)
    return false;
  if (
    !Array.isArray((obj as DbLists).databaseList) ||
    !Array.isArray((obj as DbLists).tableList)
  )
    return false;
  if (
    (obj as DbLists).databaseList[0] &&
    typeof (obj as DbLists).databaseList[0] !== 'string'
  )
    return false;
  if (
    (obj as DbLists).tableList[0] &&
    typeof (obj as DbLists).tableList[0] !== 'string'
  )
    return false;
  return true;
};
