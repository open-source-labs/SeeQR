const { Pool } = require('pg');

// Initialize to a default db.
// URI Format: postgres://username:password@hostname:port/databasename
let PG_URI: string = 'postgres://postgres:postgres@localhost:5432/defaultDB';
let pool: any = new Pool({ connectionString: PG_URI });

module.exports = {
  query: (text, params, callback) => {
    console.log('Executed query: ', text);
    return pool.query(text, params, callback);
  },
  changeDB: (dbName: string) => {
    PG_URI = 'postgres://postgres:postgres@localhost:5432/' + dbName;
    pool = new Pool({ connectionString: PG_URI });
    console.log('Current URI: ', PG_URI);
  },
  getLists: () => {
    return new Promise((resolve) => {
      const listObj = {
        tableList: [], // current database's tables
        databaseList: [],
      };
      // This query returns the names of all the tables in the database, so that the frontend can make a visual for the user
      pool
        .query(
          "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
        )
        .then((tables) => {
          let tableList: any = [];
          for (let i = 0; i < tables.rows.length; ++i) {
            tableList.push(tables.rows[i].table_name);
          }
          listObj.tableList = tableList;

          pool.query('SELECT datname FROM pg_database;').then((databases) => {
            let dbList: any = [];
            for (let i = 0; i < databases.rows.length; ++i) {
              let curName = databases.rows[i].datname;
              if (curName !== 'postgres' && curName !== 'template0' && curName !== 'template1')
                dbList.push(databases.rows[i].datname);
            }
            listObj.databaseList = dbList;
            resolve(listObj);
          });
        });
    });
  },
  getSchemaLayout: () => {
    // initialize a new promise; we resolve this promise at the end of the last async function within the promise
    return new Promise((resolve) => {
      const schemaLayout: any = {
        tableNames: [],
        tables: {
          // tableName: [columnNames array]
        }
      };
      pool
        // This query returns the names of all the tables in the database
        .query(
          "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
        )
        // then we save the table names into the schemaLayout object in the tableNames property
        .then((tables) => {
          for (let i = 0; i < tables.rows.length; ++i) {
            schemaLayout.tableNames.push(tables.rows[i].table_name);
          }
        })
        // then we iterate over the tableNames we just got and run a query on each to get an array of column names
        .then(() => {
          for (const tableName of schemaLayout.tableNames){
            // This query returns the names of all the columns in the specified table
            const queryString = "SELECT column_name FROM information_schema.columns WHERE table_name = $1;";
            const value = [tableName];
            pool
              .query(queryString, value)
              .then((result) => {
                schemaLayout.tables[tableName] = [];
                for (let i = 0; i < result.rows.length; i++) {
                  schemaLayout.tables[tableName].push(result.rows[i].column_name);
                }

              })
              // // we resolve schemaLayout so that we know we have a resolved promise for whatever invoked getSchemaLayout
              .then(() => {
                resolve(schemaLayout);
              })
            }
          }
      )
    });
  }
};