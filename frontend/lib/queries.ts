/**
 * Functions that operate on collections of queries and individual queries. Used
 * to create and modify state objects for App.state.queries and
 * App.state.comparedQueries
 */

import fs from 'fs';
import path from 'path';
import ms from 'ms';
import { AppState, QueryData } from '../types';
import { sendFeedback } from './utils';

/**
 * create identifiew from label and database name
 */
export const keyFromData = (label: string, db: string, group: string) =>
  `label:${label} db:${db} group:${group}`;

/**
 * create identifiew from query object
 */
export const key = (query: QueryData) =>
  `label:${query.label} db:${query.db} group:${query.group}`;

/**
 * Creates new query in collection
 * returns new queries object with all queries but deleted one
 */
export const createQuery = (
  queries: AppState['queries'],
  newQuery: QueryData,
) => ({
  ...queries,
  [key(newQuery)]: newQuery,
});

/**
 * delete query from collection
 * returns new queries object with all queries but deleted one
 */
export const deleteQuery = (
  queries: AppState['queries'],
  queryToDelete: QueryData,
) => {
  const tempQueries = { ...queries };
  delete tempQueries[key(queryToDelete)];
  return tempQueries;
};

// Finds proper data path for saving based on operating system
// type GetAppDataPath = (file: string) => string;

// used to determine default filepath for saving query information locally
export const getAppDataPath = (file: 'sql' | 'json' = 'json') => {
  switch (process.platform) {
    case 'darwin':
      return path.join(process.env.HOME ?? '', 'Library', `SeeQR Data.${file}`);

    case 'win32':
      return path.join(
        process.env.APPDATA ?? '',
        `../../Documents/SeeQR Data.${file}`,
      );

    case 'linux':
      return path.join(process.env.HOME ?? '', `.SeeQR Data.${file}`);

    default:
      // console.log("Unsupported platform!");
      return process.exit(1);
  }
};

// saves query data locally
type SaveQuery = (query: QueryData, filepath: string) => void;

export const saveQuery: SaveQuery = (query: QueryData, filePath: string) => {
  // Open electron prompt and async writes to file
  fs.access(filePath, (err: unknown) => {
    if (err) {
      try {
        const label: string = `label:${query.label} db:${query.db} group:${query.group}`;
        const data: object = {};
        data[label] = query;
        fs.writeFileSync(filePath, JSON.stringify(data));
        sendFeedback({
          type: 'info',
          message: `File saved at location ${filePath}`,
        });
      } catch (err: unknown) {
        console.log(err);
      }
    } else {
      // console.log('File is found');
      const data: object = JSON.parse(fs.readFileSync(filePath).toString());
      const label: string = `label:${query.label} db:${query.db} group:${query.group}`;
      data[label] = query;
      fs.writeFileSync(filePath, JSON.stringify(data));
      sendFeedback({
        type: 'info',
        message: `File saved at location ${filePath}`,
      });
    }
  });
};

/**
 * Sets compare state for query
 * Adds or remove query from comparedQueries collection
 */
export const setCompare = (
  comparedQueries: AppState['comparedQueries'],
  queries: Record<string, QueryData>,
  query: QueryData,
  isCompared: boolean,
) => {
  const tempQueries: any = JSON.parse(JSON.stringify(comparedQueries));
  const queriess: any = { ...queries };
  const qKey = key(query);

  if (!isCompared) {
    tempQueries[qKey].executionPlan['Execution Time'] = 0;
    tempQueries[qKey].executionPlan['Planning Time'] = 0;
    return tempQueries;
  }

  if (tempQueries.hasOwnProperty(qKey)) {
    tempQueries[qKey].executionPlan['Execution Time'] =
      queriess[qKey].executionPlan['Execution Time'];
    tempQueries[qKey].executionPlan['Planning Time'] =
      queriess[qKey].executionPlan['Planning Time'];
  } else {
    tempQueries[qKey] = query;
  }
  return tempQueries;
};

/**
 * Get query execution time. Planning + Execution. Returns 0 if not given a query
 */
export const getTotalTime = (query: QueryData | undefined) => {
  if (!query?.executionPlan) return 0;
  return (
    // query.executionPlan['Execution Time'] + query.executionPlan['Planning Time']
    query.executionPlan.totalSampleTime / query.executionPlan.numberOfSample
  );
};

/**
 * Get query exeuction time as a formatted string. Returns undefined if  not given a query
 */
export const getPrettyTime = (query: QueryData | undefined) => {
  if (!query?.executionPlan) return undefined;
  return ms(+getTotalTime(query).toPrecision(8), { long: true });
};
