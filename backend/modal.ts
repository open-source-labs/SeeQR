const { Pool } = require('pg');

// postgres://username:password@hostname:port/databasename
//Defaults
let PG_URI : string = 'postgres://postgres:postgres@localhost:5432/defaultDB';
let pool : any = new Pool({ connectionString: PG_URI });

module.exports = {
    query: (text, params, callback) => {
        console.log('Executed query: ', text);
        return pool.query(text, params, callback);
    },
    changeDB: (dbName : string) => {
        PG_URI = 'postgres://postgres:postgres@localhost:5432/' + dbName;
        pool = new Pool({ connectionString: PG_URI});
        console.log("Current URI: ", PG_URI)
    },
    getLists: () => {
        return new Promise(resolve => {
            const listObj = {
                tableList: [], // current database's tables
                databaseList: []
            };
            // This query returns the names of all the tables in the database, so that the frontend can make a visual for the user
            pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;")
            .then((tables) => {
                let tableList: any = [];
                for(let i = 0; i < tables.rows.length; ++i){
                tableList.push(tables.rows[i].table_name);
                }
                listObj.tableList = tableList
    
                pool.query("SELECT datname FROM pg_database;")
                .then((databases) => {
                  let dbList: any = [];
                  for(let i = 0; i < databases.rows.length; ++i){
                    dbList.push(databases.rows[i].datname);
                  }
                  listObj.databaseList = dbList;
                  resolve(listObj);
                })
            })
        })
        
    }
}