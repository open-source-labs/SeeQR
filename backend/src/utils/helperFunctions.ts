/* eslint-disable object-shorthand */
import { exec } from 'child_process'; // Child_Process: Importing Node.js' child_process API
import { DBType } from '../../../shared/types/dbTypes';
import docConfig from '../models/configModel';
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
  /**
   * Generate query for creating a database with the input name for the input type
   * @param name name of database to create
   * @param dbType type of database to create
   * @returns String form of query
   */
  createDBFunc: function createDBFunc(name, dbType: DBType) {
    const PG = `CREATE DATABASE "${name}"`;
    const MYSQL = `CREATE DATABASE ${name}`;
    if (dbType === DBType.Postgres || dbType === DBType.RDSPostgres) return PG;
    if (dbType === DBType.MySQL || dbType === DBType.RDSMySQL) return MYSQL;
    return 'invalid dbtype';
  },

  /**
   * Generate query for dropping a database with the input name from the input type
   * @param dbName name of database to drop
   * @param dbType type of database to drop
   * @returns String form of a query
   */
  dropDBFunc: function dropDBFunc(dbName, dbType: DBType) {
    const PG = `DROP DATABASE "${dbName}"`;
    const MYSQL = `DROP DATABASE ${dbName}`;
    if (dbType === DBType.Postgres || dbType === DBType.RDSPostgres) return PG;
    if (dbType === DBType.MySQL || dbType === DBType.RDSMySQL) return MYSQL;
    return 'invalid dbtype';
  },

  // run explain on query
  explainQuery: function explainQuery(sqlString, dbType: DBType) {
    const PG = `BEGIN; EXPLAIN (FORMAT JSON, ANALYZE, VERBOSE, BUFFERS) ${sqlString}; ROLLBACK`;
    // const MYSQL = `BEGIN; EXPLAIN ANALYZE ${sqlString}`;
    const MYSQL = `EXPLAIN ANALYZE ${sqlString}`;
    const SQLite = `EXPLAIN QUERY PLAN ${sqlString}`;

    if (dbType === DBType.Postgres || dbType === DBType.RDSPostgres) return PG;
    if (dbType === DBType.MySQL || dbType === DBType.RDSMySQL) return MYSQL;
    if (dbType === DBType.SQLite) return SQLite;
    return 'invalid dbtype';
  },

  // import SQL file into new DB created
  runSQLFunc: function runSQLFunc(dbName, file, dbType: DBType) {
    const SQL_data = docConfig.getFullConfig();
    const PG = `psql -U ${SQL_data?.pg_options.user} -d "${dbName}" -f "${file}" -p ${SQL_data?.pg_options.port}`;
    const MYSQL = `export MYSQL_PWD='${SQL_data?.mysql_options.password}'; mysql -u${SQL_data?.mysql_options.user} --port=${SQL_data?.mysql_options.port} ${dbName} < ${file}`;
    if (dbType === DBType.Postgres || dbType === DBType.RDSPostgres) return PG;
    if (dbType === DBType.MySQL || dbType === DBType.RDSMySQL) return MYSQL;
    return 'invalid dbtype';
  },

  // import TAR file into new DB created
  runTARFunc: function runTARFunc(dbName, file, dbType: DBType) {
    const SQL_data = docConfig.getFullConfig();
    const PG = `pg_restore -U ${SQL_data?.pg_options.user} -p ${SQL_data?.pg_options.port} -d "${dbName}" "${file}" `;
    const MYSQL = `export MYSQL_PWD='${SQL_data?.mysql_options.password}'; mysqldump -u ${SQL_data?.mysql_options.user} --port=${SQL_data?.mysql_options.port}  ${dbName} > ${file}`;
    if (dbType === DBType.Postgres || dbType === DBType.RDSPostgres) return PG;
    if (dbType === DBType.MySQL || dbType === DBType.RDSMySQL) return MYSQL;
    return 'invalid dbtype';
  },

  // make a full copy of the schema
  runFullCopyFunc: function runFullCopyFunc(
    dbCopyName,
    newFile,
    dbType: DBType,
  ) {
    const SQL_data = docConfig.getFullConfig();
    const PG = `PGPASSWORD=${SQL_data?.pg_options.password} pg_dump -s -U ${SQL_data?.pg_options.user} -p ${SQL_data?.pg_options.port} -Fp -d ${dbCopyName} > "${newFile}"`;
    const MYSQL = `export MYSQL_PWD='${SQL_data?.mysql_options.password}'; mysqldump -h localhost -u ${SQL_data?.mysql_options.user}  ${dbCopyName} > ${newFile}`;
    if (dbType === DBType.Postgres || dbType === DBType.RDSPostgres) return PG;
    if (dbType === DBType.MySQL || dbType === DBType.RDSMySQL) return MYSQL;
    return 'invalid dbtype';
  },

  // make a hollow copy of the schema
  runHollowCopyFunc: function runHollowCopyFunc(
    dbCopyName,
    file,
    dbType: DBType,
  ) {
    const SQL_data = docConfig.getFullConfig();
    const PG = ` PGPASSWORD=${SQL_data?.pg_options.password} pg_dump -s -U ${SQL_data?.pg_options.user} -p ${SQL_data?.pg_options.port} -F p -d "${dbCopyName}" > "${file}"`;
    const MYSQL = `export MYSQL_PWD='${SQL_data?.mysql_options.password}'; mysqldump -h localhost -u ${SQL_data?.mysql_options.user} --port=${SQL_data?.mysql_options.port}  ${dbCopyName} > ${file}`;
    if (dbType === DBType.Postgres || dbType === DBType.RDSPostgres) return PG;
    if (dbType === DBType.MySQL || dbType === DBType.RDSMySQL) return MYSQL;
    return 'invalid dbtype';
  },

  // promisified execute to execute commands in the child process
  promExecute: (cmd: string) =>
    new Promise((resolve, reject) => {
      const SQL_data = docConfig.getFullConfig();
      exec( //opens cli
        cmd,
        {
          timeout: 5000,
          env: {PGPASSWORD: SQL_data?.pg_options.password },
        },
        (error, stdout, stderr) => {
          if (error) {
            console.log('ERROR in helperfunctions - promExecute', error);
            return reject(error);
          }
          if (stderr) return reject(new Error(stderr));
          return resolve({ stdout, stderr });
        },
      );
    }),
};

export default helperFunctions;
