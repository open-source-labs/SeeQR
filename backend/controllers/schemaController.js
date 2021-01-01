const db = require('../models');
const { exec } = require('child_process');

/************************************************************
 *********************** Helper functions *******************
 ************************************************************/

// Generate CLI commands to be executed in child process.

const createDBFunc = (name) => {
  return `psql -U postgres -c "CREATE DATABASE ${name}"`;
  //return `docker exec postgres-1 psql -h localhost -p 5432 -U postgres -c "CREATE DATABASE ${name}"`;
};


const runSQLFunc = (dbName, file) => {
  return `psql -U postgres -d ${dbName} -f ${file}`; // replaced /data_dump with ${file};
};

const runTARFunc = (dbName, file) => {
  return `pg_restore -U postgres -d ${dbName} -f ${file}`; // replaced /data_dump with ${file}`;
};

const runFullCopyFunc = (dbCopyName, file) => {
  let newFile = file[0];
  return `pg_dump -U postgres -d ${dbCopyName} -f ${newFile}`;
};

const runHollowCopyFunc = (dbCopyName, file) => {
  return `pg_dump -s -U postgres ${dbCopyName} -f ${file}`; // replaced /data_dump with ${file}`;
};

// Function to execute commands in the child process.
const execute = (str: string, nextStep: any, errorStep?: any) => {
  exec(str, (error, stdout, stderr) => {
    if (error) {
      //this shows the console error in an error message on the frontend
      dialog.showErrorBox(`${error.message}`, '');
      console.log(`error: ${error.message}`);
      errorStep();
      return;
    }
    if (stderr) {
      //this shows the console error in an error message on the frontend
      dialog.showErrorBox(`${stderr}`, '');
      return;
    }

    if (nextStep) nextStep();
  });
};

const schemaController = {};

schemaController.skipFileUpload = (req, res, next) {

	next();

};

schemaController.uploadFile = (req, res, next) {

  const { filePath } = req.body;
  event.sender.send('async-started');

  let dbName;

  if (process.platform === 'darwin') {
    dbName = filePath[0].slice(
      filePath[0].lastIndexOf('/') + 1,
      filePath[0].lastIndexOf('.')
    );
  } else {
    dbName = filePath[0].slice(
      filePath[0].lastIndexOf('\\') + 1,
      filePath[0].lastIndexOf('.')
    );
  }

  const createDB: string = createDBFunc(dbName);

  const runSQL: string = runSQLFunc(dbName, filePath); 
  const runTAR: string = runTARFunc(dbName, filePath); 
  const extension: string = filePath[0].slice(filePath[0].lastIndexOf('.'));
  let dbSize: string;

  // SEQUENCE OF EXECUTING COMMANDS
  // Steps are in reverse order because each step is a callback function that requires the following step to be defined.

  // Step 5: Changes the pg URI the newly created database, queries new database, then sends list of tables and list of databases to frontend.
  async function sendLists() {
    listObj = await db.getLists();
    // Send list of databases and tables, as well as database size to frontend.
    event.sender.send('db-lists', listObj, dbSize);
    // Send schema name back to frontend, so frontend can load tab name.
    event.sender.send('return-schema-name', dbName);
    // tell the front end to switch tabs to the newly created database
    event.sender.send('switch-to-new', null);
    // notify frontend that async process has been completed
    event.sender.send('async-complete');
  }

  // Step 4: Given the file path extension, run the appropriate command in postgres to populate db.
  const step4 = () => {
    let runCmd: string = '';
    if (extension === '.sql') runCmd = runSQL;
    else if (extension === '.tar') runCmd = runTAR;
    execute(runCmd, sendLists, () => event.sender.send('async-complete'));

    // DB query to get the database size
    db.query(`SELECT pg_size_pretty(pg_database_size('${dbName}'));`).then(
      (queryStats) => {
        dbSize = queryStats.rows[0].pg_size_pretty;
      }
    );
  };

  // Step 3: Import database file from file path into docker container
  // Edit: We changed the functionality to create a file on the local machine instead of adding it to the docker container
  // const step3 = () => execute(importFile, step4);

  // Step 2: Change current URI to match newly created DB
  const step2 = () => {
    db.changeDB(dbName);
    return step4(); //changing step3 to step4 to test removal of importFile func
  };

  // Step 1: Create empty db
  if (extension === '.sql' || extension === '.tar') execute(createDB, step2, () => event.sender.send('async-complete'));
  else console.log('INVALID FILE TYPE: Please use .tar or .sql extensions.');

	// next();

};

schemaController.inputSchema = (req, res, next) {
  event.sender.send('async-started');

  const { schemaName: dbName, dbCopyName, copy } = req.body;
  let { schemaFilePath: filePath } = req.body;
  filePath = [data.schemaName + '.sql'];
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
    execute(runCmd, sendLists, () => event.sender.send('async-complete'));
  };

  // Step 3: Import database file from file path into docker container

  //const step3 = () => execute(importFile, step4);

  // skip step three which is only for importing files and instead change the current db to the newly created one
  const step3Copy = () => {
    db.changeDB(dbName);
    return step4();
  };

  // Step 2: Change current URI to match newly created DB
  const step2 = () => {
    // if we are copying
    if (copy !== undefined) {
      // first, we need to change the current DB instance to that of the one we need to copy, so we'll head to the changeDB function in the models file
      db.changeDB(dbCopyName);
      // now that our DB has been changed to the one we wish to copy, we need to either make an exact copy or a hollow copy using pg_dump OR pg_dump -s
      // this generates a pg_dump file from the specified db and saves it to a location in the container.
      // Full copy case
      if (copy) {
        execute(runFullCopy, step3Copy, () => event.sender.send('async-complete'));
      }
      // Hollow copy case
      else execute(runHollowCopy, step3Copy, () => event.sender.send('async-complete'));
      return;
    }
    // if we are not copying
    else {
      // change the current database back to the newly created one
      // and now that we have changed to the new db, we can move on to importing the data file
      db.changeDB(dbName);
      return step4(); //changing step3 to step4 to test removal of importFile func
    }
  };

  // Step 1 : Create empty db
  execute(createDB, step2, () => event.sender.send('async-complete'));

	// next();

};


module.exports = schemaController;