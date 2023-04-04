import {
  ColumnObj,
  dbDetails,
  TableDetails,
  DBList,
  DBType,
  LogType,
  DBFunctions,
} from './BE_types';
import logger from './Logging/masterlog';
import pools from './poolVariables';
import connectionFunctions from './databaseConnections';
const docConfig = require('./_documentsConfig');
// eslint-disable-next-line prefer-const

const DBFunctions: DBFunctions = {
  pg_uri: '',
  curPG_DB: '',
  curMSQL_DB: '',
  curRDS_MSQL_DB: {
    user: '',
    password: '',
    host: '',
  },
  curRDS_PG_DB: {
    user: '',
    password: '',
    host: '',
  },
  /*
  junaid
  object to check to true if that db was logged into
  */
  dbsInputted: {
    pg: false,
    msql: false,
    rds_pg: false,
    rds_msql: false,
  },

  async setBaseConnections() {
    const PG_Cred = docConfig.getCredentials(DBType.Postgres);
    const MSQL_Cred = docConfig.getCredentials(DBType.MySQL);
    this.curRDS_PG_DB = docConfig.getCredentials(DBType.RDSPostgres);
    this.curRDS_MSQL_DB = docConfig.getCredentials(DBType.RDSMySQL);
    /*
     junaid
     all the if/else and try/catch in this function are for various forms of error handling. incorrect passwords/removed entries after successful logins
    */

    //  RDS PG POOL
    if (
      this.curRDS_PG_DB.user &&
      this.curRDS_PG_DB.password &&
      this.curRDS_PG_DB.host
    ) {
      try {
        await connectionFunctions.RDS_PG_DBConnect(this.curRDS_PG_DB);
        this.dbsInputted.rds_pg = true;
        console.log('CONNECTED TO RDS PG DATABASE!');
      } catch (error) {
        this.dbsInputted.rds_pg = false;
        console.log('FAILED TO CONNECT TO RDS PG DATABASE');
      }
    } else {
      this.dbsInputted.rds_pg = false;
    }

    //  RDS MSQL POOL
    if (
      this.curRDS_MSQL_DB.user &&
      this.curRDS_MSQL_DB.password &&
      this.curRDS_MSQL_DB.host
    ) {
      try {
        await connectionFunctions.RDS_MSQL_DBConnect(this.curRDS_MSQL_DB);
        /*
        junaid
           just a test query to make sure were connected. needed for the catch statement to hit incase we arent connected.
        */
        const testQuery = await pools.rds_msql_pool.query('SHOW DATABASES;');
        console.log(`CONNECTED TO RDS MYSQL DATABASE!`);
        this.dbsInputted.rds_msql = true;
      } catch (error) {
        this.dbsInputted.rds_msql = false;
        console.log('FAILED TO CONNECT TO RDS MSQL DATABASE');
      }
    } else {
      this.dbsInputted.rds_msql = false;
    }

    //  LOCAL PG POOL
    if (PG_Cred.user && PG_Cred.password) {
      this.pg_uri = `postgres://${PG_Cred.user}:${PG_Cred.password}@localhost:${PG_Cred.port}/`;
      try {
        await connectionFunctions.PG_DBConnect(this.pg_uri, this.curPG_DB);
        console.log('CONNECTED TO LOCAL PG DATABASE');
        this.dbsInputted.pg = true;
      } catch (error) {
        this.dbsInputted.pg = false;
        console.log('FAILED TO CONNECT TO LOCAL PG DATABASE');
      }
    } else {
      this.dbsInputted.pg = false;
    }

    //  LOCAL MSQL POOL
    if (MSQL_Cred.user && MSQL_Cred.password) {
      try {
        await connectionFunctions.MSQL_DBConnect({
          host: `localhost`,
          port: MSQL_Cred.port,
          user: MSQL_Cred.user,
          password: MSQL_Cred.password,
          database: this.curMSQL_DB,
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
          multipleStatements: true,
        });
        /*
        junaid
           just a test query to make sure were connected. needed for the catch statement to hit incase we arent connected.
        */
        const testQuery = await pools.msql_pool.query('SHOW DATABASES;');
        this.dbsInputted.msql = true;
        console.log(`CONNECTED TO LOCAL MYSQL DATABASE!`);
      } catch (error) {
        this.dbsInputted.msql = false;
        console.log('FAILED TO CONNECT TO LOCAL MSQL DATABASE');
      }
    } else {
      this.dbsInputted.msql = false;
    }
  },

  query(text, params, dbType) {
    // RUN ANY QUERY - function that will run query on database that is passed in.
    logger(`Attempting to run query: \n ${text} for: \n ${dbType}`);

    if (dbType === DBType.RDSPostgres) {
      return pools.rds_pg_pool.query(text, params).catch((err) => {
        logger(err.message, LogType.WARNING);
      });
    }

    if (dbType === DBType.RDSMySQL) {
      return pools.rds_msql_pool.query(text, params, dbType);
    }

    if (dbType === DBType.Postgres) {
      return pools.pg_pool.query(text, params).catch((err) => {
        logger(err.message, LogType.WARNING);
      });
    }

    if (dbType === DBType.MySQL) {
      return pools.msql_pool.query(
        `USE ${this.curMSQL_DB}; ${text}`,
        params,
        dbType
      );
    }
  },

  async connectToDB(db, dbType) {
    //change current Db
    if (dbType === DBType.Postgres) {
      this.curPG_DB = db;
      await connectionFunctions.PG_DBConnect(this.pg_uri, db);
    } else if (dbType === DBType.MySQL) {
      this.curMSQL_DB = db;
      await connectionFunctions.MSQL_DBQuery(db);
    } else if (dbType === DBType.RDSMySQL) {
      this.curRDS_MSQL_DB = db;
      await connectionFunctions.RDS_MSQL_DBQuery(db);
    } else if (dbType === DBType.RDSPostgres) {
      await connectionFunctions.RDS_PG_DBConnect(this.curRDS_PG_DB);
    }
  },

  async getLists(dbName = '', dbType) {
    /*
    junaid
    this list object is what will be returned at the end of the function. function will get lists for all four databases depending on which is logged in
    */
    const listObj: DBList = {
      databaseConnected: [false, false, false, false],
      databaseList: [],
      tableList: [],
    };

    if (this.dbsInputted.pg) {
      try {
        const pgDBList = await this.getDBNames(DBType.Postgres);
        listObj.databaseConnected[0] = true;
        listObj.databaseList = [...listObj.databaseList, ...pgDBList];
      } catch (error) {
        logger('COULDNT GET NAMES FROM LOCAL PG', LogType.ERROR);
      }
    }

    if (this.dbsInputted.msql) {
      try {
        const msqlDBList = await this.getDBNames(DBType.MySQL);
        listObj.databaseConnected[1] = true;
        listObj.databaseList = [...listObj.databaseList, ...msqlDBList];
      } catch (error) {
        logger('COULDNT GET NAMES FROM LOCAL MSQL', LogType.ERROR);
      }
    }

    if (this.dbsInputted.rds_msql) {
      try {
        const RDSmsqlDBList = await this.getDBNames(DBType.RDSMySQL);
        listObj.databaseConnected[2] = true;
        listObj.databaseList = [...listObj.databaseList, ...RDSmsqlDBList];
      } catch (error) {
        logger('COULDNT GET NAMES FROM RDS MSQL', LogType.ERROR);
      }
    }

    if (this.dbsInputted.rds_pg) {
      try {
        const RDSpgDBList = await this.getDBNames(DBType.RDSPostgres);
        listObj.databaseConnected[3] = true;
        listObj.databaseList = [...listObj.databaseList, ...RDSpgDBList];
      } catch (error) {
        logger('COULDNT GET NAMES FROM RDS PG', LogType.ERROR);
      }
    }

    if (dbType) {
      try {
        const listData = await this.getDBLists(dbType, dbName);
        logger(
          `RESOLVING DB DETAILS: Fetched DB names along with Table List for DBType: ${dbType} and DB: ${dbName}`,
          LogType.SUCCESS
        );
        listObj.tableList = listData;
      } catch (error) {
        logger(
          `COULNT GET DATABASE LIST FOR ${dbType} ${dbName} DATABASE`,
          LogType.ERROR
        );
      }
    }
    return listObj;
  },

  getTableInfo(tableName, dbType) {
    // Returns an array of columnObj given a tableName
    return this.getColumnObjects(tableName, dbType);
  },

  getDBNames(dbType) {
    return new Promise((resolve, reject) => {
      let query;
      if (dbType === DBType.Postgres || dbType === DBType.RDSPostgres) {
        let pool; // changes which pool is being queried based on dbType

        if (dbType === DBType.Postgres) pool = pools.pg_pool;
        if (dbType === DBType.RDSPostgres) pool = pools.rds_pg_pool;
        const dbList: dbDetails[] = [];
        /*
        junaid
        only run queries if pool is made
        */
        if (pool) {
          query = `SELECT dbs.datname AS db_name,
          pg_size_pretty(pg_database_size(dbs.datname)) AS db_size
          FROM pg_database dbs
          ORDER BY db_name`;
          pool
            .query(query)
            .then((databases) => {
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
        } else {
          resolve(dbList);
        }
      } else if (dbType === DBType.MySQL || dbType === DBType.RDSMySQL) {
        let pool; // changes which pool is being queried based on dbType
        if (dbType === DBType.MySQL) pool = pools.msql_pool;
        if (dbType === DBType.RDSMySQL) pool = pools.rds_msql_pool;
        const dbList: dbDetails[] = [];
        /*
        junaid
        only run queries if pool is made
        */
        if (pool) {
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
        } else {
          resolve(dbList);
        }
      }
    });
  },

  getColumnObjects(tableName, dbType) {
    // function that takes in a tableName, creates the column objects,
    // and returns a promise that resolves to an array of columnObjects
    let queryString;
    const value = [tableName];
    if (dbType === DBType.Postgres || dbType === DBType.RDSPostgres) {
      // added to check for RDS
      let pool; // changes which pool is being queried based on dbType
      if (dbType === DBType.Postgres) pool = pools.pg_pool;
      if (dbType === DBType.RDSPostgres) pool = pools.rds_pg_pool;
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
    } else if (dbType === DBType.MySQL || dbType === DBType.RDSMySQL) {
      // added to check for RDS

      let pool; // changes which pool is being queried based on dbType
      if (dbType === DBType.MySQL) pool = pools.msql_pool;
      if (dbType === DBType.RDSMySQL) pool = pools.rds_msql_pool;
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
        pool
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
  },

  getDBLists(dbType, dbName) {
    return new Promise((resolve, reject) => {
      let query;
      const tableList: TableDetails[] = [];
      const promiseArray: Promise<ColumnObj[]>[] = [];

      if (dbType === DBType.Postgres || dbType === DBType.RDSPostgres) {
        let pool;
        if (dbType === DBType.Postgres) pool = pools.pg_pool;
        if (dbType === DBType.RDSPostgres) pool = pools.rds_pg_pool;

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
                this.getColumnObjects(tables.rows[i].table_name, dbType)
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
        if (dbType === DBType.MySQL) pool = pools.msql_pool;
        if (dbType === DBType.RDSMySQL) pool = pools.rds_msql_pool;

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
                  this.getColumnObjects(tableList[i].table_name, dbType)
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
  },
};

module.exports = DBFunctions;
