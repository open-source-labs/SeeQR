/* eslint-disable no-shadow */
/* eslint-disable func-names */
/* eslint-disable no-plusplus */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-else-return */
/* eslint-disable no-console */
import { rejects } from 'assert';
import { resolve } from 'path';
import DbList from '../frontend/components/sidebar/DbList';
import {
  ColumnObj,
  dbDetails,
  TableDetails,
  DBList,
  DBType,
  LogType,
} from './BE_types';
import logger from './Logging/masterlog';

const { Pool } = require('pg');
const mysql = require('mysql2/promise');
const docConfig = require('./_documentsConfig');

// commented out because queries are no longer being used but good to keep as a reference
// const { getPrimaryKeys, getForeignKeys } = require('./DummyD/primaryAndForeignKeyQueries');

// *********************************************************** INITIALIZE TO DEFAULT DB ************************************************* //

let pg_pool;
let msql_pool;
let rds_pg_pool;
let rds_msql_pool;

// *********************************************************** HELPER FUNCTIONS ************************************************* //

// function that takes in a tableName, creates the column objects,
// and returns a promise that resolves to an array of columnObjects
const getColumnObjects = function (
  tableName: string,
  dbType: DBType // error?
): Promise<ColumnObj[]> {
  let queryString;

  const value = [tableName];

  if (dbType === DBType.Postgres || dbType === DBType.RDSPostgres) { // added to check for RDS

    let pool; // changes which pool is being queried based on dbType
    if(dbType === DBType.Postgres) pool = pg_pool;
    if(dbType === DBType.RDSPostgres) pool = rds_pg_pool;
    // query string to get constraints and table references as well
    queryString = `SELECT DISTINCT cols.column_name,
      cols.data_type,
      cols.character_maximum_length,
      cols.is_nullable,
      kcu.constraint_name,
      cons.constraint_type,
      rel_kcu.table_name AS foreign_table,
      rel_kcu.column_name AS foreign_column
      FROM information_schema.columns cols
      LEFT JOIN information_schema.key_column_usage kcu
      ON cols.column_name = kcu.column_name
      AND cols.table_name = kcu.table_name
      LEFT JOIN information_schema.table_constraints cons
      ON kcu.constraint_name = cons.constraint_name
      LEFT JOIN information_schema.referential_constraints rco
      ON rco.constraint_name = cons.constraint_name
      LEFT JOIN information_schema.key_column_usage rel_kcu
      ON rco.unique_constraint_name = rel_kcu.constraint_name
      WHERE cols.table_name = $1`;

    // kcu = key column usage = describes which key columns have constraints
    // tc = table constraints = shows if constraint is primary key or foreign key
    // information_schema.table_constraints show the whole table constraints

    return new Promise((resolve, reject) => {
      pool
        .query(queryString, value)
        .then((result) => {
          const columnInfoArray: ColumnObj[] = [];
          for (let i = 0; i < result.rows.length; i++) {
            columnInfoArray.push(result.rows[i]);
          }
          resolve(columnInfoArray);
        })
        .catch((err) => {
          reject(err);
        });
    });
  } else if (dbType === DBType.MySQL || dbType === DBType.RDSMySQL) { // added to check for RDS

    let pool; // changes which pool is being queried based on dbType
    if(dbType === DBType.MySQL) pool = msql_pool;
    if(dbType === DBType.RDSMySQL) pool = rds_msql_pool;
    queryString = `SELECT DISTINCT
      cols.column_name AS column_name,
      cols.data_type AS data_type,
      cols.character_maximum_length AS character_maximum_length,
      cols.is_nullable AS is_nullable,
      kcu.constraint_name AS constraint_name,
      cons.constraint_type AS constraint_type,
      rel_kcu.table_name AS foreign_table,
      rel_kcu.column_name AS foreign_column
      FROM information_schema.columns cols
      LEFT JOIN information_schema.key_column_usage kcu
      ON cols.column_name = kcu.column_name
      AND cols.table_name = kcu.table_name
      LEFT JOIN information_schema.table_constraints cons
      ON kcu.constraint_name = cons.constraint_name
      LEFT JOIN information_schema.referential_constraints rco
      ON rco.constraint_name = cons.constraint_name
      LEFT JOIN information_schema.key_column_usage rel_kcu
      ON rco.unique_constraint_name = rel_kcu.constraint_name
      WHERE cols.table_name = ?;`;

    return new Promise((resolve, reject) => {
      msql_pool
        .query(queryString, value)
        .then((result) => {
          const columnInfoArray: ColumnObj[] = [];

          for (let i = 0; i < result[0].length; i++) {
            columnInfoArray.push(result[0][i]);
          }

          resolve(columnInfoArray);
        })
        .catch((err) => {
          reject(err);
        });
    });
  } else {
    logger('Trying to use unknown DB Type: ', LogType.ERROR, dbType);
    // eslint-disable-next-line no-throw-literal
    throw 'Unknown db type';
  }
};

// function that gets the name and size of each of the databases in the current postgres instance
// ignoring the postgres, template0 and template1 DBs
const getDBNames = function (dbType: DBType): Promise<dbDetails[]> {
  return new Promise((resolve, reject) => {
    let query;
    if (dbType === DBType.Postgres || dbType === DBType.RDSPostgres) { 
      
      let pool; // changes which pool is being queried based on dbType
      if(dbType === DBType.Postgres) pool = pg_pool;
      if(dbType === DBType.RDSPostgres) pool = rds_pg_pool;

      query = `SELECT dbs.datname AS db_name,
      pg_size_pretty(pg_database_size(dbs.datname)) AS db_size
      FROM pg_database dbs
      ORDER BY db_name`;

      pool
        .query(query)
        .then((databases) => {
          const dbList: dbDetails[] = [];

          for (let i = 0; i < databases.rows.length; i++) {
            const data = databases.rows[i];
            const { db_name } = data;

            if (
              db_name !== 'postgres' &&
              db_name !== 'template0' &&
              db_name !== 'template1'
            ) {
              data.db_type = dbType;
              dbList.push(data);
            }
          }

          logger("PG 'getDBNames' resolved.", LogType.SUCCESS);
          // resolve with array of db names
          resolve(dbList);
        })
        .catch((err) => {
          reject(err);
        });
    } else if (dbType === DBType.MySQL || dbType === DBType.RDSMySQL) { // added to check for RDS
      // query = `
      // SELECT table_schema db_name,
      // ROUND(SUM(data_length + index_length) / 1024, 1) db_size

      // FROM information_schema.tables
      // WHERE table_schema NOT IN("information_schema", "performance_schema", "mysql", "sys")
      // GROUP BY table_schema;`;
      let pool;
      if(dbType === DBType.MySQL) pool = msql_pool;
      if(dbType === DBType.RDSMySQL) pool = rds_msql_pool;

      query = `
      SELECT 
        S.SCHEMA_NAME db_name,
        ROUND(SUM(data_length + index_length) / 1024, 1) db_size
      FROM
        INFORMATION_SCHEMA.SCHEMATA S
          LEFT OUTER JOIN
            INFORMATION_SCHEMA.TABLES T ON S.SCHEMA_NAME = T.TABLE_SCHEMA
      WHERE
        S.SCHEMA_NAME NOT IN ('information_schema' , 'mysql', 'performance_schema', 'sys')
      GROUP BY S.SCHEMA_NAME
      ORDER BY db_name ASC;`;

      pool
        .query(query)
        .then((databases) => {
          const dbList: dbDetails[] = [];

          for (let i = 0; i < databases[0].length; i++) {
            const data = databases[0][i];
            const { db_name } = data;
            if (
              db_name !== 'postgres' &&
              db_name !== 'template0' &&
              db_name !== 'template1'
            ) {
              data.db_type = dbType;
              dbList.push(data);
            }
          }

          logger("MySQL 'getDBNames' resolved.", LogType.SUCCESS);
          // resolve with array of db names
          resolve(dbList);
        })
        .catch((err) => {
          reject(err);
        });
    }
  });
};

// function that gets all tablenames and their columns from current schema
const getDBLists = function (
  dbType: DBType,
  dbName: string
): Promise<TableDetails[]> {
  return new Promise((resolve, reject) => {
    let query;
    const tableList: TableDetails[] = [];
    const promiseArray: Promise<ColumnObj[]>[] = [];

    // console.log('dbType - getDBLists: ', dbType);

    if (dbType === DBType.Postgres || dbType === DBType.RDSPostgres) {

      let pool;
      if(dbType === DBType.Postgres) pool = pg_pool;
      if(dbType === DBType.RDSPostgres) pool = rds_pg_pool;

      query = `SELECT
      table_catalog,
      table_schema,
      table_name,
      is_insertable_into
      FROM information_schema.tables
      WHERE table_schema = 'public' or table_schema = 'base'
      ORDER BY table_name;`;

      pool
        .query(query)
        .then((tables) => {
          for (let i = 0; i < tables.rows.length; i++) {
            tableList.push(tables.rows[i]);
            promiseArray.push(
              getColumnObjects(tables.rows[i].table_name, dbType)
            );
          }

          Promise.all(promiseArray)
            .then((columnInfo) => {
              for (let i = 0; i < columnInfo.length; i++) {
                tableList[i].columns = columnInfo[i];
              }

              logger("PG 'getDBLists' resolved.", LogType.SUCCESS);
              resolve(tableList);
            })
            .catch((err) => {
              reject(err);
            });
        })
        .catch((err) => {
          reject(err);
        });
    } else if (dbType === DBType.MySQL || dbType === DBType.RDSMySQL) {
      // Notice that TABLE_CATALOG is set to table_schema
      // And that TABLE_SCHEMA is set to table_catalog
      // This is because PG and MySQL have these flipped (For whatever reason)

      let pool;
      if(dbType === DBType.MySQL) pool = msql_pool;
      if(dbType === DBType.RDSMySQL) pool = rds_msql_pool;

      query = `SELECT
      TABLE_CATALOG as table_schema,
      TABLE_SCHEMA as table_catalog,
      TABLE_NAME as table_name
      FROM information_schema.tables
      WHERE TABLE_SCHEMA NOT IN("information_schema", "performance_schema", "mysql")
      AND TABLE_SCHEMA = "${dbName}"
      ORDER BY table_name;`;

      pool
        .query(query)
        .then((tables) => {
          for (let i = 0; i < tables[0].length; i++) {
            tableList.push(tables[0][i]);

            // Sys returns way too much stuff idk
            if (tableList[i].table_schema !== 'sys') {
              promiseArray.push(
                getColumnObjects(tableList[i].table_name, dbType)
              );
            }
          }

          Promise.all(promiseArray)
            .then((columnInfo) => {
              for (let i = 0; i < columnInfo.length; i++) {
                tableList[i].columns = columnInfo[i];
              }

              logger("MySQL 'getDBLists' resolved.", LogType.SUCCESS);
              resolve(tableList);
            })
            .catch((err) => {
              reject(err);
            });
        })
        .catch((err) => {
          reject(err);
        });
    }
  });
};

// *********************************************************** POSTGRES/MYSQL ************************************************* //
let lastDBType: DBType | undefined;

const PG_DBConnect = async function (pg_uri: string, db: string) {
  const newURI = `${pg_uri}${db}`;
  const newPool = new Pool({ connectionString: newURI });
  if (pg_pool) await pg_pool.end();
  pg_pool = newPool;

  logger(`New pool URI set: ${newURI}`, LogType.SUCCESS);
};

const MSQL_DBConnect = function (db: string) {
  // console.log(`mysql dbconnect ${db}`);
  msql_pool
    .query(`USE ${db};`)
    .then(() => {
      logger(`Connected to MSQL DB: ${db}`, LogType.SUCCESS);
    })
    .catch((err) => {
      logger(`Couldnt connect to MSQL DB: ${db}`, LogType.ERROR);
    });
};

// const RDS_PG_DBConnect = async function (pg_uri: string, db: string) {
//   const newURI = `${pg_uri}${db}`;
//   const newPool = new Pool({ connectionString: newURI });
//   if (rds_pg_pool) await rds_pg_pool.end();
//   rds_pg_pool = newPool;

//   logger(`New pool URI set: ${newURI}`, LogType.SUCCESS);
// } 
// // DOES THIS NEED A URI?

// const RDS_MSQL_DBConnect = function (db: string) {
//   rds_msql_pool
//     .query(`USE ${db};`)
//     .then(() => {
//       logger(`Connected to RDS MSQL DB: ${db}`, LogType.SUCCESS);
//     })
//     .catch((err) => {
//       logger(`Couldnt connect to RDS MSQL DB: ${db}`, LogType.ERROR);
//     });
// }

// *********************************************************** MAIN QUERY FUNCTIONS ************************************************* //
interface MyObj {
  pg_uri: string;
  rds_pg_uri: string;
  curPG_DB: string;
  curMSQL_DB: string;
  curRDS_MSQL_DB: string;
  curRDS_PG_DB: string;
  setBaseConnections: () => Promise<void>;
  query: (
    text: string,
    params: (string | number)[],
    dbType: DBType
  ) => Function;
  connectToDB: (db: string, dbType?: DBType) => Promise<void>;
  getLists: () => Promise<DBList>;
  getTableInfo: (tableName: string, dbType: DBType) => Promise<ColumnObj[]>;
}

// eslint-disable-next-line prefer-const
const myObj: MyObj = {
  pg_uri: '',
  rds_pg_uri: '',
  curPG_DB: '',
  curMSQL_DB: '',
  curRDS_MSQL_DB: '',
  curRDS_PG_DB: '',
  

  // Setting starting connection
  async setBaseConnections() {
    const PG_Cred = docConfig.getCredentials(DBType.Postgres);
    const MSQL_Cred = docConfig.getCredentials(DBType.MySQL);
    const RDS_PG_Cred = docConfig.getCredentials(DBType.RDSPostgres);
    const RDS_MSQL_Cred = docConfig.getCredentials(DBType.RDSMySQL);

    //  this is a dum solution but it needs to be passed in as password into the pool
    // and i would rather do it here than in the documentsconfig file
    const RDS_MSQL_INFO = {
      host: RDS_MSQL_Cred.host,
      user: RDS_MSQL_Cred.user,
      password: RDS_MSQL_Cred.pass,
      port: RDS_MSQL_Cred.port,
    }

    const RDS_PG_INFO = {
      host: RDS_PG_Cred.host,
      user: RDS_PG_Cred.user,
      password: RDS_PG_Cred.pass,
      port: RDS_PG_Cred.port,
    }  
    //  RDS PG POOL
    if (rds_pg_pool) await rds_pg_pool.end();
    rds_pg_pool = new Pool({ ...RDS_PG_INFO });
    rds_pg_pool.connect((err) => {
      if (err) console.log(err, 'ERR PG');
      else console.log('connected to pgdb');
      });

    //  RDS MSQL POOL
    if (rds_msql_pool) await rds_msql_pool.end();
    rds_msql_pool = mysql.createPool({ ...RDS_MSQL_INFO });
    const q = await rds_msql_pool.query('SHOW DATABASES;'); //  just a test query to make sure were connected (it works, i tested with other queries creating tables too)
    console.log(q[0], 'q');

    // URI Format: postgres://username:password@hostname:port/databasename
    // Note User must have a 'postgres'role set-up prior to initializing this connection. https://www.postgresql.org/docs/13/database-roles.html
    // ^Unknown if this rule is still true

    //  LOCAL PG POOL
    if (pg_pool) await pg_pool.end();
    this.pg_uri = `postgres://${PG_Cred.user}:${PG_Cred.pass}@localhost:${PG_Cred.port}/`;
    pg_pool = new Pool({ connectionString: this.pg_uri + this.curPG_DB });

    //  LOCAL MSQL POOL
    if (msql_pool) await msql_pool.end();
    msql_pool = mysql.createPool({
      host: `localhost`,
      port: MSQL_Cred.port,
      user: MSQL_Cred.user,
      password: MSQL_Cred.pass,
      database: this.curMSQL_DB,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      multipleStatements: true,
    });
  },

  // RUN ANY QUERY - function that will run query on database that is passed in.

  query(text, params, dbType: DBType) {
    logger(`Attempting to run query: \n ${text} for: \n ${dbType}`);

    // Checking if database type (dbType) is Postgres
    if (dbType === DBType.Postgres) {
      return pg_pool.query(text, params).catch((err) => {
        logger(err.message, LogType.WARNING);
      });
    }

    // Checking if database type (dbType) is MySQL
    if (dbType === DBType.MySQL) {
      return new Promise((resolve, reject) => {
        if (this.curMSQL_DB) {
          // MySQL requires you to use the USE query in order to connect to a db and run
          msql_pool
            .query(`USE ${this.curMSQL_DB}; ${text}`, params, dbType)
            .then((data) => {
              resolve(data);
            })
            .catch((err) => {
              // Trying query without the use statement for things like drop DB
              msql_pool
                .query(text, params, dbType)
                .then((data) => {
                  resolve(data);
                })
                .catch((err) => {
                  // console.log(`Double: ${this.curMSQL_DB}`);
                  logger(err.message, LogType.WARNING, 'dbQuery1');
                  reject(err);
                });
            });
        } else {
          msql_pool
            // MySQL requires you to use the USE query in order to connect to a db and run
            .query(text, params, dbType)
            .then((data) => {
              resolve(data);
            })
            .catch((err) => {
              // console.log(`Double none: ${this.curMSQL_DB}`);
              logger(err.message, LogType.WARNING, 'mysql caught');
              reject(err);
            });
        }
      });
    }
  },

  // Change current Db
  async connectToDB(db: string, dbType?: DBType | undefined) {
    logger(`Starting connect to DB: ${db} With a dbType of: ${dbType?.toString()} and lastDBType is ${lastDBType}`);
    if (!dbType) {
      if (!lastDBType) {
        logger(
          `Attempted to connect to a dbType when no dbType or lastDBType is defined.`,
          LogType.WARNING
        );
        return;
      }
      dbType = lastDBType;
    }

    if (dbType === DBType.Postgres) {
      this.curPG_DB = db;
      await PG_DBConnect(this.pg_uri, db);
    } else if (dbType === DBType.MySQL) {
      // console.log(`connectToDB -- : ${this.curMSQL_DB}`);
      this.curMSQL_DB = db;
      await MSQL_DBConnect(db);
    } 
    // else if (dbType === DBType.RDSMySQL) {
    //   this.curRDS_MSQL_DB = db;
    //   await RDS_MSQL_DBConnect(db);
    // } 
    // else if (dbType === DBType.RDSPostgres) {
    //   this.curRDS_PG_DB = db;
    //   await RDS_PG_DBConnect(this.rds_pg_uri, db); 
    //   // DOES THIS NEED A URI?
    // }
  },

  // Returns a listObj with two properties using two helpful functions defined above - getDBNames and getDBLists
  // The first is a list of all the database names and sizes in the current instance of Postgres
  // The second is a list of the tables in the current database
  // listObj has the following shape:
  //   {
  //      databaseList: { db_name: 'name', db_size: '1000kB' }
  //      tableList: { table_name: 'name', data_type: 'type', columns: [ colObj ], ...etc. }
  //   }
  getLists(dbName: string = '', dbType?: DBType): Promise<DBList> {
    return new Promise((resolve, reject) => {
      const listObj: DBList = {
        databaseConnected: [false, false],
        databaseList: [],
        tableList: [], // current database's tables
      };
      // Get initial postgres dbs
      getDBNames(DBType.Postgres)
        .then((pgdata) => {
          const pgDBList = pgdata;
          listObj.databaseConnected[0] = true;

          // Get MySQL DBs
          getDBNames(DBType.MySQL)
            .then((msdata) => {
              const msqlDBList = msdata;
              listObj.databaseConnected[1] = true;
              logger('Got DB Names for both PG and MySQL!', LogType.SUCCESS);
              listObj.databaseList = [...pgDBList, ...msqlDBList];
              
            })
            .catch((err) => {
              // MySQL fails... Just get PG!
              logger("Couldn't connect to MySQL. Sending only PG Data!", LogType.ERROR);
              listObj.databaseList = pgDBList;
            })
            .finally(() => {
              if (dbType) {
                // console.log('dbType is defined')
                getDBLists(dbType, dbName) // dbLists returning empty array - DBType is not defined
                  .then((data) => {
                    logger(`RESOLVING DB DETAILS: Fetched DB names along with Table List for DBType: ${dbType} and DB: ${dbName}`, LogType.SUCCESS);
                    listObj.tableList = data;
                    resolve(listObj);
                  })
                  .catch((err) => {
                    logger(`Error getting tableList details: ${err.message}`, LogType.ERROR);
                  });
              } else {
                // console.log('dbType is not defined')
                logger('RESOLVING DB DETAILS: Only DB Names', LogType.SUCCESS);
                resolve(listObj);
              }
            });
        })
        .catch((err) => {
          // If PG fails, try just sending MySQL.
          logger("Couldn't connect to PG. Attempting to connect to MySQL instead!", LogType.ERROR);
          // Get MySQL DBs
          getDBNames(DBType.MySQL)
            .then((msdata) => {
              listObj.databaseList = msdata;

              // This is not in a .finally block because if getting MySQL data fails then nothing returns.
              if (dbType) {
                getDBLists(dbType, dbName)
                  .then((data) => {
                    logger(`RESOLVING DB DETAILS: Fetched DB names along with Table List for DBType: ${dbType} and DB: ${dbName}`, LogType.SUCCESS);
                    listObj.tableList = data;
                    resolve(listObj);
                  })
                  .catch((err) => {
                    logger(`Error getting tableList details: ${err.message}`, LogType.ERROR);
                  });
              } else {
                logger('RESOLVING DB DETAILS: Only DB Names', LogType.SUCCESS);
                resolve(listObj);
              }
            })
            .catch((err) => {
              logger(`Could not connect to either PG or MySQL: ${err.message}`, LogType.ERROR);
              throw err;
            });
        });
    });
  },

  // Returns an array of columnObj given a tableName
  getTableInfo(tableName, dbType: DBType) {
    return getColumnObjects(tableName, dbType);
  },
};

module.exports = myObj;
