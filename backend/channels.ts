// Import parts of electron to use
import { dialog, ipcMain } from 'electron';
import { create } from 'domain';

const { generateDummyData, writeCSVFile } = require('./newDummyD/dummyDataMain');
const { exec } = require('child_process');
const db = require('./models');
const path = require('path');

/************************************************************
 *********************** IPC CHANNELS ***********************
 ************************************************************/

// Global variable to store list of databases and tables to provide to frontend upon refreshing view.
let listObj;

ipcMain.on('return-db-list', (event, args) => {
  db.getLists().then(data => event.sender.send('db-lists', data));
});

// Listen for skip button on Splash page.
ipcMain.on('skip-file-upload', (event) => { });

// Listen for database changes sent from the renderer upon changing tabs.
ipcMain.on('change-db', (event, dbName) => {
  db.changeDB(dbName)
});

// Generate CLI commands to be executed in child process.
const createDBFunc = (name) => {
  return `docker exec postgres-1 psql -h localhost -p 5432 -U postgres -c "CREATE DATABASE ${name}"`
}

const importFileFunc = (file) => {
  return `docker cp ${file} postgres-1:/data_dump`;
}

//this command imports CSV file to dummy data volume
const importCSV = (file) => {
  return `docker cp ${file} dummy-data:/csv_files`;
}

const runSQLFunc = (file) => {
  return `docker exec postgres-1 psql -U postgres -d ${file} -f /data_dump`;
}

const runTARFunc = (file) => {
  return `docker exec postgres-1 pg_restore -U postgres -d ${file} /data_dump`;
}

// Function to execute commands in the child process.
const execute = (str: string, nextStep: any) => {
  exec(str, (error, stdout, stderr) => {
    if (error) {
      //this shows the console error in an error message on the frontend
      dialog.showErrorBox(`${error.message}`, '');
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      //this shows the console error in an error message on the frontend
      dialog.showErrorBox(`${stderr}`, '');
      console.log(`stderr: ${stderr}`);
      return;
    }
    console.log(`${stdout}`);
    if (nextStep) nextStep();
    //this shows the console error in an error message on the frontend
    else dialog.showErrorBox('Success', '');
  });
};

// Listen for file upload. Create an instance of database from pre-made .tar or .sql file.
ipcMain.on('upload-file', (event, filePath: string) => {
  let dbName: string;
  if (process.platform === 'darwin') {
    dbName = filePath[0].slice(filePath[0].lastIndexOf('/') + 1, filePath[0].lastIndexOf('.'));
  } else {
    dbName = filePath[0].slice(filePath[0].lastIndexOf('\\') + 1, filePath[0].lastIndexOf('.'));
  }

  const createDB: string = createDBFunc(dbName);
  const importFile: string = importFileFunc(filePath);
  const runSQL: string = runSQLFunc(dbName);
  const runTAR: string = runTARFunc(dbName);
  const extension: string = filePath[0].slice(filePath[0].lastIndexOf('.'));

  // SEQUENCE OF EXECUTING COMMANDS
  // Steps are in reverse order because each step is a callback function that requires the following step to be defined.

  // Step 5: Changes the pg URI the newly created database, queries new database, then sends list of tables and list of databases to frontend.
  async function sendLists() {
    listObj = await db.getLists();
    console.log('channels: ', listObj);
    event.sender.send('db-lists', listObj);
    // Send schema name back to frontend, so frontend can load tab name.
    event.sender.send('return-schema-name', dbName);
    // tell the front end to switch tabs to the newly created database
    event.sender.send('switch-to-new', null);
  };

  // Step 4: Given the file path extension, run the appropriate command in postgres to populate db.
  const step4 = () => {
    let runCmd: string = '';
    if (extension === '.sql') runCmd = runSQL;
    else if (extension === '.tar') runCmd = runTAR;
    execute(runCmd, sendLists);
  };

  // Step 3: Import database file from file path into docker container
  const step3 = () => execute(importFile, step4);

  // Step 2: Change curent URI to match newly created DB
  const step2 = () => {
    db.changeDB(dbName);
    return step3();
  }

  // Step 1: Create empty db
  if (extension === '.sql' || extension === '.tar') execute(createDB, step2);
  else console.log('INVALID FILE TYPE: Please use .tar or .sql extensions.');
});

interface SchemaType {
  schemaName: string;
  schemaFilePath: string[];
  schemaEntry: string;
  dbCopyName: string;
  copy: boolean;
}

// Listen for schema edits (via file upload OR via CodeMirror inout) from schemaModal. Create an instance of database from pre-made .tar or .sql file.
// AND
// Listen for and handle DB copying events
ipcMain.on('input-schema', (event, data: SchemaType) => {

  const { schemaName: dbName, schemaEntry, dbCopyName, copy } = data;
  let { schemaFilePath: filePath } = data;

  if (copy !== undefined) {
  // first, we need to change the current DB instance to that of the one we need to copy, so we'll head to the changeDB function in the models file
  db.changeDB(dbCopyName);
  // now that our DB has been changed to the one we wish to copy, we need to either make an exact copy or a hollow copy using pg_dump OR pg_dump -s followed by pg_restore

  // reset file path such that it points to our newly created local .sql file
  filePath = [path.join(__dirname, `./${dbName}.sql`)];

  // this generates a pg_dump file from the specified db and saves it to a location in the container
  if(copy) {
    console.log('in copy if statement');
    execute(`docker exec postgres-1 pg_dump -U postgres ${dbCopyName} -f /data_dump`, null);
  }
  // Hollow copy
  else execute(`docker exec postgres-1 pg_dump -s -U postgres ${dbCopyName} -f /data_dump`, null)
  }

  console.log(dbName, schemaEntry, dbCopyName, copy, filePath);

  // Using RegEx to remove line breaks to ensure data.schemaEntry is being run as one large string
  // so that schemaEntry string will work for Windows computers.
  let trimSchemaEntry = schemaEntry.replace(/[\n\r]/g, "").trim();

  const createDB: string = createDBFunc(dbName);
  const importFile: string = importFileFunc(filePath);
  const runSQL: string = runSQLFunc(dbName);
  const runTAR: string = runTARFunc(dbName);

  const runScript: string = `docker exec postgres-1 psql -U postgres -d ${dbName} -c "${trimSchemaEntry}"`;
  let extension: string = '';
  if (filePath.length > 0) {
    extension = filePath[0].slice(filePath[0].lastIndexOf('.'));
  }

  // SEQUENCE OF EXECUTING COMMANDS
  // Steps are in reverse order because each step is a callback function that requires the following step to be defined.

  // Step 5: Changes the pg URI to look to the newly created database and queries all the tables in that database and sends it to frontend.
  async function sendLists() {
    listObj = await db.getLists();
    event.sender.send('db-lists', listObj);
    // tell the front end to switch tabs to the newly created database
    event.sender.send('switch-to-new', null);
  };

  // Step 4: Given the file path extension, run the appropriate command in postgres to build the db
  const step4 = () => {
    let runCmd: string = '';
    if (extension === '.sql') runCmd = runSQL;
    else if (extension === '.tar') runCmd = runTAR;
    else runCmd = runScript;
    execute(runCmd, sendLists);
  };

  // Step 3: Import database file from file path into docker container
  const step3 = () => execute(importFile, step4);

  // Step 2: Change curent URI to match newly created DB
  const step2 = () => {
    db.changeDB(dbName);
    if (copy) return step4();
    else return step3();
  }

  // Step 1 : Create empty db
  if (extension === '.sql' || extension === '.tar') execute(createDB, step2);
  // if data is inputted as text
  else execute(createDB, step3);
});

interface QueryType {
  queryCurrentSchema: string;
  queryString: string;
  queryLabel: string;
  queryData: string;
  queryStatistics: string;
}

ipcMain.on('execute-query-untracked', (event, data: QueryType) => {
  console.log('execute query untracked');
  // destructure object from frontend
  const { queryString, queryCurrentSchema, queryLabel } = data;
  // run query on db
  db.query(queryString)
    .catch((error: string) => {
      console.log('ERROR in execute-query-untracked channel in main.ts', error);
    });
});

// Listen for queries being sent from renderer
ipcMain.on('execute-query-tracked', (event, data: QueryType) => {
  // destructure object from frontend
  const { queryString, queryCurrentSchema, queryLabel } = data;

  // initialize object to store all data to send to frontend
  let frontendData = {
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

      // Run EXPLAIN (FORMAT JSON, ANALYZE)
      db.query('EXPLAIN (FORMAT JSON, ANALYZE) ' + queryString).then((queryStats) => {
        frontendData.queryStatistics = queryStats.rows;

        (async function getListAsync() {
          listObj = await db.getLists();
          frontendData.lists = listObj;
          event.sender.send('db-lists', listObj)
          event.sender.send('return-execute-query', frontendData);
        })();
      });
    })
    .catch((error: string) => {
      console.log('ERROR in execute-query-tracked channel in main.ts', error);
    });
});

interface dummyDataRequest {
  schemaName: string;
  dummyData: {};
}

ipcMain.on('generate-dummy-data', (event: any, data: dummyDataRequest) => {
  let schemaLayout;
  let dummyDataRequest = data;
  let tableMatricesArray;
  db.getSchemaLayout()
  .then((result) => {
    schemaLayout = result;
  })
  .then(() => {
    // generate the dummy data and save it into matrices associated with table names
    tableMatricesArray = generateDummyData(schemaLayout, dummyDataRequest);
  })
  .then(() => {
    let csvPromiseArray: any = [];
    //iterate through tableMatricesArray to write individual .csv files
    for (const tableObject of tableMatricesArray) {
      // extract tableName from tableObject
      let tableName: string = tableObject.tableName;
      //mapping column headers from getColumnObjects in models.ts to columnNames
      let columnArray: string[] = schemaLayout.tables[tableName].map(columnObj => columnObj.columnName)
      //write all entries in tableMatrix to csv file
      csvPromiseArray.push(writeCSVFile(tableObject.data, tableName, columnArray));
    }
    Promise.all(csvPromiseArray)
    .then(() => {
      //iterate through tableMatricesArray to copy individual .csv files to the respective tables
      for (const tableObject of tableMatricesArray) {
        // extract tableName from tableObject
        let tableName: string = tableObject.tableName;
        // generate a query for each table, copying from the file generated previously
        let queryString: string = `COPY ${tableName} FROM '/${tableName}' WITH CSV HEADER;`;
        // run the query in the container using a docker command
        execute(`docker exec postgres-1 psql -U postgres -d ${data.schemaName} -c "${queryString}" `, null);
      }
    })
  })
  
})

export default execute;
