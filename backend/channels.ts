const { ipcMain } = require('electron'); // IPCMain: Communicate asynchronously from the main process to renderer processes
const db = require('./models');
const { generateDummyData, writeCSVFile } = require('./DummyD/dummyDataMain');
const {
  createDBFunc,
  dropDBFunc,
  runSQLFunc,
  runTARFunc,
  runFullCopyFunc,
  runHollowCopyFunc,
  execute,
} = require('./helperFunctions');

// *************************************************** IPC Event Listeners *************************************************** //
ipcMain.on('return-db-list', (event, dbName) => {
  // console.log('in return-db-list', dbName);
  // DB query to get the database size
  let dbSize: string;
  if (dbName) {
    db.query(`SELECT pg_size_pretty(pg_database_size('${dbName}'));`).then(
      (queryStats) => {
        dbSize = queryStats.rows[0].pg_size_pretty;
      }
    );
  }
  db.getLists().then((data) => event.sender.send('db-lists', data, dbSize));
});

// Listen for database changes sent from the renderer upon changing tabs.
ipcMain.on('change-db', (event, dbName: string) => {
  event.sender.send('async-started'); // send notice to the frontend that async process has begun
  db.changeDB(dbName);
  event.sender.send('async-complete'); // send notice to the frontend that async process has completed
});

// Deletes the dbName that is passed from the front end and returns the DB List
ipcMain.on('drop-db', (event, dbName: string) => {
  // send notice to the frontend that async process has begun
  event.sender.send('async-started');
  const dropDBScript = dropDBFunc(dbName);
  db.query(dropDBScript).then(
    db.getLists().then((data) => {
      event.sender.send('db-lists', data);
      event.sender.send('async-complete');
    })
  );
});

/**
 * This function allows users to import the DB using the + icon on the front end
 * Users can import a .tar or .sql file
 * Additionally, this function allows the user to copy an existing database and optionally copy the data in the db
 */
interface SchemaType {
  schemaName: string;
  schemaFilePath: string[];
  schemaEntry: string;
  dbCopyName: string;
  copy: boolean;
}
ipcMain.on('input-schema', (event, data: SchemaType) => {
  // send notice to the frontend that async process has begun
  event.sender.send('async-started');

  const {
    dbCopyName: dbNameUserSelectedToCopy,
    copy: copyAllDataFromUserSelectedDB,
  } = data;
  let {
    schemaName: dbNameEnteredByUser,
    schemaFilePath: importedSchemaFilePath,
  } = data;
  const extension: string = Array.isArray(importedSchemaFilePath)
    ? importedSchemaFilePath[0].slice(
        importedSchemaFilePath[0].lastIndexOf('.')
      )
    : '.sql';
  // conditional to get the correct schemaFilePath name from the Load Schema Modal
  if (!importedSchemaFilePath) {
    importedSchemaFilePath = [`${dbNameEnteredByUser}.sql`];
  }

  // defaults to the sql file name if DB name is not provided by user
  if (dbNameEnteredByUser === '') {
    dbNameEnteredByUser = `a${Math.floor(
      Math.random() * 1000000000000000
    ).toString()}`;
  }

  // Each function returns the Postgres command that will be executed on the command line by invoking the execute function
  const createDB: string = createDBFunc(dbNameEnteredByUser);
  const runSQL: string = runSQLFunc(
    dbNameEnteredByUser,
    importedSchemaFilePath
  );
  const runTAR: string = runTARFunc(
    dbNameEnteredByUser,
    importedSchemaFilePath
  );
  const runFullCopy: string = runFullCopyFunc(
    dbNameUserSelectedToCopy,
    importedSchemaFilePath
  );
  const runHollowCopy: string = runHollowCopyFunc(
    dbNameUserSelectedToCopy,
    importedSchemaFilePath
  );

  // Change the URI to new DB, send DB lists and tables in current DB
  async function sendLists() {
    const listObj: any = await db.getLists();
    event.sender.send('db-lists', listObj);
    event.sender.send('async-complete');
  }

  const changeCurrentDB = () => {
    db.changeDB(dbNameEnteredByUser);
    const runCmd: string = extension === '.sql' ? runSQL : runTAR;
    execute(runCmd, sendLists);
  };

  const importOrCopyExistingDB = () => {
    // User selected to copy from existing DB Schema
    if (dbNameUserSelectedToCopy) {
      // change DB instance to the DB the User wants to copy
      db.changeDB(dbNameUserSelectedToCopy);
      // If User wanted to copy data from Existing DB execute rullFullCopy
      if (copyAllDataFromUserSelectedDB) {
        execute(runFullCopy, changeCurrentDB);
      }
      // Else execute runHollowCopy
      else execute(runHollowCopy, changeCurrentDB);
    } else {
      changeCurrentDB();
    }
  };
  // Run createDB script on command line via Node.js and then execute CB
  execute(createDB, importOrCopyExistingDB);
});

// Listen for queries being sent from renderer
interface QueryType {
  queryCurrentSchema: string;
  queryString: string;
  queryLabel: string;
  queryData: string;
  queryStatistics: string;
}
ipcMain.on('execute-query-tracked', (event, data: QueryType) => {
  // send notice to front end that query has been started
  event.sender.send('async-started');

  // destructure object from frontend
  const { queryCurrentSchema, queryLabel } = data;
  let { queryString } = data;

  // Removing semicolon if its added to the end of the query
  if (queryString[queryString.length - 1] === ';')
    queryString = queryString.slice(0, queryString.length - 1);

  // initialize object to store all data to send to frontend
  const frontendData = {
    queryString,
    queryCurrentSchema,
    queryLabel,
    queryData: '',
    queryStatistics: '',
    lists: {},
  };

  // console.log(frontendData);

  // potential create table query
  // CREATE TABLE IF NOT EXISTS test4 (
  //   id SERIAL PRIMARY KEY,
  //   name VARCHAR NOT NULL,
  //   mass VARCHAR
  // )

  db.query(`BEGIN; EXPLAIN (FORMAT JSON, ANALYZE) ${queryString}; ROLLBACK;`)
    // db.query(`EXPLAIN (FORMAT JSON, ANALYZE) ${queryString}`).then(
    .then((queryStats) => {
      frontendData.queryStatistics = queryStats[1].rows;
    })
    .then(() => {
      db.query(queryString).then((queryData) => {
        frontendData.queryData = queryData.rows;
        (async function getListAsync() {
          const listObj: any = await db.getLists();
          frontendData.lists = listObj;
          event.sender.send('db-lists', listObj);
          event.sender.send('return-execute-query', frontendData);
          event.sender.send('async-complete');
          // console.log('all events sent');
        })();
      });
    })
    .catch((error: string) => {
      console.log(
        'channels line 337: ERROR in execute-query-tracked channel in main.ts',
        error
      );
    });
});

interface dummyDataRequestType {
  schemaName: string;
  dummyData: {};
}
ipcMain.on('generate-dummy-data', (event: any, data: dummyDataRequestType) => {
  // send notice to front end that DD generation has been started
  event.sender.send('async-started');
  let schemaLayout: any;
  const dummyDataRequest: dummyDataRequestType = data; // { schemaName: 'hello', dummyData: { people: 1 } }
  let tableMatricesArray: any;
  let keyObject: any = 'Unresolved';

  // Retrieves the Primary Keys and Foreign Keys for all the tables
  //   tableName: { primaryKeyColumns: { _id: true }, foreignKeyColumns: { key: value, key: value} },
  db.createKeyObject().then((result) => {
    keyObject = result;
    // Iterating over the passed in keyObject to remove the primaryKeyColumn and all foreignKeyColumns from table
    db.dropKeyColumns(keyObject).then(() => {
      db.addNewKeyColumns(keyObject).then(() => {
        db.getSchemaLayout().then((schemaLayoutResult) => {
          schemaLayout = schemaLayoutResult;
          // generate the dummy data and save it into matrices associated with table names
          tableMatricesArray = generateDummyData(
            schemaLayout,
            dummyDataRequest,
            keyObject
          );
          // iterate through tableMatricesArray to write individual .csv files
          for (const tableObject of tableMatricesArray) {
            // write all entries in tableMatrix to csv file
            writeCSVFile(
              tableObject,
              schemaLayout,
              keyObject,
              dummyDataRequest,
              event
            );
          }
        });
      });
    });
  });
});

export default execute;

// // ************************************** CLI COMMANDS TO CREATE, DELETE, COPY DB SCHEMA **************************************

// Generate CLI commands to be executed in child process.
// The electron app will access your terminal to execute these postgres commands

// // create a database
// const createDBFunc = (name) => `psql -U postgres -c "CREATE DATABASE ${name}"`;

// // import SQL file into new DB created
// const runSQLFunc = (dbName, file) => `psql -U postgres -d ${dbName} -f ${file}`;

// // import TAR file into new DB created
// const runTARFunc = (dbName, file) =>
//   `pg_restore -U postgres -d ${dbName} -f ${file}`;

// // make a full copy of the schema
// const runFullCopyFunc = (dbCopyName, file) => {
//   const newFile = file[0];
//   console.log('fullCopyPath: ', newFile);

//   return `pg_dump -U postgres -d ${dbCopyName} -f ${newFile}`;
// };

// // make a hollow copy of the schema
// const runHollowCopyFunc = (dbCopyName, file) => {
//   console.log('shallow: ', file);
//   return `pg_dump -s -U postgres ${dbCopyName} -f ${file}`;
// };

// // Function to execute commands in the child process.
// const execute = (str: string, nextStep: any) => {
//   console.log('in execute: ', str);
//   exec(str, (error, stdout, stderr) => {
//     console.log('channels line 43 exec func: ', str); // , `${stdout}`);
//     if (error) {
//       // this shows the console error in an error message on the frontend
//       dialog.showErrorBox(`${error.message}`, '');
//       console.log(`channels line 47 error: ${error.message}`);
//       return;
//     }
//     if (stderr) {
//       // this shows the console error in an error message on the frontend
//       dialog.showErrorBox(`${stderr}`, '');
//       console.log(`channels line 53 stderr: ${stderr}`);
//       return;
//     }

//     if (nextStep) nextStep();
//   });
// };

// ************************************** IPC CHANNELS **************************************

// Global variable to store list of databases and tables to provide to frontend upon refreshing view.

// // Listen for file upload. Create an instance of database from pre-made .tar or .sql file.
// ipcMain.on('upload-file', (event, filePath: [string]) => {
//   // send notice to the frontend that async process has begun
//   event.sender.send('async-started');

//   // variables
//   const path = filePath[0]; // filePath = [ '/Users/faraz/Desktop/starwars_postgres_create.sql' ]
//   // let dbName: string; // dbName = 'starwars_postgres_create';
//   const extension: string = path.slice(path.lastIndexOf('.'));
//   const dbName: string = // dbName = 'starwars_postgres_create';
//     process.platform === 'darwin'
//       ? path.slice(path.lastIndexOf('/') + 1, path.lastIndexOf('.'))
//       : path.slice(
//           path.lastIndexOf('\\') + 1, // Need to escape to allow for '\'
//           path.lastIndexOf('.')
//         );
//   let dbSize: string;
//   let createDB: string;

//   // Send list of DBs, schema-name, tell front-end to switch tabs, tell front-end async-completed
//   async function sendLists() {
//     listObj = await db.getLists();
//     // Send list of databases and tables, as well as database size to frontend.
//     event.sender.send('db-lists', listObj, dbSize);
//     // Send schema name back to frontend, so frontend can load tab name.
//     event.sender.send('return-schema-name', dbName);
//     // tell the front end to switch tabs to the newly created database
//     event.sender.send('switch-to-new', null);
//     // notify frontend that async process has been completed
//     event.sender.send('async-complete');
//   }

//   // Create empty db & change current URI to match the newly created DB
//   if (extension === '.sql' || extension === '.tar') {
//     createDB = createDBFunc(dbName); // SQL Script is Returned
//     const runCmd: string =
//       extension === '.sql'
//         ? runSQLFunc(dbName, filePath)
//         : runTARFunc(dbName, filePath); // Return SQL Script

//     // Change the URI to new DB, get DB size, import uploaded file, and send response back
//     const importDB = () => {
//       // Change current URI to match newly created DB
//       db.changeDB(dbName);
//       // DB query to get the database size
//       db.query(`SELECT pg_size_pretty(pg_database_size('${dbName}'));`)
//         .then((queryStats) => {
//           dbSize = queryStats.rows[0].pg_size_pretty;
//         })
//         .then(() => {
//           execute(runCmd, sendLists); // Pass in SQL Scipt to import SQL or TAR file and next func to execute};
//         });
//     };
//     execute(createDB, importDB); // Pass in SQL Script to create DB and next func to execute
//   } else
//     console.log(
//       'upload-file: Empty DB not created because of invalid file type.'
//     );
// });

// ipcMain.on('execute-query-untracked', (event, data: QueryType) => {
//   // send notice to front end that query has been started
//   event.sender.send('async-started');

//   // destructure object from frontend
//   const { queryString } = data;
//   // console.log('executing untracked query');
//   // run query on db
//   db.query(queryString)
//     .then(() => {
//       (async function getListAsync() {
//         listObj = await db.getLists();
//         event.sender.send('db-lists', listObj);
//         event.sender.send('async-complete');
//       })();
//     })
//     .catch((error: string) => {
//       console.log(
//         'channels line 284: ERROR in execute-query-untracked channel in main.ts',
//         error
//       );
//       event.sender.send('query-error', 'Error executing query.');
//     });
// });

// Run select * from actors;
// db.query(queryString)
//   .then((queryData) => {
//     console.log('-----------------------------------------');
//     console.log(queryData);
//     console.log('-----------------------------------------');

//     frontendData.queryData = queryData.rows; // probably an array
// if (!queryString.match(/create/i)) {
// Run EXPLAIN (FORMAT JSON, ANALYZE)
// db.query(`BEGIN; EXPLAIN (FORMAT JSON, ANALYZE) ${queryString}; ROLLBACK;`).then(

// // db.query(`EXPLAIN (FORMAT JSON, ANALYZE) ${queryString}`).then(
//   (queryStats) => {
//     console.log('-----------------------------------------');
//     console.log(queryStats);
//     console.log('-----------------------------------------');
//     frontendData.queryStatistics = queryStats.rows;

//     (async function getListAsync() {
//       listObj = await db.getLists();
//       frontendData.lists = listObj;
//       event.sender.send('db-lists', listObj);
//       event.sender.send('return-execute-query', frontendData);
//       event.sender.send('async-complete');
//     })();
//   }
// );
// } else {
//   // Handling for tracking a create table query, can't run explain/analyze on create statements
//   (async function getListAsync() {
//     listObj = await db.getLists();
//     frontendData.lists = listObj;
//     event.sender.send('db-lists', listObj);
//     event.sender.send('async-complete');
//   })();
// }
// })
// .catch((error: string) => {
//   console.log(
//     'channels line 337: ERROR in execute-query-tracked channel in main.ts',
//     error
//   );
// });
// });
