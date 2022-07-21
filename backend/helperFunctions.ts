/* eslint-disable object-shorthand */
import { DBType } from './BE_types';
const { exec } = require('child_process'); // Child_Process: Importing Node.js' child_process API
const { dialog } = require('electron'); // Dialog: display native system dialogs for opening and saving files, alerting, etc
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
// PG = Postgres - Query necessary to run PG Query/Command
// MYSQL = MySQL - Query necessary to run MySQL Query/Command
const helperFunctions: HelperFunctions = {
  // create a database

  createDBFunc: function (name, dbType: DBType) {
    const PG = `CREATE DATABASE "${name}"`;
    // might need to use the USE keyword after creating database
    const MYSQL = `CREATE DATABASE "${name}"`;
    // const mySQLUse = `USE DATABASE "${name}"`;

    return dbType === DBType.Postgres ? PG : MYSQL;
    // if (dbType === DBType.Postgres) {
    //   return `CREATE DATABASE "${name}"`;
    // }
    // if (dbType === DBType.MySQL) {
    //   return `CREATE DATABASE "${name}"`;
  },

  // drop provided database
  dropDBFunc: function (dbName, dbType: DBType) {
    const PG = `DROP DATABASE "${dbName}"`;
    const MYSQL = `DROP DATABASE "${dbName}"`;

    return dbType === DBType.Postgres ? PG : MYSQL;
    // return `DROP DATABASE "${dbName}"`;
  },

  // run explain on query
  explainQuery: function (sqlString, dbType: DBType) {
    const PG = `BEGIN; EXPLAIN (FORMAT JSON, ANALYZE, VERBOSE, BUFFERS) "${sqlString}"; ROLLBACK;`;

    // this should work but is limited to only select, update, delete and table statements
    const MYSQL = `EXPLAIN FORMAT=JSON ${sqlString}`;

    return dbType === DBType.Postgres ? PG : MYSQL;
    // return `BEGIN; EXPLAIN (FORMAT JSON, ANALYZE, VERBOSE, BUFFERS) ${sqlString}; ROLLBACK;`;
  },

  // import SQL file into new DB created
  runSQLFunc: function (dbName, file, dbType: DBType) {
    const PG = `psql -U postgres -d "${dbName}" -f "${file}"`;
    // need variable to store username. Typed into comamnd line but none of options below worked for me.

    const MYSQL = `mysql -u username -p "${dbName}" < "${file}"`;
    // -u root -p DATABASENAME < FILETOBEIMPORTED.sql;
    // mysql -u root -p"Hello123!" dish < ~/Desktop/mysqlsamp.sql
    // SET autocommit=0 ; source d /Users/fryer/Downloads/mysqlsamp.sql  ; COMMIT ;

    return dbType === DBType.Postgres ? PG : MYSQL;
  },

  // import TAR file into new DB created
  runTARFunc: function (dbName, file, dbType: DBType) {
    const PG = `pg_restore -U postgres -d "${dbName}" "${file}"`;
    const MYSQL = `mysqldump -u username -p "${dbName}" > "${file}"`;

    return dbType === DBType.Postgres ? PG : MYSQL;
  },

  // make a full copy of the schema
  runFullCopyFunc: function (dbCopyName, newFile, dbType: DBType) {
    return `pg_dump -U postgres -F p -d "${dbCopyName}" > "${newFile}"`;
  },

  // make a hollow copy of the schema
  runHollowCopyFunc: function (dbCopyName, file, dbType: DBType) {
    const PG = `pg_dump -s -U postgres -F p -d "${dbCopyName}" > "${file}"`;
    const MYSQL = `mysqldump -h localhost -u root -p --no-data "${dbCopyName}" > "${file}"`;

    return dbType === DBType.Postgres ? PG : MYSQL;
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
