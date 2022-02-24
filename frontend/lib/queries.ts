/**
 * Functions that operate on collections of queries and individual queries. Used
 * to create and modify state objects for App.state.queries and
 * App.state.comparedQueries
 */

import ms from 'ms';
import { AppState, QueryData } from '../types';


const path = require('path');
const fs = require('fs');
const electron = require('electron');


/**
 * create identifiew from label and database name
 */
export const keyFromData = (label: string, db: string) =>
  `label:${label} db:${db}`;

/**
 * create identifiew from query object
 */
export const key = (query: QueryData) => `label:${query.label} db:${query.db}`;

/**
 * Creates new query in collection
 * returns new queries object with all queries but deleted one
 */
export const createQuery = (
  queries: AppState['queries'],
  newQuery: QueryData
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
  queryToDelete: QueryData
) => {
  const tempQueries = { ...queries };
  delete tempQueries[key(queryToDelete)];
  return tempQueries;
};


// Finds proper data path for saving based on operating system

function getAppDataPath() {
  switch (process.platform) {
    case "darwin": {
      return path.join(process.env.HOME, "Library", "Application Support", "SeeQR App", "SeeQR Data.json");
    }
    case "win32": {
      return path.join(process.env.APPDATA, "../../Documents/SeeQR Data.json");
    }
    // case "linux": {
    //   return path.join(process.env.HOME, ".SeeQR Data.json");
    // }
    default: {
      console.log("Unsupported platform!");
      process.exit(1);
    }
  }
}

// saves query data locally
type SaveQuery = (query: QueryData) => void

export const saveQuery: SaveQuery = (
  query: QueryData
) => {
  const appDataDirPath: string = getAppDataPath();
  fs.access(appDataDirPath, (err) => {
    if (err) {
      console.log('File not found, writing file');
      console.log(appDataDirPath)
      try {
        const label: string = `label:${query.label} db:${query.db}`
        const data: object = {};
        data[label] = query;
        fs.writeFileSync(appDataDirPath, JSON.stringify(data));
        console.log('File saved successfully');
      } catch (err) {
        console.log(err);
      };
    } else {
      console.log('File is found');
      console.log(appDataDirPath)
      const data: object = JSON.parse(fs.readFileSync(appDataDirPath));
      const label: string = `label:${query.label} db:${query.db}`
      console.log(data);
      console.log(query);
      data[label] = query;
      fs.writeFileSync(appDataDirPath, JSON.stringify(data));
      console.log('File saved successfully');
    };
  })
}

/**
 * Sets compare state for query
 * Adds or remove query from comparedQueries collection 
 */
export const setCompare = (
  comparedQueries: AppState['comparedQueries'],
  query: QueryData,
  isCompared: boolean
) => {
  const tempQueries = { ...comparedQueries };

  if (!isCompared) {
    delete tempQueries[key(query)];
    return tempQueries;
  }

  tempQueries[key(query)] = query;
  return tempQueries;
};

/**
 * Get query execution time. Planning + Execution. Returns 0 if not given a query
 */
export const getTotalTime = (query: QueryData | undefined) => {
  if (!query?.executionPlan) return 0;
  return (
    query.executionPlan['Execution Time'] + query.executionPlan['Planning Time']
  );
};

/**
 * Get query exeuction time as a formatted string. Returns undefined if  not given a query
 */
export const getPrettyTime = (query: QueryData | undefined) => {
  if (!query?.executionPlan) return undefined 
  return ms(+getTotalTime(query).toPrecision(3), { long: true });
};
