/* eslint-disable no-console */
import { ColumnObj, dbDetails, TableDetails, DBList, DBType } from './BE_types';

const { Pool } = require('pg');
const mysql = require('mysql2/promise');

// commented out because queries are no longer being used but good to keep as a reference
// const { getPrimaryKeys, getForeignKeys } = require('./DummyD/primaryAndForeignKeyQueries');

// *********************************************************** INITIALIZE TO DEFAULT DB ************************************************* //

// URI Format: postgres://username:password@hostname:port/databasename
// Note: User must have a 'postgres' role set-up prior to initializing this connection. https://www.postgresql.org/docs/13/database-roles.html
const PG_URI: string = 'postgres://postgres:postgres@localhost:5432';

// URI Format: mysql://user:pass1@mysql:3306/databasename
const MSQL_URI: string = 'mysql://user:pass1@mysql:3306';

let pg_pool = new Pool({ connectionString: PG_URI });
let msql_pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'lynt4lyfe',
  database: '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

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

        console.log('PG DBNAME RESOLVE ', dbList);
        // resolve with array of db names
        resolve(dbList);
      })
      .catch((err) => {
        reject(err);
      });
    }
    else if (dbType === DBType.MySQL) {
      query = `SELECT
      table_schema AS db_name,
      ROUND(SUM(data_length + index_length) / 1024 / 1024, 1) AS db_size
      FROM information_schema.tables
      WHERE table_schema NOT IN("information_schema", "performance_schema", "mysql") GROUP BY table_schema
      AND table_schema != "sys";`;

      //Fryer fix:
      /*
      SELECT table_schema db_name,
      ROUND(SUM(data_length + index_length) / 1024 / 1024, 1) db_size
      
      FROM information_schema.tables 
      WHERE table_schema NOT IN("information_schema", "performance_schema", "mysql", "sys")
      GROUP BY table_schema;
      */
      
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

        console.log('MYSQL DBNAME RESOLVE ', dbList);
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

              console.log('PG DBLISTS RESOLVE ', tableList);
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
      query = `SELECT
      TABLE_CATALOG as table_schema,
      TABLE_SCHEMA as table_catalog,
      TABLE_NAME as table_name
      FROM information_schema.tables
      WHERE table_schema NOT IN("information_schema", "performance_schema", "mysql")
      AND table_schema != "sys"
      AND table_name = "${dbName}"
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

              console.log('MYSQL DBLISTS RESOLVE ', tableList);
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
const PG_DBConnect = async function (db: string) {
  const newURI = `postgres://postgres:postgres@localhost:5432/${db}`;

  console.log('Trying URI: ', newURI);

  const newPool = new Pool({ connectionString: newURI });
  await pg_pool.end();

  console.log('Ended connection. Trying to connect now.');

  pg_pool = newPool;

  console.log('New pool set.');
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
      console.log('Connected to MSQL DB: ' + db);
    })
    .catch((err) => {
      console.log('Couldnt connect to MSQL DB: ' + db);
    });
};

// *********************************************************** MAIN QUERY FUNCTIONS ************************************************* //
interface MyObj {
  query: (
    text: string,
    params: (string | number)[],
    callback: Function,
    dbType: DBType
  ) => Function;
  connectToDB: (db: string, dbType: DBType) => Promise<void>;
  getLists: () => Promise<DBList>;
  getTableInfo: (tableName: string, dbType: DBType) => Promise<ColumnObj[]>;
}

// eslint-disable-next-line prefer-const
const myObj: MyObj = {
  // Run any query
  query(text, params, callback, dbType: DBType) {
    
    if(dbType === DBType.Postgres) {
      return pg_pool.query(text, params, callback);
    }
    else {
      return msql_pool.query(text, params)
        .then((data) => {
          callback(data);
        });
    }
  },

  // Change current Db
  connectToDB: async function (db: string, dbType: DBType) { 
    console.log('Starting connect to DB: ' + db + ' with a dbType of ', dbType);

    if(dbType === DBType.Postgres) {
      console.log('Attempting Postgres connection.');
      await PG_DBConnect(db);
    }
    else if (dbType === DBType.MySQL) {
      console.log('Attempting MSQL connection');
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
        databaseList: [],
        tableList: [], // current database's tables
      };

      //Get initial postgres dbs
      getDBNames(DBType.Postgres)
        .then((pgdata) => {
          const pgDBList = pgdata;

          //Get MySQL DBs
          getDBNames(DBType.MySQL)
            .then((msdata) => {
              const msqlDBList = msdata;
              console.log('==== GOT DB NAMES FOR PG AND MSQL ==== SUCCESS');

              listObj.databaseList = [...pgDBList, ...msqlDBList];
            })
            .catch((err) => {  //MySQL fails... Just get PG!
              console.log('==== Couldnt connect to MySQL. Sending only PG Instead! ====');
              listObj.databaseList = pgDBList;
            })
            .finally(() => {
              if(dbType) {
                console.log('==== Sending table data along with DB-Lists for DBType: ' + dbType + ' and DB: ' + dbName + ' ====');

                getDBLists(dbType, dbName)
                .then((data) => {
                  listObj.tableList = data;
                  resolve(listObj);
                })
              }
              else {
                resolve(listObj);
              }
            })
        })
        .catch((err) => {//If PG fails, try just sending MySQL i guess??
          console.log('==== Couldnt connect to PG. Attempting to get MySQL Instead! ====');
          //Get MySQL DBs
          getDBNames(DBType.MySQL)
            .then((msdata) => {
              listObj.databaseList = msdata;
            })
            .catch((err) => { // Bad
              console.log('==== Failed to connect to either MySQL OR PG! ====');
            })
            .finally(() => {
              if(dbType) {
                console.log('==== Sending table data along with DB-Lists for DBType: ' + dbType + ' and DB: ' + dbName + ' ====');

                getDBLists(dbType, dbName)
                .then((data) => {
                  listObj.tableList = data;
                  resolve(listObj);
                })
              }
              else {
                resolve(listObj);
              }
            })
        })

        //Only get what tableList you need! Right now we get nothing...
        //But when you need it it looks like this!
        //  getDBLists(DBType.Postgres)
        //   .then((data) => {
        //     listObj.tableList = data;
        //   })
    });
  },

  // Returns an array of columnObj given a tableName
  getTableInfo(tableName, dbType: DBType) {
    return getColumnObjects(tableName, dbType);
  },
};

module.exports = myObj;