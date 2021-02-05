/**
 * Dialog: display native system dialogs for opening and saving files, alerting, etc
 * IPCMain: Communicate asynchronously from the main process to renderer processes
 * S3: Importing Node.js module
 * Child_Process: Importing Node.js' child_process API
 */
const { dialog, ipcMain } = require('electron');
const S3 = require('aws-sdk/clients/s3');
const { exec } = require('child_process');

const db = require('./models');
const { generateDummyData, writeCSVFile } = require('./DummyD/dummyDataMain');

// ************************************** CLI COMMANDS TO CREATE, DELETE, COPY DB SCHEMA **************************************

// Generate CLI commands to be executed in child process.
// The electron app will access your terminal to execute these postgres commands

// create a database
const createDBFunc = (name) => `psql -U postgres -c "CREATE DATABASE ${name}"`;

// import SQL file into new DB created
const runSQLFunc = (dbName, file) => `psql -U postgres -d ${dbName} -f ${file}`;

// import TAR file into new DB created
const runTARFunc = (dbName, file) =>
  `pg_restore -U postgres -d ${dbName} -f ${file}`;

// make a full copy of the schema
const runFullCopyFunc = (dbCopyName, file) => {
  const newFile = file[0];

  return `pg_dump -U postgres -d ${dbCopyName} -f ${newFile}`;
};

// make a hollow copy of the schema
const runHollowCopyFunc = (dbCopyName, file) =>
  `pg_dump -s -U postgres ${dbCopyName} -f ${file}`;

// Function to execute commands in the child process.
const execute = (str: string, nextStep: any) => {
  console.log('in execute: ', str);
  exec(str, (error, stdout, stderr) => {
    console.log('channels line 43 exec func: ', str); // , `${stdout}`);
    if (error) {
      // this shows the console error in an error message on the frontend
      dialog.showErrorBox(`${error.message}`, '');
      console.log(`channels line 47 error: ${error.message}`);
      return;
    }
    if (stderr) {
      // this shows the console error in an error message on the frontend
      dialog.showErrorBox(`${stderr}`, '');
      console.log(`channels line 53 stderr: ${stderr}`);
      return;
    }

    if (nextStep) nextStep();
  });
};

// ************************************** IPC CHANNELS **************************************

// Global variable to store list of databases and tables to provide to frontend upon refreshing view.
let listObj: any;

ipcMain.on('return-db-list', (event, dbName) => {
  console.log('in return-db-list', dbName);
  // DB query to get the database size
  let dbSize: string;
  db.query(`SELECT pg_size_pretty(pg_database_size('${dbName}'));`).then(
    (queryStats) => {
      dbSize = queryStats.rows[0].pg_size_pretty;
    }
  );
  db.getLists().then((data) => event.sender.send('db-lists', data, dbSize));
});

// Listen for database changes sent from the renderer upon changing tabs.
ipcMain.on('change-db', (event, dbName) => {
  db.changeDB(dbName);
});

// Listen for file upload. Create an instance of database from pre-made .tar or .sql file.
ipcMain.on('upload-file', (event, filePath: [string]) => {
  // send notice to the frontend that async process has begun
  event.sender.send('async-started');

  // variables
  const path = filePath[0]; // filePath = [ '/Users/faraz/Desktop/starwars_postgres_create.sql' ]
  // let dbName: string; // dbName = 'starwars_postgres_create';
  const extension: string = path.slice(path.lastIndexOf('.'));
  const dbName: string = // dbName = 'starwars_postgres_create';
    process.platform === 'darwin'
      ? path.slice(path.lastIndexOf('/') + 1, path.lastIndexOf('.'))
      : path.slice(
          path.lastIndexOf('\\') + 1, // Need to escape to allow for '\'
          path.lastIndexOf('.')
        );
  let dbSize: string;
  let createDB: string;

  // Send list of DBs, schema-name, tell front-end to switch tabs, tell front-end async-completed
  async function sendLists() {
    console.log('sendList');
    listObj = await db.getLists();
    // Send list of databases and tables, as well as database size to frontend.
    event.sender.send('db-lists', listObj, dbSize);
    // Send schema name back to frontend, so frontend can load tab name.
    event.sender.send('return-schema-name', dbName);
    // tell the front end to switch tabs to the newly created database
    event.sender.send('switch-to-new', null);
    // notify frontend that async process has been completed
    event.sender.send('async-complete');
    console.log('all events sent', dbSize);
  }

  // Create empty db & change current URI to match the newly created DB
  if (extension === '.sql' || extension === '.tar') {
    createDB = createDBFunc(dbName); // SQL Script is Returned
    const runCmd: string =
      extension === '.sql'
        ? runSQLFunc(dbName, filePath)
        : runTARFunc(dbName, filePath); // Return SQL Script

    // Change the URI to made DB, get DB size, import uploaded file, and send response back
    const importDB = () => {
      console.log('in db123');
      // Change current URI to match newly created DB
      db.changeDB(dbName);
      // DB query to get the database size
      db.query(`SELECT pg_size_pretty(pg_database_size('${dbName}'));`)
        .then((queryStats) => {
          dbSize = queryStats.rows[0].pg_size_pretty;
          console.log('DB Size is :', dbSize);
        })
        .then(() => {
          execute(runCmd, sendLists); // Pass in SQL Scipt to import SQL or TAR file and next func to execute};
        });
    };
    execute(createDB, importDB); // Pass in SQL Script to create DB and next func to execute
  } else
    console.log(
      'upload-file: Empty DB not created because of invalid file type.'
    );
});

interface SchemaType {
  schemaName: string;
  schemaFilePath: string[];
  schemaEntry: string;
  dbCopyName: string;
  copy: boolean;
}

// The following function creates an instance of database from pre-made .tar or .sql file.
// OR
// Listens for and handles DB copying events
ipcMain.on('input-schema', (event, data: SchemaType) => {
  // send notice to the frontend that async process has begun
  event.sender.send('async-started');

  const { schemaName: dbName, dbCopyName, copy } = data;
  let { schemaFilePath: filePath } = data;
  console.log(
    'channels line 169: ',
    'Schema name: ',
    data.schemaName,
    'data.schemaFilePath: ',
    data.schemaFilePath,
    'filepath: ',
    filePath,
    'dbCopyName: ',
    dbCopyName
  );

  // conditional to get the correct schemaFilePath name from the Load Schema Modal
  if (!data.schemaFilePath) {
    filePath = [`${data.schemaName}.sql`];
  } else {
    filePath = data.schemaFilePath;
  }
  // generate strings that are fed into execute functions later
  const createDB: string = createDBFunc(dbName);

  const runSQL: string = runSQLFunc(dbName, filePath);
  const runTAR: string = runTARFunc(dbName, filePath);
  const runFullCopy: string = runFullCopyFunc(dbCopyName, filePath);
  const runHollowCopy: string = runHollowCopyFunc(dbCopyName, filePath);

  // determine if the file is a sql or a tar file, in the case of a copy, we will not have a filepath so we just hard-code the extension to be sql
  let extension: string = '';
  if (filePath.length > 0) {
    extension = filePath[0].slice(filePath[0].lastIndexOf('.'));
  } else extension = '.sql';

  // SEQUENCE OF EXECUTING COMMANDS
  // Steps are in reverse order because each step is a callback function that requires the following step to be defined.

  // Step 5: Changes the pg URI to look to the newly created database and queries all the tables in that database and sends it to frontend.
  async function sendLists() {
    listObj = await db.getLists();

    event.sender.send('db-lists', listObj);
    // tell the front end to switch tabs to the newly created database
    event.sender.send('switch-to-new', null);
    // notify frontend that async process has been completed
    event.sender.send('async-complete');
  }

  // Step 4: Given the file path extension, run the appropriate command in postgres to build the db
  const step4 = () => {
    let runCmd: string = '';
    if (extension === '.sql') runCmd = runSQL;
    else if (extension === '.tar') runCmd = runTAR;
    execute(runCmd, sendLists);
  };

  // Step 3: Change the database you're referencing
  const step3Copy = () => {
    db.changeDB(dbName);
    return step4();
  };

  // Step 2: Change curent URI to match newly created DB
  const step2 = () => {
    // if we are copying
    if (copy !== undefined) {
      // first, we need to change the current DB instance to that of the one we need to copy, so we'll head to the changeDB function in the models file
      db.changeDB(dbCopyName);
      // now that our DB has been changed to the one we wish to copy, we need to either make an exact copy or a hollow copy using pg_dump OR pg_dump -s
      // this generates a pg_dump file from the specified db and saves it to a location in the container.
      // Full copy case
      if (copy) {
        execute(runFullCopy, step3Copy);
      }
      // Hollow copy case
      else execute(runHollowCopy, step3Copy);
    }

    // if we are not copying
    else {
      // change the current database back to the newly created one
      // and now that we have changed to the new db, we can move on to importing the data file
      db.changeDB(dbName);
      step4();
    }
  };

  // Step 1 : Create empty db
  execute(createDB, step2);
});

interface QueryType {
  queryCurrentSchema: string;
  queryString: string;
  queryLabel: string;
  queryData: string;
  queryStatistics: string;
}

ipcMain.on('execute-query-untracked', (event, data: QueryType) => {
  // send notice to front end that query has been started
  event.sender.send('async-started');

  // destructure object from frontend
  const { queryString } = data;

  // run query on db
  db.query(queryString)
    .then(() => {
      (async function getListAsync() {
        listObj = await db.getLists();
        event.sender.send('db-lists', listObj);
        event.sender.send('async-complete');
      })();
    })
    .catch((error: string) => {
      console.log(
        'channels line 284: ERROR in execute-query-untracked channel in main.ts',
        error
      );
      event.sender.send('query-error', 'Error executing query.');
    });
});

// Listen for queries being sent from renderer
ipcMain.on('execute-query-tracked', (event, data: QueryType) => {
  // send notice to front end that query has been started
  event.sender.send('async-started');

  // destructure object from frontend
  const { queryString, queryCurrentSchema, queryLabel } = data;

  // initialize object to store all data to send to frontend
  const frontendData = {
    queryString,
    queryCurrentSchema,
    queryLabel,
    queryData: '',
    queryStatistics: '',
    lists: {},
  };

  // Run select * from actors;
  db.query(queryString)
    .then((queryData) => {
      frontendData.queryData = queryData.rows;
      if (!queryString.match(/create/i)) {
        // Run EXPLAIN (FORMAT JSON, ANALYZE)
        db.query(`EXPLAIN (FORMAT JSON, ANALYZE) ${queryString}`).then(
          (queryStats) => {
            frontendData.queryStatistics = queryStats.rows;

            (async function getListAsync() {
              listObj = await db.getLists();
              frontendData.lists = listObj;
              event.sender.send('db-lists', listObj);
              event.sender.send('return-execute-query', frontendData);
              event.sender.send('async-complete');
            })();
          }
        );
      } else {
        // Handling for tracking a create table query, can't run explain/analyze on create statements
        (async function getListAsync() {
          listObj = await db.getLists();
          frontendData.lists = listObj;
          event.sender.send('db-lists', listObj);
          event.sender.send('async-complete');
        })();
      }
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
  const dummyDataRequest: dummyDataRequestType = data;
  let tableMatricesArray: any;
  let keyObject: any = 'Unresolved';

  db.createKeyObject().then((result) => {
    // set keyObject equal to the result of this query
    keyObject = result;
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
