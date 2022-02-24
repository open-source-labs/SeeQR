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
      return path.join(process.env.APPDATA, "SeeQR Data.json");
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

  // fs.readFile(appDataDirPath, "utf8", (err, jsonString) => {
  //   if (err) console.log(err);
  //   else {
  //     console.log(jsonString)
  //   }
  // })
  // const query = JSON.stringify(queries);
  
  // fs.appendFile(appDataDirPath, query, (err) => {
  //     if (err) console.log(err);
  //     else console.log("file saved at:", appDataDirPath)
  //   })


  // fs.appendFile(appDatatDirPath, query, (err) => {
  //   if (err) console.log(err);
  //   else console.log("file saved at:", appDatatDirPath)
  // })
  // fs.readFile(appDataDirPath, )
  // fs.stat(appDataDirPath, (err, status) => {
  //   console.log(status.isDirectory());
    // if (status) console.log('line 89', status)
    // if (err) console.log('line 90', err)
    // if (err) console.log(err);
    // else {
    //   fs.readFile(appDataDirPath, "utf8", (err, data) => {
    //     if (err) {
    //       console.log(err)
    //     } else {
    //       //helper variables
    //       let helper = true;
    //       const arr = Object.keys(data);
    //       const compared = Object.keys(query)[0]
    //       //checking if label is already inside data
    //       for (let i = 0; i < arr.length; i++) {
    //         if (arr[i] === compared) helper = false;
    //       }
    //       //if not already there then write it in
    //       if (helper) {
    //         const newData = data;
    //         newData[compared] = query[compared]
    //         fs.writeFile(newData, appDataDirPath)
    //         console.log('file saved!')
    //       }
    //     }
    //   });
    // }
//   })
// }

/**
fs.access(appDataDirPath, (err) => {
  if (err) {
    try {
      fs.writeFileSync('SeeQR Data.json', query);
      console.log('File saved successfully');
    } catch (err) {
      console.log(err);
    };
  } else {
    const data = JSON.parse(fs.readFileSync(appDataDirPath));
    const label = Object.keys(query)[0];
    data[label] = query[label];
    fs.writeFileSync('SeeQR Data.json', data);
    });
  };
})
*/

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
