/* eslint-disable no-console */
import { rejects } from 'assert';
import { resolve } from 'path';
import DbList from '../frontend/components/sidebar/DbList';
import { ColumnObj, dbDetails, TableDetails, DBList, DBType, LogType } from './BE_types';
import logger from './Logging/masterlog';

const { Pool } = require('pg');
const docConfig = require('./_documentsConfig');
const mysql = require('mysql2/promise');

// commented out because queries are no longer being used but good to keep as a reference
// const { getPrimaryKeys, getForeignKeys } = require('./DummyD/primaryAndForeignKeyQueries');

// *********************************************************** INITIALIZE TO DEFAULT DB ************************************************* //

let pg_pool;
let msql_pool;

// *********************************************************** HELPER FUNCTIONS ************************************************* //

// function that takes in a tableName, creates the column objects,
// and returns a promise that resolves to an array of columnObjects
const getColumnObjects = function (
  tableName: string,
  dbType: DBType
): Promise<ColumnObj[]> {
  let queryString;

  const value = [tableName];

  if (dbType === DBType.Postgres) {
    // query string to get constraints and table references as well
    queryString =
      `SELECT cols.column_name,
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

      return new Promise((resolve, reject) => {
        pg_pool
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
  }
  else if (dbType === DBType.MySQL) {
    queryString =
      `SELECT
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
  }
  else {
    logger('Trying to use unknown DB Type: ', LogType.ERROR, dbType);
    throw 'Unknown db type';
  }
};

// function that gets the name and size of each of the databases in the current postgres instance
// ignoring the postgres, template0 and template1 DBs
const getDBNames = function (dbType: DBType): Promise<dbDetails[]> {
  return new Promise((resolve, reject) => {
    let query;
    if (dbType === DBType.Postgres) {
      query = `SELECT dbs.datname AS db_name,
      pg_size_pretty(pg_database_size(dbs.datname)) AS db_size
      FROM pg_database dbs
      ORDER BY db_name`;

      pg_pool
      .query(query)
      .then((databases) => {
        const dbList: dbDetails[] = [];

        for (let i = 0; i < databases.rows.length; i++) {
          const data = databases.rows[i];
          const { db_name } = data;

          if (db_name !== 'postgres' && db_name !== 'template0' && db_name !== 'template1') {
            data.db_type = dbType;
            dbList.push(data);
          }
        }

        logger('PG \'getDBNames\' resolved.', LogType.SUCCESS);
        // resolve with array of db names
        resolve(dbList);
      })
      .catch((err) => {
        reject(err);
      });
    }
    else if (dbType === DBType.MySQL) {
      query = `
      SELECT table_schema db_name,
      ROUND(SUM(data_length + index_length) / 1024, 1) db_size

      FROM information_schema.tables
      WHERE table_schema NOT IN("information_schema", "performance_schema", "mysql", "sys")
      GROUP BY table_schema;`;
      
      msql_pool
      .query(query)
      .then((databases) => {
        const dbList: dbDetails[] = [];

        for (let i = 0; i < databases[0].length; i++) {
          const data = databases[0][i];
          const { db_name } = data;
          if (db_name !== 'postgres' && db_name !== 'template0' && db_name !== 'template1') {
            data.db_type = dbType;
            dbList.push(data);
          }
        }

        logger('MySQL \'getDBNames\' resolved.', LogType.SUCCESS);
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
const getDBLists = function (dbType: DBType, dbName: string): Promise<TableDetails[]> {
  return new Promise((resolve, reject) => {
    let query;
    const tableList: TableDetails[] = [];
    const promiseArray: Promise<ColumnObj[]>[] = [];

    if (dbType === DBType.Postgres) {
      query = `SELECT
      table_catalog,
      table_schema,
      table_name,
      is_insertable_into
      FROM information_schema.tables
      WHERE table_schema = 'public' or table_schema = 'base'
      ORDER BY table_name;`;

      pg_pool
        .query(query)
        .then((tables) => {
          for (let i = 0; i < tables.rows.length; i ++) {
            tableList.push(tables.rows[i]);
            promiseArray.push(
              getColumnObjects(tables.rows[i].table_name, dbType)
            );
          }

          Promise.all(promiseArray)
            .then((columnInfo) => {
              for (let i = 0; i < columnInfo.length; i ++) {
                tableList[i].columns = columnInfo[i];
              }

              logger('PG \'getDBLists\' resolved.', LogType.SUCCESS);
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
    else if (dbType === DBType.MySQL) {
      //Notice that TABLE_CATALOG is set to table_schema
      //And that TABLE_SCHEMA is set to table_catalog
      //This is because PG and MySQL have these flipped (For whatever reason)
      query = `SELECT
      TABLE_CATALOG as table_schema,
      TABLE_SCHEMA as table_catalog,
      TABLE_NAME as table_name
      FROM information_schema.tables
      WHERE TABLE_SCHEMA NOT IN("information_schema", "performance_schema", "mysql")
      AND TABLE_SCHEMA = "${dbName}"
      ORDER BY table_name;`;

      msql_pool
        .query(query)
        .then((tables) => {

          for (let i = 0; i < tables[0].length; i ++) {
            tableList.push(tables[0][i]);

            //Sys returns way too much stuff idk
            if(tableList[i].table_schema !== 'sys') {
              promiseArray.push(getColumnObjects(tableList[i].table_name, dbType));
            }
          }

          Promise.all(promiseArray)
            .then((columnInfo) => {
              for (let i = 0; i < columnInfo.length; i++) {
                tableList[i].columns = columnInfo[i];
              }

              logger('MySQL \'getDBLists\' resolved.', LogType.SUCCESS);
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
const PG_DBConnect = async function (pg_uri: string, db: string) {
  const newURI = `${pg_uri}${db}`;
  const newPool = new Pool({ connectionString: newURI });
  if(pg_pool) await pg_pool.end();
  pg_pool = newPool;
  logger('New pool URI set: ' + newURI, LogType.SUCCESS);
};

const MSQL_DBConnect = function (db: string) {
  // msql_pool = mysql.createPool({
  //   host: 'localhost',
  //   user: 'root',
  //   password: 'lynt4lyfe',
  //   database: db,
  //   waitForConnections: true,
  //   connectionLimit: 10,
  //   queueLimit: 0,
  // });

  msql_pool.query(`USE ${db};`)
    .then(() => {
      logger('Connected to MSQL DB: ' + db, LogType.SUCCESS);
    })
    .catch((err) => {
      logger('Couldnt connect to MSQL DB: ' + db, LogType.ERROR);
    });
};

// *********************************************************** MAIN QUERY FUNCTIONS ************************************************* //
interface MyObj {
  pg_uri: string;
  curPG_DB: string;
  curMSQL_DB: string;
  setBaseConnections: () => Promise<void>;
  query: (
    text: string,
    params: (string | number)[],
    dbType: DBType
  ) => Function;
  connectToDB: (db: string, dbType: DBType) => Promise<void>;
  getLists: () => Promise<DBList>;
  getTableInfo: (tableName: string, dbType: DBType) => Promise<ColumnObj[]>;
}

// eslint-disable-next-line prefer-const
const myObj: MyObj = {
  pg_uri: '',
  curPG_DB: '',
  curMSQL_DB: '',

  //Setting starting connection
  setBaseConnections: async function() {
    const PG_Cred = docConfig.getCredentials(DBType.Postgres);
    const MSQL_Cred = docConfig.getCredentials(DBType.MySQL);

    // URI Format: postgres://username:password@hostname:port/databasename
    // Note: User must have a 'postgres' role set-up prior to initializing this connection. https://www.postgresql.org/docs/13/database-roles.html
    // ^Unknown if this rule is still true
    if(pg_pool) await pg_pool.end();

    this.pg_uri = `postgres://${PG_Cred.user}:${PG_Cred.pass}@localhost:5432/${this.curPG_DB}`;
    pg_pool = new Pool({ connectionString: this.pg_uri })

    if(msql_pool) await msql_pool.end();

    msql_pool = mysql.createPool({
      host: 'localhost',
      user: MSQL_Cred.user,
      password: MSQL_Cred.pass,
      database: this.curMSQL_DB,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  },  

  // Run any query
  query(text, params, dbType: DBType) {
    logger('Attempting to run query: \n' + text);
    if(dbType === DBType.Postgres) {
      return pg_pool.query(text, params);
    }
    else if(dbType === DBType.MySQL) {
      return msql_pool.query(text, params);
    }
  },

  // Change current Db
  connectToDB: async function (db: string, dbType: DBType) { 
    logger('Starting connect to DB: ' + db + ' With a dbType of: ' + dbType.toString());

    if(dbType === DBType.Postgres) {
      this.curPG_DB = db;
      await PG_DBConnect(this.pg_uri, db);
    }
    else if (dbType === DBType.MySQL) {
      this.curMSQL_DB = db;
      await MSQL_DBConnect(db);
    }
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

      //Get initial postgres dbs
      getDBNames(DBType.Postgres)
        .then((pgdata) => {
          const pgDBList = pgdata;
          listObj.databaseConnected[0] = true;

          //Get MySQL DBs
          getDBNames(DBType.MySQL)
            .then((msdata) => {
              const msqlDBList = msdata;
              listObj.databaseConnected[1] = true;

              logger('Got DB Names for both PG and MySQL!', LogType.SUCCESS);
              listObj.databaseList = [...pgDBList, ...msqlDBList];
            })
            .catch((err) => {  //MySQL fails... Just get PG!
              logger('Couldn\'t connect to MySQL. Sending only PG Data!', LogType.ERROR);
              listObj.databaseList = pgDBList;
            })
            .finally(() => {
              if(dbType) {
                getDBLists(dbType, dbName)
                .then((data) => {
                  logger('RESOLVING DB DETAILS: Fetched DB names along with Table List for DBType: ' + dbType + ' and DB: ' + dbName, LogType.SUCCESS);
                  listObj.tableList = data;
                  resolve(listObj);
                })
                .catch((err) => {
                  logger('Error getting tableList details: ' + err.message, LogType.ERROR);
                }); 
              }
              else {
                logger('RESOLVING DB DETAILS: Only DB Names', LogType.SUCCESS);
                resolve(listObj);
              }
            })
        })
        .catch((err) => {//If PG fails, try just sending MySQL i guess??
          logger('Couldn\'t connect to PG. Attempting to connect to MySQL instead!', LogType.ERROR);
          //Get MySQL DBs
          getDBNames(DBType.MySQL)
            .then((msdata) => {
              listObj.databaseList = msdata;
              
              //This is not in a .finally block because if getting MySQL data fails here we're all dead anyway
              if(dbType) {
                getDBLists(dbType, dbName)
                .then((data) => {
                  logger('RESOLVING DB DETAILS: Fetched DB names along with Table List for DBType: ' + dbType + ' and DB: ' + dbName, LogType.SUCCESS);
                  listObj.tableList = data;
                  resolve(listObj);
                })
                .catch((err) => {
                  logger('Error getting tableList details: ' + err.message, LogType.ERROR);
                });
              }
              else {
                logger('RESOLVING DB DETAILS: Only DB Names', LogType.SUCCESS);
                resolve(listObj);
              }
            })
            .catch((err) => { // Bad
              logger('Could not connect to either PG or MySQL: ' + err.message, LogType.ERROR);
              throw err;
            });
        })
    });
  },

  // Returns an array of columnObj given a tableName
  getTableInfo(tableName, dbType: DBType) {
    return getColumnObjects(tableName, dbType);
  },
};

module.exports = myObj;