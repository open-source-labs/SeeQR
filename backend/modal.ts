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
    },
    getConnectionString: () => {console.log(pool.connectionString)}
}