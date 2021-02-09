/* eslint-disable no-unused-expressions */
const { exec } = require('child_process');
const { dialog } = require('electron');

// ************************************** CLI COMMANDS TO CREATE, DELETE, COPY DB SCHEMA **************************************

// Generate CLI commands to be executed in child process.
// The electron app will access your terminal to execute these postgres commands

let helperFunctions: {
  createDBFunc: Function;
  runSQLFunc: Function;
  runTARFunc: Function;
  runFullCopyFunc: Function;
  runHollowCopyFunc: Function;
  execute: Function;
};

// eslint-disable-next-line prefer-const
helperFunctions = {
  // create a database
  createDBFunc: (name) => {
    console.log('function createDBFunc just ran');
    return `psql -U postgres -c "CREATE DATABASE ${name}"`;
  },

  // import SQL file into new DB created
  runSQLFunc: (dbName, file) => `psql -U postgres -d ${dbName} -f ${file}`,

  // import TAR file into new DB created
  runTARFunc: (dbName, file) =>
    `pg_restore -U postgres -d ${dbName} -f ${file}`,

  // make a full copy of the schema
  runFullCopyFunc: (dbCopyName, file) => {
    const newFile = file[0];
    return `pg_dump -U postgres -d ${dbCopyName} -f ${newFile}`;
  },

  // make a hollow copy of the schema
  runHollowCopyFunc: (dbCopyName, file) =>
    `pg_dump -s -U postgres ${dbCopyName} -f ${file}`,

  // Function to execute commands in the child process.
  execute: (str: string, nextStep: any) => {
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
  },
};

module.exports = helperFunctions;
