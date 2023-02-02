/* eslint-disable object-shorthand */
import { DBType } from './BE_types';
const { exec } = require('child_process'); // Child_Process: Importing Node.js' child_process API
const { dialog } = require('electron'); // Dialog: display native system dialogs for opening and saving files, alerting, etcim
const docConfig = require('./_documentsConfig')
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
const SQL_data = docConfig.getFullConfig();

const helperFunctions: HelperFunctions = {
  // create a database
  createDBFunc: function (name, dbType: DBType) {
    const PG = `CREATE DATABASE "${name}"`;
    const MYSQL = `CREATE DATABASE ${name}`;

    console.log('RETURNING DB: ', DBType.Postgres ? PG : MYSQL);
    console.log(dbType);

    return dbType === DBType.Postgres ? PG : MYSQL;
  },

  // drop provided database
  dropDBFunc: function (dbName, dbType: DBType) {
    const PG = `DROP DATABASE "${dbName}"`;
    const MYSQL = `DROP DATABASE ${dbName}`;

    console.log(`dropDBFunc MySQL: ${MYSQL}, ${dbType}`);
    console.log(`dropDBFunc PG: ${MYSQL}, ${dbType}`);

    return dbType === DBType.Postgres ? PG : MYSQL;
  },

  // run explain on query
  explainQuery: function (sqlString, dbType: DBType) {
    const PG = `BEGIN; EXPLAIN (FORMAT JSON, ANALYZE, VERBOSE, BUFFERS) ${sqlString}; ROLLBACK`;
    const MYSQL = `BEGIN; EXPLAIN ANALYZE ${sqlString}`;

    console.log(`explainQuery MySQL: ${MYSQL}, ${dbType}`);
    console.log(`explainQuery PG: ${MYSQL}, ${dbType}`);

    return dbType === DBType.Postgres ? PG : MYSQL;
  },

  // import SQL file into new DB created
  runSQLFunc: function (dbName, file, dbType: DBType) {
    const SQL_data = docConfig.getFullConfig();
    console.log(SQL_data)
    const PG = `PGPASSWORD=${SQL_data.pg_pass} psql -U ${SQL_data.pg_user} -d "${dbName}" -f "${file}" -p ${SQL_data.pg_port}`;
    // const MYSQL = `mysql -u root -p ${dbName} < ${file}`;
    const MYSQL = `mysql -uroot -p; use ${dbName}; source ${file}`;

    console.log(`runSQLFunc MySQL: ${MYSQL}, ${dbType}`);
    console.log(`runSQLFunc PG: ${PG}, ${dbType}`);

    return dbType === DBType.Postgres ? PG : MYSQL;
  },

  // import TAR file into new DB created
  runTARFunc: function (dbName, file, dbType: DBType) {
    const SQL_data = docConfig.getFullConfig();
    const PG = `PGPASSWORD=${SQL_data.pg_pass} pg_restore -U ${SQL_data.pg_user} -p ${SQL_data.pg_port} -d "${dbName}" "${file}" `;
    const MYSQL = `mysqldump -u root -p ${dbName} > ${file}`;

    console.log(`runTARFunc MySQL: ${MYSQL}, ${dbType}`);
    console.log(`runTARFunc PG: ${PG}, ${dbType}`);

    return dbType === DBType.Postgres ? PG : MYSQL;
  },

  // make a full copy of the schema
  runFullCopyFunc: function (dbCopyName, newFile, dbType: DBType) {
    const SQL_data = docConfig.getFullConfig();
    const PG = `PGPASSWORD=${SQL_data.pg_pass} pg_dump -U ${SQL_data.pg_user} -F p -d "${dbCopyName}" > "${newFile}"`;
    const MYSQL = `mysqldump -h localhost -u root -p --no-data ${dbCopyName} > ${newFile}`;

    console.log(`runFullCopyFunc MySQL: ${MYSQL}, ${dbType}`);
    console.log(`runFullCopyFunc PG: ${PG}, ${dbType}`);

    return dbType === DBType.Postgres ? PG : MYSQL;
  },

  // make a hollow copy of the schema
  runHollowCopyFunc: function (dbCopyName, file, dbType: DBType) {
    const SQL_data = docConfig.getFullConfig();
    const PG = `PGPASSWORD=${SQL_data.pg_pass} pg_dump -s -U ${SQL_data.pg_user} -F p -d "${dbCopyName}" > "${file}"`;
    const MYSQL = `mysqldump -h localhost -u root -p --no-data ${dbCopyName} > ${file}`;

    console.log(`runHollowCopyFunc MySQL: ${MYSQL}, ${dbType}`);
    console.log(`runHollowCopyFunc PG: ${PG}, ${dbType}`);

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
