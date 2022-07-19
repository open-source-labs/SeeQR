const { exec } = require('child_process'); // Child_Process: Importing Node.js' child_process API
const { dialog } = require('electron'); // Dialog: display native system dialogs for opening and saving files, alerting, etc
import { DBType } from './BE_types';
// ************************************** CLI COMMANDS & SQL Queries TO CREATE, DELETE, COPY DB SCHEMA, etc. ************************************** //

// Generate SQL queries & CLI commands to be executed in pg and child process respectively
// The electron app will access your terminal to execute the postgres commands via Node's execute function

interface CreateSQLQuery {
  (string: string, dbType: DBType): string;
}
interface CreateCommand {
  (dbName: string, file: string, dbType: DBType): string;
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
  createDBFunc: function (name, dbType: DBType) { 
    return `CREATE DATABASE "${name}"`;
},

  // drop provided database
  dropDBFunc: function (dbName, dbType: DBType) {
    return `DROP DATABASE "${dbName}"`;
  },

  // run explain on query
  explainQuery: function (sqlString, dbType: DBType) {
     return `BEGIN; EXPLAIN (FORMAT JSON, ANALYZE, VERBOSE, BUFFERS) ${sqlString}; ROLLBACK;`;
  },

  // import SQL file into new DB created
  runSQLFunc: function (dbName, file, dbType: DBType){
    return `psql -U postgres -d ${dbName} -f "${file}"`;
  },

  // import TAR file into new DB created
  runTARFunc: function (dbName, file, dbType: DBType) {
    return `pg_restore -U postgres -d ${dbName} "${file}"`
  },

  // make a full copy of the schema
  runFullCopyFunc: function (dbCopyName, newFile, dbType: DBType) {
    return `pg_dump -U postgres -F p -d ${dbCopyName} > "${newFile}"`
  },

  // make a hollow copy of the schema
  runHollowCopyFunc: function (dbCopyName, file, dbType: DBType) {
    return  `pg_dump -s -U postgres -F p -d ${dbCopyName} > "${file}"`
  },

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
