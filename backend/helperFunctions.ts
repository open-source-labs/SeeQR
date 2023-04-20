/* eslint-disable object-shorthand */
import { DBType } from './BE_types';

const { exec } = require('child_process'); // Child_Process: Importing Node.js' child_process API
const docConfig = require('./_documentsConfig');
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
  createDBFunc: function createDBFunc(name, dbType: DBType) {
    const PG = `CREATE DATABASE "${name}"`;
    const MYSQL = `CREATE DATABASE ${name}`;
    return dbType === DBType.Postgres || dbType === DBType.RDSPostgres
      ? PG
      : MYSQL;
  },

  // drop provided database
  dropDBFunc: function dropDBFunc(dbName, dbType: DBType) {
    const PG = `DROP DATABASE "${dbName}"`;
    const MYSQL = `DROP DATABASE ${dbName}`;
    return dbType === DBType.Postgres || dbType === DBType.RDSPostgres
      ? PG
      : MYSQL;
  },

  // run explain on query
  explainQuery: function explainQuery(sqlString, dbType: DBType) {
    const PG = `BEGIN; EXPLAIN (FORMAT JSON, ANALYZE, VERBOSE, BUFFERS) ${sqlString}; ROLLBACK`;
    const MYSQL = `BEGIN; EXPLAIN ANALYZE ${sqlString}`;
    return dbType === DBType.Postgres || dbType === DBType.RDSPostgres
      ? PG
      : MYSQL;
  },

  // import SQL file into new DB created
  runSQLFunc: function runSQLFunc(dbName, file, dbType: DBType) {
    const SQL_data = docConfig.getFullConfig();
    const PG = `PGPASSWORD=${SQL_data.pg.password} psql -U ${SQL_data.pg.user} -d "${dbName}" -f "${file}" -p ${SQL_data.pg.port}`;
    const MYSQL = `export MYSQL_PWD='${SQL_data.mysql.password}'; mysql -u${SQL_data.mysql.user} --port=${SQL_data.mysql.port} ${dbName} < ${file}`;
    return dbType === DBType.Postgres || dbType === DBType.RDSPostgres
      ? PG
      : MYSQL;
  },

  // import TAR file into new DB created
  runTARFunc: function runTARFunc(dbName, file, dbType: DBType) {
    const SQL_data = docConfig.getFullConfig();
    const PG = `PGPASSWORD=${SQL_data.pg.password} pg_restore -U ${SQL_data.pg.user} -p ${SQL_data.pg.port} -d "${dbName}" "${file}" `;
    const MYSQL = `export MYSQL_PWD='${SQL_data.mysql.password}'; mysqldump -u ${SQL_data.mysql.user} --port=${SQL_data.mysql.port}  ${dbName} > ${file}`;
    return dbType === DBType.Postgres || dbType === DBType.RDSPostgres
      ? PG
      : MYSQL;
  },

  // make a full copy of the schema
  runFullCopyFunc: function runFullCopyFunc(
    dbCopyName,
    newFile,
    dbType: DBType
  ) {
    const SQL_data = docConfig.getFullConfig();
    const PG = `PGPASSWORD=${SQL_data.pg.password} pg_dump -s -U ${SQL_data.pg.user}  -p ${SQL_data.pg.port} -Fp -d ${dbCopyName} > "${newFile}"`;
    const MYSQL = `export MYSQL_PWD='${SQL_data.mysql.password}'; mysqldump -h localhost -u ${SQL_data.mysql.user}  ${dbCopyName} > ${newFile}`;
    return dbType === DBType.Postgres || dbType === DBType.RDSPostgres
      ? PG
      : MYSQL;
  },

  // make a hollow copy of the schema
  runHollowCopyFunc: function runHollowCopyFunc(
    dbCopyName,
    file,
    dbType: DBType
  ) {
    const SQL_data = docConfig.getFullConfig();
    const PG = ` PGPASSWORD=${SQL_data.pg.password} pg_dump -s -U ${SQL_data.pg.user}  -p ${SQL_data.pg.port} -F p -d "${dbCopyName}" > "${file}"`;
    const MYSQL = `export MYSQL_PWD='${SQL_data.mysql.password}'; mysqldump -h localhost -u ${SQL_data.mysql.user} --port=${SQL_data.mysql.port}  ${dbCopyName} > ${file}`;
    return dbType === DBType.Postgres || dbType === DBType.RDSPostgres
      ? PG
      : MYSQL;
  },

  // promisified execute to execute commands in the child process
  promExecute: (cmd: string) =>
    new Promise((resolve, reject) => {
      exec(cmd, { timeout: 5000 }, (error, stdout, stderr) => {
        if (error) {
          // console.log(error)
          return reject(error);
        }
        if (stderr) return reject(new Error(stderr));
        return resolve({ stdout, stderr });
      });
    }),
};

export default helperFunctions;
