const { exec } = require('child_process'); // Dialog: display native system dialogs for opening and saving files, alerting, etc
const { dialog } = require('electron'); // Child_Process: Importing Node.js' child_process API

// ************************************** CLI COMMANDS & SQL Queries TO CREATE, DELETE, COPY DB SCHEMA, etc. ************************************** //

// Generate CLI commands & SQL queries to be executed in child process and pg respectively
// The electron app will access your terminal to execute the postgres commands via the execute function

interface CreateSQLQuery {
  (string: string): string;
}
interface CreateCommand {
  (dbName: string, file: string): string;
}
interface HelperFunctions {
  createDBFunc: CreateSQLQuery;
  dropDBFunc: CreateSQLQuery;
  explainQuery: CreateSQLQuery;
  runSQLFunc: CreateCommand;
  runTARFunc: CreateCommand;
  runFullCopyFunc: CreateCommand;
  runHollowCopyFunc: CreateCommand;
  promExecute: (cmd: string) => Promise<{ stdout: string; stderr: string }>;
}
const helperFunctions:HelperFunctions = {
  // create a database
  createDBFunc: (name) => `CREATE DATABASE "${name}"`,

  // drop provided database
  dropDBFunc: (dbName) => `DROP DATABASE "${dbName}"`,

  // run explain on query
  explainQuery: (sqlString) => `BEGIN; EXPLAIN (FORMAT JSON, ANALYZE, VERBOSE, BUFFERS) ${sqlString}; ROLLBACK;`,

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

  // promisified execute to execute commands in the child process
  promExecute: (cmd: string) =>
    new Promise((resolve, reject) => {
      exec(cmd, (error, stdout, stderr) => {
        if (error) return reject(error);
        if (stderr) return reject(new Error(stderr));
        return resolve({ stdout, stderr });
      });
    }),
};

export default helperFunctions;
