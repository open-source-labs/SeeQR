/* eslint-disable no-console */
import { ColumnObj, dbDetails, TableDetails, DBList } from './BE_types';

const { Pool } = require('pg');

// commented out because queries are no longer being used but good to keep as a reference
// const { getPrimaryKeys, getForeignKeys } = require('./DummyD/primaryAndForeignKeyQueries');


// *********************************************************** INITIALIZE TO DEFAULT DB ************************************************* //

// URI Format: postgres://username:password@hostname:port/databasename
// Note: User must have a 'postgres' role set-up prior to initializing this connection. https://www.postgresql.org/docs/13/database-roles.html
const PG_URI: string = 'postgres://postgres:postgres@localhost:5432';
let pool = new Pool({ connectionString: PG_URI });


// *********************************************************** HELPER FUNCTIONS ************************************************* //

// function that takes in a tableName, creates the column objects,
// and returns a promise that resolves to an array of columnObjects
const getColumnObjects = (tableName: string): Promise<ColumnObj[]> => {
  // query string to get constraints and table references as well
  const queryString = `
  SELECT cols.column_name,
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
  WHERE cols.table_name = $1
  `;
  const value = [tableName];
  return new Promise((resolve) => {
    pool.query(queryString, value).then((result) => {
      const columnInfoArray: ColumnObj[] = [];
      for (let i = 0; i < result.rows.length; i += 1) {
        columnInfoArray.push(result.rows[i]);
      }
      resolve(columnInfoArray);
    });
  });
};

// function that gets the name and size of each of the databases in the current postgres instance
// ignoring the postgres, template0 and template1 DBs
const getDBNames = (): Promise<dbDetails[]> =>
  new Promise((resolve, reject) => {
    const query = `
      SELECT dbs.datname AS db_name,
             pg_size_pretty(pg_database_size(dbs.datname)) AS db_size
      FROM pg_database dbs
      ORDER BY db_name
    `;
    pool.query(query)
      .then((databases) => {
        const dbList: dbDetails[] = [];
        for (let i = 0; i < databases.rows.length; i += 1) {
          const { db_name } = databases.rows[i];
          if (
            db_name !== 'postgres' &&
            db_name !== 'template0' &&
            db_name !== 'template1'
          )
            dbList.push(databases.rows[i]);
        }
        resolve(dbList);
      })
      .catch(reject);
  });

// function that gets all tablenames and their columns from current schema
const getDBLists = (): Promise<TableDetails[]> =>
  new Promise((resolve, reject) => {
    const query = `
      SELECT table_catalog, table_schema, table_name, is_insertable_into
      FROM information_schema.tables
      WHERE table_schema = 'public' or table_schema = 'base'
      ORDER BY table_name;
    `;
    const tableList: TableDetails[] = [];
    const promiseArray: Promise<ColumnObj[]>[] = [];
    pool
      .query(query)
      .then((tables) => {
        for (let i = 0; i < tables.rows.length; i += 1) {
          tableList.push(tables.rows[i]);
          promiseArray.push(getColumnObjects(tables.rows[i].table_name));
        }
        Promise.all(promiseArray)
          .then((columnInfo) => {
            for (let i = 0; i < columnInfo.length; i += 1) {
              tableList[i].columns = columnInfo[i];
            }
            resolve(tableList);
          })
          .catch(reject);
      })
      .catch(reject);
  });

// *********************************************************** MAIN QUERY FUNCTIONS ************************************************* //
interface MyObj {
  query: (text: string, params: (string | number)[], callback: Function) => Function;
  connectToDB: (db: string) => Promise<void>;
  getLists: () => Promise<DBList>;
  getTableInfo: (tableName: string) => Promise<ColumnObj[]>;
};

// eslint-disable-next-line prefer-const
const myObj: MyObj = {
  // Run any query
  query: (text, params, callback) => pool.query(text, params, callback),

  // Change current Db
  connectToDB: async (db: string) => {
    const newURI = `postgres://postgres:postgres@localhost:5432/${db}`;
    const newPool = new Pool({ connectionString: newURI });
    await pool.end();
    pool = newPool;
  },

  // Returns a listObj with two properties using two helpful functions defined above - getDBNames and getDBLists
  // The first is a list of all the database names and sizes in the current instance of Postgres
  // The second is a list of the tables in the current database
  // listObj has the following shape:
  //   {
  //      databaseList: { db_name: 'name', db_size: '1000kB' }
  //      tableList: { table_name: 'name', data_type: 'type', columns: [ colObj ], ...etc. }
  //   }
  getLists: () =>
    new Promise((resolve, reject) => {
      const listObj: DBList = {
        databaseList: [],
        tableList: [], // current database's tables
      };
      Promise.all([getDBNames(), getDBLists()])
        .then((data) => {
          [listObj.databaseList, listObj.tableList] = data;
          resolve(listObj);
        })
        .catch(reject);
    }),

  // Returns an array of columnObj given a tableName
  getTableInfo: (tableName) => getColumnObjects(tableName),
};

module.exports = myObj;
