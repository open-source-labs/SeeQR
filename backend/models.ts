/* eslint-disable no-console */
import { ColumnObj, dbDetails, TableDetails, DBList, DBType } from './BE_types';

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
const getColumnObjects = function (tableName: string, dbName: DBType): Promise<ColumnObj[]> {
  let queryString
  if (dbName === DBType.Postgres) {
    // query string to get constraints and table references as well
    queryString = 
    `SELECT cols.column_name,` + //Gets column name
    `cols.data_type,` + //Gets data type
    `cols.character_maximum_length,` + //Gets max char length
    `cols.is_nullable,` + //Gets is_nullable

    `kcu.constraint_name,` + //Gets constraint_name

    `cons.constraint_type,` + //Gets constraint_type

    `rel_kcu.table_name AS foreign_table,` + //Gets rel_kcu.table_name AS foreign_table
    `rel_kcu.column_name AS foreign_column` + //Gets kcu.column_name AS foreign_column

    `FROM information_schema.columns cols` + //Gets all this data from information_schema.columns (cols) (lists all columns in the database)

      //This 
      `LEFT JOIN information_schema.key_column_usage kcu` + //Left join will return all data from (cols) and matching records from information_schema.key_column_usage (kcu) where...
        `ON cols.column_name = kcu.column_name` + //cols.column_name is equal to kcu.column name AND (has to meet the condition below as well)...
        `AND cols.table_name = kcu.table_name` + //cols.table_name = kcu.table_name

      `LEFT JOIN information_schema.table_constraints cons` + //Left join all data from (cons) where... (cons lists all constraints from tables in this database)
        `ON kcu.constraint_name = cons.constraint_name` + //kcu.constraint_name is equal to cons.constraint_name

      `LEFT JOIN information_schema.referential_constraints rco` + // rco lists all foreign keys in database
        `ON rco.constraint_name = cons.constraint_name` +
        
      `LEFT JOIN information_schema.key_column_usage rel_kcu` + // key_column_usage lists all columns in the database restricted by primary,unique, foreign or check constraint
        `ON rco.unique_constraint_name = rel_kcu.constraint_name` +

    `WHERE cols.table_name = $1`; // parameterized query will equal tableName down below
  }
  else if (dbName === DBType.MySQL) {
    queryString = '';
  }
  
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
const getDBNames = function (dbType: DBType): Promise<dbDetails[]> {
  return new Promise((resolve, reject) => {
    let query
    if(dbType === DBType.Postgres) {
      query = 
      `SELECT dbs.datname AS db_name,
      pg_size_pretty(pg_database_size(dbs.datname)) AS db_size
      FROM pg_database dbs
      ORDER BY db_name`;
    }
    else if(dbType === DBType.MySQL) {
      query = '';
    }
    
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
        // resolve with array of db names
        resolve(dbList);
      })
      .catch(reject);
    });
  };

// function that gets all tablenames and their columns from current schema
const getDBLists = function (dbType: DBType): Promise<TableDetails[]> {
  return new Promise((resolve, reject) => {
    let query;
    if(dbType === DBType.Postgres) {
      query = 
      `SELECT table_catalog, table_schema, table_name, is_insertable_into
      FROM information_schema.tables
      WHERE table_schema = 'public' or table_schema = 'base'
      ORDER BY table_name;`;
    }
    else if (dbType === DBType.MySQL) {
      // stuff
      query = 'MySQL stuff goes here';
    }

    const tableList: TableDetails[] = []; 
    const promiseArray: Promise<ColumnObj[]>[] = [];

    if(dbType === DBType.Postgres) {
      pool.query(query)
      .then((tables) => {
        for (let i = 0; i < tables.rows.length; i += 1) {
          tableList.push(tables.rows[i]);
          promiseArray.push(getColumnObjects(tables.rows[i].table_name, dbType));
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
    }
    else if(dbType === DBType.MySQL) {
      // Other stuff
    }
    
    });
  }

// *********************************************************** MAIN QUERY FUNCTIONS ************************************************* //
interface MyObj {
  query: (text: string, params: (string | number)[], callback: Function, dbType: DBType) => Function;
  connectToDB: (db: string, dbType: DBType) => Promise<void>;
  getLists: (dbType: DBType) => Promise<DBList>;
  getTableInfo: (tableName: string, dbType: DBType) => Promise<ColumnObj[]>;
};

// eslint-disable-next-line prefer-const
const myObj: MyObj = {
  // Run any query
  query: function(text, params, callback, dbType: DBType) {
    if(dbType === DBType.Postgres) {
      return pool.query(text, params, callback)
    }
    else if (dbType === DBType.MySQL) {
      // stuff
    }
  },

  // Change current Db
  connectToDB: async function (db: string, dbType: DBType) { 
    if(dbType === DBType.Postgres) {
      const newURI = `postgres://postgres:postgres@localhost:5432/${db}`;
      const newPool = new Pool({ connectionString: newURI });
      await pool.end();
      pool = newPool;
    }
    else if (dbType === DBType.MySQL) {
      // stuff
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
  getLists: function (dbType: DBType) { 
    return new Promise((resolve, reject) => {
      const listObj: DBList = {
        databaseList: [],
        tableList: [], // current database's tables
      };

      Promise.all([getDBNames(dbType), getDBLists(dbType)])
        .then((data) => {
          [listObj.databaseList, listObj.tableList] = data;
          resolve(listObj);
        })
        .catch(reject);
      });
    },

  // Returns an array of columnObj given a tableName
  getTableInfo: function (tableName, dbType: DBType) {
    return getColumnObjects(tableName, dbType);
  }
}

module.exports = myObj;
