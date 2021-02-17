const { exec } = require('child_process'); // Dialog: display native system dialogs for opening and saving files, alerting, etc
const { dialog } = require('electron'); // Child_Process: Importing Node.js' child_process API

// ************************************** CLI COMMANDS TO CREATE, DELETE, COPY DB SCHEMA, etc. **************************************

// Generate CLI commands to be executed in child process.
// The electron app will access your terminal to execute these postgres commands via execute function

const helperFunctions: {
  createDBFunc: Function;
  dropDBFunc: Function;
  runSQLFunc: Function;
  runTARFunc: Function;
  runFullCopyFunc: Function;
  runHollowCopyFunc: Function;
  execute: Function;
  promExecute: (cmd: string) => Promise<{ stdout: string; stderr: string }>;
} = {
  // create a database
  createDBFunc: (name) => `CREATE DATABASE "${name}"`,

  // drop provided database
  dropDBFunc: (dbName) => `DROP DATABASE "${dbName}"`,

  // import SQL file into new DB created
  runSQLFunc: (dbName, file) => `psql -U postgres -d ${dbName} -f "${file}"`,

  // import TAR file into new DB created
  runTARFunc: (dbName, file) => `pg_restore -U postgres -d ${dbName} "${file}"`,

  // make a full copy of the schema
  runFullCopyFunc: (dbCopyName, newFile) =>
    `pg_dump -U postgres -F p -d ${dbCopyName} > "${newFile}"`,

  // make a hollow copy of the schema
  runHollowCopyFunc: (dbCopyName, file) =>
    `pg_dump -s -U postgres -F p -d ${dbCopyName} > "${file}"`,


  // Function to execute commands in the child process.
  execute: (str: string, nextStep: any) => {
    console.log('in execute: ', str);
    exec(str, (error, stdout, stderr) => {
      console.log('channels line 43 exec func: ', str); // , `${stdout}`);
      if (error) {
        // this shows the console error in an error message on the frontend
        console.log(`channels line 47 error: ${error.message}`);
        dialog.showErrorBox(`${error.message}`, '');
      } else if (stderr) {
        // this shows the console error in an error message on the frontend
        console.log(`channels line 53 stderr: ${stderr}`);
        dialog.showErrorBox(`${stderr}`, '');
      } else nextStep();
    });
  },

  // promisified execute
  promExecute: (cmd: string) =>
    new Promise((resolve, reject) => {
      exec(cmd, (error, stdout, stderr) => {
        if (error) return reject(error);
        if (stderr) return reject(new Error(stderr));
        return resolve({ stdout, stderr });
      });
    }),
};

module.exports = helperFunctions;
