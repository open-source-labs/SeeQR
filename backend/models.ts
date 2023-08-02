import {
  ColumnObj,
  DBFunctions,
  DBList,
  DBType,
  LogType,
  TableDetails,
  dbDetails,
} from './BE_types';
import logger from './Logging/masterlog';
import connectionFunctions from './databaseConnections';
import pools from './poolVariables';

const fs = require('fs');
const { performance } = require('perf_hooks');
const docConfig = require('./_documentsConfig');

// eslint-disable-next-line prefer-const

/**
 * This object contains info about the current database being accessed
 *                      login info for rds
 *                      highest level functions for accessing databases
 */
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
  curSQLite_DB: { path: '' },
  curdirectPGURI_DB: '',

  /**
   * Indicates whether the named database has been logged-in to, default to false
   */
  dbsInputted: {
    pg: false,
    msql: false,
    rds_pg: false,
    rds_msql: false,
    sqlite: false,
    directPGURI: false,
  },

  /**
   * Saves login info to variables. Tries to log in to databases using configs
   * @returns object containing login status of all database servers
   */
  async setBaseConnections() {
    const PG_Cred = docConfig.getCredentials(DBType.Postgres);
    const MSQL_Cred = docConfig.getCredentials(DBType.MySQL);
    this.curRDS_PG_DB = docConfig.getCredentials(DBType.RDSPostgres);
    this.curRDS_MSQL_DB = docConfig.getCredentials(DBType.RDSMySQL);
    this.curSQLite_DB = docConfig.getCredentials(DBType.SQLite);
    this.curdirectPGURI_DB = docConfig.getCredentials(DBType.directPGURI);
    const configExists = {
      pg: false,
      msql: false,
      rds_pg: false,
      rds_msql: false,
      sqlite: false,
      directPGURI: false,
    };
    /*
     all the if/else and try/catch in this function are for various forms of error handling. incorrect passwords/removed entries after successful logins
    */

    //  RDS PG POOL: truthy values means user has inputted info into config -> try to log in
    if (
      this.curRDS_PG_DB.user &&
      this.curRDS_PG_DB.password &&
      this.curRDS_PG_DB.host
    ) {
      try {
        configExists.rds_pg = true;
        await connectionFunctions.RDS_PG_DBConnect(this.curRDS_PG_DB);
        this.dbsInputted.rds_pg = true;
        logger('CONNECTED TO RDS PG DATABASE!', LogType.SUCCESS);
      } catch (error) {
        this.dbsInputted.rds_pg = false;
        logger('FAILED TO CONNECT TO RDS PG DATABASE', LogType.ERROR);
      }
    } else {
      configExists.rds_pg = false;
      this.dbsInputted.rds_pg = false;
    }

    //  RDS MSQL POOL: truthy values means user has inputted info into config -> try to log in
    if (
      this.curRDS_MSQL_DB.user &&
      this.curRDS_MSQL_DB.password &&
      this.curRDS_MSQL_DB.host
    ) {
      try {
        configExists.rds_msql = true;
        await connectionFunctions.RDS_MSQL_DBConnect(this.curRDS_MSQL_DB);

        // test query to make sure were connected. needed for the catch statement to hit incase we arent connected.
        const testQuery = await pools.rds_msql_pool.query('SHOW DATABASES;');
        logger('CONNECTED TO RDS MYSQL DATABASE!', LogType.SUCCESS);
        this.dbsInputted.rds_msql = true;
      } catch (error) {
        this.dbsInputted.rds_msql = false;
        logger('FAILED TO CONNECT TO RDS MSQL DATABASE', LogType.ERROR);
      }
    } else {
      configExists.rds_msql = false;
      this.dbsInputted.rds_msql = false;
    }

    //  LOCAL PG POOL: truthy values means user has inputted info into config -> try to connect
    if (PG_Cred.user && PG_Cred.password) {
      // eslint-disable-next-line no-console
      console.log('this is PG CRED!!!!', PG_Cred);
      this.pg_uri = `postgres://${PG_Cred.user}:${PG_Cred.password}@localhost:${PG_Cred.port}/`;
      console.log('this is this.pgURL~!!!!', this.pg_uri);
      console.log('this is the this.cur DB!!!!~~', this.curPG_DB);
      try {
        configExists.pg = true;
        await connectionFunctions.PG_DBConnect(this.pg_uri, this.curPG_DB);
        logger('CONNECTED TO LOCAL PG DATABASE', LogType.SUCCESS);
        this.dbsInputted.pg = true;
      } catch (error) {
        this.dbsInputted.pg = false;
        // eslint-disable-next-line no-console
        console.log(PG_Cred, 'THIS IS THE PG CRED!!!');
        logger(
          'FAILED TO CONNECT TO LOCAL PG DATABASE, hellohello',
          LogType.ERROR,
        );
      }
    } else {
      configExists.pg = false;
      this.dbsInputted.pg = false;
    }

    //  LOCAL MSQL POOL: truthy values means user has inputted info into config -> try to log in
    if (MSQL_Cred.user && MSQL_Cred.password) {
      try {
        configExists.msql = true;
        await connectionFunctions.MSQL_DBConnect({
          host: 'localhost',
          port: MSQL_Cred.port,
          user: MSQL_Cred.user,
          password: MSQL_Cred.password,
          database: this.curMSQL_DB,
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
          multipleStatements: true,
        });

        // test query to make sure were connected. needed for the catch statement to hit incase we arent connected.
        const testQuery = await pools.msql_pool.query('SHOW DATABASES;');
        this.dbsInputted.msql = true;
        logger('CONNECTED TO LOCAL MYSQL DATABASE!', LogType.SUCCESS);
      } catch (error) {
        this.dbsInputted.msql = false;
        logger('FAILED TO CONNECT TO LOCAL MSQL DATABASE', LogType.ERROR);
      }
    } else {
      configExists.msql = false;
      this.dbsInputted.msql = false;
    }

    //  RDS PG POOL: truthy values means user has inputted info into config -> try to log in
    if (this.curSQLite_DB.path) {
      try {
        configExists.sqlite = true;
        await connectionFunctions.SQLite_DBConnect(this.curSQLite_DB.path);
        this.dbsInputted.sqlite = true;
        logger('CONNECTED TO SQLITE DATABASE!', LogType.SUCCESS);
      } catch (error) {
        this.dbsInputted.sqlite = false;
        logger('FAILED TO CONNECT TO SQLITE DATABASE', LogType.ERROR);
      }
    } else {
      configExists.sqlite = false;
      this.dbsInputted.sqlite = false;
    }

    return { dbsInputted: this.dbsInputted, configExists };
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
      // pools.msql_pool.query(`USE ${this.curMSQL_DB}`);
      return pools.msql_pool.query(text, params, dbType);
    }

    if (dbType === DBType.SQLite) {
      // return pools.sqlite_db.all(text, (err, res) => {
      //   if (err) logger(err.message, LogType.WARNING);
      //   console.log('res', res);
      //   return res;
      // });
      return new Promise((resolve, reject) => {
        pools.sqlite_db.all(text, (err, res) => {
          if (err) {
            logger(err.message, LogType.WARNING);
            reject(err);
          } else {
            resolve(res);
          }
        });
      });
    }
  },

  sampler(queryString) {
    return new Promise((resolve, reject) => {
      pools.sqlite_db.run('BEGIN', (err) => {
        if (err) {
          console.error(err.message);
          reject(err);
        } else {
          const startTime = performance.now();
          pools.sqlite_db.all(queryString, (err, res) => {
            if (err) {
              console.error(err.message);
              reject(err);
            } else {
              const endTime = performance.now();
              pools.sqlite_db.run('ROLLBACK', (err) => {
                if (err) {
                  console.error(err.message);
                  reject(err);
                } else {
                  const elapsedTime = endTime - startTime;
                  // console.log(`Elapsed time: ${elapsedTime} milliseconds`);
                  resolve(elapsedTime);
                }
              });
            }
          });
        }
      });
    });
  },

  // asdf check this.curRDS_MSQL_DB typing sometime
  /**
   * Only connect to one database at a time
   * @param db Name of database to connect to
   * @param dbType Type of database to connect to
   *
   */
  async connectToDB(db, dbType) {
    // change current Db
    console.log(db, 'THIS IS THE DB dbdbdbdbdb');
    if (dbType === DBType.Postgres) {
      this.curPG_DB = db;
      console.log('THIS IS in CONNECTTODB--curpgdb', this.curPG_DB);
      await connectionFunctions.PG_DBConnect(this.pg_uri, db);
    } else if (dbType === DBType.MySQL) {
      this.curMSQL_DB = db;
      await connectionFunctions.MSQL_DBQuery(db);
    } else if (dbType === DBType.RDSMySQL) {
      this.curRDS_MSQL_DB = db;
      await connectionFunctions.RDS_MSQL_DBQuery(db);
    } else if (dbType === DBType.RDSPostgres) {
      await connectionFunctions.RDS_PG_DBConnect(this.curRDS_PG_DB);
    } else if (dbType === DBType.SQLite) {
      await connectionFunctions.SQLite_DBConnect(this.curSQLite_DB.path);
    }
  },

  /**
   * Function to disconnect the passed in database type, in order to drop database
   * @param dbType type of database to disconnect
   */
  async disconnectToDrop(dbType) {
    if (dbType === DBType.Postgres) {
      // ending pool
      await connectionFunctions.PG_DBDisconnect();
    }
    if (dbType === DBType.SQLite) {
      try {
        // disconnect from and delete sqlite .db file
        pools.sqlite_db.close();
        fs.unlinkSync(this.curSQLite_DB.path);
        this.curSQLite_DB.path = '';
      } catch (e) {
        logger('FAILED TO DELETE SQLITE DB FILE', LogType.ERROR);
      }
    }
  },

  /**
   * When called with no arguments, returns listObj with this.databaseList populated with data from all logged-in databases.
   * When called with a dbName and dbType, additionally populates this.tableList with the tables under the named database
   * @param dbName defaults to ''
   * @param dbType optional argument
   * @returns promise that resolves to a listObj, containing database connection statuses, list of all logged in databases, and optional list of all tables under the named database
   */
  async getLists(dbName = '', dbType) {
    /*
    junaid
    this list object is what will be returned at the end of the function. function will get lists for all four databases depending on which is logged in
    */
    const listObj: DBList = {
      databaseConnected: {
        PG: false,
        MySQL: false,
        RDSPG: false,
        RDSMySQL: false,
        SQLite: false,
        directPGURI: false,
      },
      databaseList: [], // accumulates lists for each logged-in database
      tableList: [],
    };
    if (this.dbsInputted.pg) {
      try {
        const pgDBList = await this.getDBNames(DBType.Postgres);
        // console.log('pgDBList', pgDBList)
        listObj.databaseConnected.PG = true;
        listObj.databaseList = [...listObj.databaseList, ...pgDBList];
      } catch (error) {
        logger('COULDNT GET NAMES FROM LOCAL PG', LogType.ERROR);
      }
    }

    if (this.dbsInputted.msql) {
      try {
        const msqlDBList = await this.getDBNames(DBType.MySQL);
        listObj.databaseConnected.MySQL = true;
        listObj.databaseList = [...listObj.databaseList, ...msqlDBList];
      } catch (error) {
        logger('COULDNT GET NAMES FROM LOCAL MSQL', LogType.ERROR);
      }
    }

    if (this.dbsInputted.rds_msql) {
      try {
        const RDSmsqlDBList = await this.getDBNames(DBType.RDSMySQL);
        listObj.databaseConnected.RDSMySQL = true;
        listObj.databaseList = [...listObj.databaseList, ...RDSmsqlDBList];
      } catch (error) {
        logger('COULDNT GET NAMES FROM RDS MSQL', LogType.ERROR);
      }
    }

    if (this.dbsInputted.rds_pg) {
      try {
        const RDSpgDBList = await this.getDBNames(DBType.RDSPostgres);
        listObj.databaseConnected.RDSPG = true;
        listObj.databaseList = [...listObj.databaseList, ...RDSpgDBList];
      } catch (error) {
        logger('COULDNT GET NAMES FROM RDS PG', LogType.ERROR);
      }
    }

    if (this.dbsInputted.sqlite) {
      try {
        const sqliteDBList = await this.getDBNames(DBType.SQLite);
        // console.log('sqliteDBList', sqliteDBList)
        listObj.databaseConnected.SQLite = true;
        listObj.databaseList = [...listObj.databaseList, ...sqliteDBList];
      } catch (error) {
        logger('COULDNT GET NAMES FROM SQLite DB', LogType.ERROR);
      }
    }

    if (dbType) {
      try {
        const listData = await this.getDBLists(dbType, dbName);
        logger(
          `RESOLVING DB DETAILS: Fetched DB names along with Table List for DBType: ${dbType} and DB: ${dbName}`,
          LogType.SUCCESS,
        );
        listObj.tableList = listData;
      } catch (error) {
        logger(
          `COULNT GET DATABASE LIST FOR ${dbType} ${dbName} DATABASE`,
          LogType.ERROR,
        );
      }
    }
    // console.log(listObj);
    return listObj;
  },

  /**
   *
   * get column objects for the given tableName
   * @param tableName name of table to get the columns of
   * @param dbType type of database of the table
   * @returns
   */
  getTableInfo(tableName, dbType) {
    // Returns an array of columnObj given a tableName
    return this.getColumnObjects(tableName, dbType);
  },

  /**
   * Generate a dbList for the inputted database type
   * @param dbType server to get database names off of
   * @returns promise that resovles to a dbList (array of objects containing db_name, db_size, db_type)
   */
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
              for (let i = 0; i < databases.rows.length; i += 1) {
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
              for (let i = 0; i < databases[0].length; i += 1) {
                const data = databases[0][i];
                data.db_type = dbType;
                data.db_size = data.db_size ? `${data.db_size}KB` : '0KB';
                dbList.push(data);
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
      } else if (dbType === DBType.SQLite) {
        const dbList: dbDetails[] = [];
        const { path } = this.curSQLite_DB;
        const filename = path.slice(
          path.lastIndexOf('\\') + 1,
          path.lastIndexOf('.db'),
        );
        const stats = fs.statSync(path);
        const fileSizeInKB = stats.size / 1024;
        // Convert the file size to megabytes (optional)
        const data = {
          db_name: filename,
          db_size: `${fileSizeInKB}KB`,
          db_type: DBType.SQLite,
        };
        dbList.push(data);
        resolve(dbList);
      }
    });
  },

  /**
   * Generates a list of column objects for the inputted table name
   * @param tableName name of table to get column properties of
   * @param dbType type of database the table is in
   * @returns promise that resolves to array of columnObjects (column_name, data_type, character_maximum_length, is_nullable, constraint_name, constraint_type, foreign_table, foreign_column)
   */
  getColumnObjects(tableName, dbType) {
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
    }
    if (dbType === DBType.MySQL || dbType === DBType.RDSMySQL) {
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
            for (let i = 0; i < result[0].length; i += 1) {
              columnInfoArray.push(result[0][i]);
            }
            resolve(columnInfoArray);
          })
          .catch((err) => {
            reject(err);
          });
      });
    }

    if (dbType === DBType.SQLite) {
      const sqliteDB = pools.sqlite_db;
      queryString = `SELECT
      m.name AS table_name, 
      p.name AS column_name, 
      p.type AS data_type, 
      p.[notnull] AS not_null, 
      p.pk AS pk,
      fkl.[table] AS foreign_table, 
      fkl.[to] AS foreign_column
      FROM sqlite_master m
      LEFT JOIN pragma_table_info(m.name) p
      LEFT JOIN pragma_foreign_key_list(m.name) fkl
      ON p.name = fkl.[from]
      WHERE m.type = 'table' AND p.type != '' AND m.name = ?`;

      return new Promise((resolve, reject) => {
        sqliteDB.all(queryString, value, (err, rows) => {
          if (err) {
            reject(err);
          }
          const columnInfoArray: ColumnObj[] = [];
          for (let i = 0; i < rows.length; i++) {
            const {
              column_name,
              data_type,
              not_null,
              pk,
              foreign_table,
              foreign_column,
            } = rows[i];
            const newColumnObj: ColumnObj = {
              column_name,
              data_type,
              character_maximum_length: data_type.includes('(')
                ? parseInt(
                    data_type.slice(
                      1 + data_type.indexOf('('),
                      data_type.indexOf(')'),
                    ),
                    10,
                  )
                : null,
              is_nullable: not_null === 1 ? 'NO' : 'YES',
              constraint_type:
                pk === 1 ? 'PRIMARY KEY' : foreign_table ? 'FOREIGN KEY' : null,
              foreign_table,
              foreign_column,
            };
            columnInfoArray.push(newColumnObj);
          }
          resolve(columnInfoArray);
        });
      });
    }

    logger('Trying to use unknown DB Type: ', LogType.ERROR, dbType);
    // eslint-disable-next-line no-throw-literal
    throw 'Unknown db type';
  },

  /**
   * Uses dbType and dbName to find the tables under the specified database
   * @param dbType type of target database
   * @param dbName name of target database
   * @returns tableList (array of table detail objects containing table_catalog, table_schema, table_name, is_insertable_into, columns?)
   */
  getDBLists(dbType, dbName) {
    return new Promise((resolve, reject) => {
      let query;
      const tableList: TableDetails[] = [];
      const promiseArray: Promise<ColumnObj[]>[] = [];

      if (dbType === DBType.Postgres || dbType === DBType.RDSPostgres) {
        let pool;
        if (dbType === DBType.Postgres) pool = pools.pg_pool;
        if (dbType === DBType.RDSPostgres) pool = pools.rds_pg_pool;

        // querying PG metadata
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
                this.getColumnObjects(tables.rows[i].table_name, dbType),
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

        const query2 = `SELECT
        table_catalog,
        table_schema,
        table_name,
        is_insertable_into
        FROM information_schema.tables
        WHERE table_schema = 'public' or table_schema = 'base'
        ORDER BY table_name;`;

        //  query = `
        //  SELECT
        //  TABLE_CATALOG as table_schema,
        //  TABLE_SCHEMA as table_catalog,
        //  TABLE_NAME as table_name
        //  FROM information_schema.tables
        //  WHERE TABLE_SCHEMA NOT IN('information_schema', 'performance_schema', 'mysql')
        //  AND TABLE_SCHEMA = '${dbName}'
        //  ORDER BY table_name;`;

        query = `
         SELECT
         TABLE_CATALOG as table_schema,
         TABLE_SCHEMA as table_catalog,
         TABLE_NAME as table_name
         FROM information_schema.tables
         WHERE TABLE_SCHEMA NOT IN('information_schema', 'performance_schema', 'mysql', 'sys') 
         AND TABLE_SCHEMA = '${dbName}'
         ORDER BY table_name;`;

        pool
          // .query(query2)
          .query(query)
          .then((tables) => {
            for (let i = 0; i < tables[0].length; i++) {
              tableList.push(tables[0][i]);

              // Sys returns way too much stuff idk
              if (tableList[i].table_schema !== 'sys') {
                promiseArray.push(
                  this.getColumnObjects(tableList[i].table_name, dbType),
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
      } else if (dbType === DBType.SQLite) {
        const sqliteDB = pools.sqlite_db;

        // querying SQLite metadata
        query = `SELECT
        m.name AS table_name 
        FROM sqlite_master m
        WHERE m.type = 'table' AND m.name != 'sqlite_stat1' AND m.name != 'sqlite_sequence'`;
        sqliteDB.all(query, (err, rows) => {
          if (err) console.error(err.message);
          for (let i = 0; i < rows.length; i += 1) {
            const newTableDetails: TableDetails = {
              table_catalog: this.curSQLite_DB.path.slice(
                this.curSQLite_DB.path.lastIndexOf('\\') + 1,
              ),
              table_schema: 'asdf',
              table_name: rows[i].table_name,
              is_insertable_into: 'asdf',
            };
            tableList.push(newTableDetails);
            promiseArray.push(
              this.getColumnObjects(rows[i].table_name, dbType),
            );
          }
          Promise.all(promiseArray)
            .then((columnInfo) => {
              for (let i = 0; i < columnInfo.length; i += 1) {
                tableList[i].columns = columnInfo[i];
              }
              logger("SQLite 'getDBLists' resolved.", LogType.SUCCESS);
              resolve(tableList);
            })
            .catch((error) => {
              reject(error);
            });
        });
      }
    });
  },
};

module.exports = DBFunctions;
