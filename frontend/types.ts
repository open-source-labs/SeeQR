/**
 * This file contains common types that need to be used across the frontend
 */

import type SavedQueries from './classes/SavedQueries';

type ViewName = 'compareView' | 'dbView' | 'queryView' | 'quickStartView';

export interface AppState {
  selectedView: ViewName;
  setSelectedView: (selView: ViewName) => void;
  selectedDb: string;
  setSelectedDb: (selDb: string) => void;
  queries: SavedQueries;
}

export type userCreateQuery = () => void;

/** Electron Interface */

export interface DbLists {
  databaseList: string[],
  tableList: string[]
}

export const isDbLists = (obj: unknown): obj is DbLists => {
  // TODO: is it error to access property of primitive type? if so, need to guard against that
  if (!(obj as DbLists).databaseList || !(obj as DbLists).tableList) return false
  if (!Array.isArray((obj as DbLists).databaseList) || !Array.isArray((obj as DbLists).tableList)) return false
  if ((obj as DbLists).databaseList[0] && typeof (obj as DbLists).databaseList[0] !== 'string') return false
  if ((obj as DbLists).tableList[0] && typeof (obj as DbLists).tableList[0] !== 'string') return false
  return true
}