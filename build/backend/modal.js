"use strict";
var Pool = require('pg').Pool;
// postgres://username:password@hostname:port/databasename
//Defaults
var PG_URI = 'postgres://postgres:postgres@localhost:5432/defaultDB';
var pool = new Pool({ connectionString: PG_URI });
module.exports = {
    query: function (text, params, callback) {
        console.log('Executed query: ', text);
        return pool.query(text, params, callback);
    },
    changeDB: function (dbName) {
        PG_URI = 'postgres://postgres:postgres@localhost:5432/' + dbName;
        pool = new Pool({ connectionString: PG_URI });
        console.log('Current URI: ', PG_URI);
    },
    getLists: function () {
        return new Promise(function (resolve) {
            var listObj = {
                tableList: [],
                databaseList: [],
            };
            // This query returns the names of all the tables in the database, so that the frontend can make a visual for the user
            pool
                .query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;")
                .then(function (tables) {
                var tableList = [];
                for (var i = 0; i < tables.rows.length; ++i) {
                    tableList.push(tables.rows[i].table_name);
                }
                listObj.tableList = tableList;
                pool.query('SELECT datname FROM pg_database;').then(function (databases) {
                    var dbList = [];
                    for (var i = 0; i < databases.rows.length; ++i) {
                        var curName = databases.rows[i].datname;
                        if (curName !== 'postgres' && curName !== 'template0' && curName !== 'template1')
                            dbList.push(databases.rows[i].datname);
                    }
                    listObj.databaseList = dbList;
                    resolve(listObj);
                });
            });
        });
    },
};
//# sourceMappingURL=modal.js.map