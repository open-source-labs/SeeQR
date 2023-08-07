import fs from 'fs';
import {
  ColumnObj,
  dbDetails,
  DBList,
  LogType,
  TableDetails,
} from '../../BE_types';
import { DBType, databaseModelType } from '../../../shared/types/dbTypes';
import logger from '../../Logging/masterlog';
import pools from '../../poolVariables';

import dbState from './dbStateModel';

/*
README: "databaseModel" deals with business logic of connetion actions. This file dealswith logining and connections to different kinds of databases.
FUNCTIONS: getLists, getTableInfo, getDBNames, getColumnObjects, getDBLists
*/

// Functions
const databaseModel: databaseModelType = {
  // getLists: this list object is what will be returned at the end of the function. function will get lists for all four databases depending on which is logged in

  getLists: async (dbName = '', dbType) => {
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
    if (dbState.dbsInputted.pg) {
      try {
        const pgDBList = await databaseModel.getDBNames(DBType.Postgres);
        // console.log('pgDBList', pgDBList)
        listObj.databaseConnected.PG = true;
        listObj.databaseList = [...listObj.databaseList, ...pgDBList];
      } catch (error) {
        logger('COULDNT GET NAMES FROM LOCAL PG', LogType.ERROR);
      }
    }

    if (dbState.dbsInputted.msql) {
      try {
        const msqlDBList = await databaseModel.getDBNames(DBType.MySQL);
        listObj.databaseConnected.MySQL = true;
        listObj.databaseList = [...listObj.databaseList, ...msqlDBList];
      } catch (error) {
        logger('COULDNT GET NAMES FROM LOCAL MSQL', LogType.ERROR);
      }
    }

    if (dbState.dbsInputted.rds_msql) {
      try {
        const RDSmsqlDBList = await databaseModel.getDBNames(DBType.RDSMySQL);
        listObj.databaseConnected.RDSMySQL = true;
        listObj.databaseList = [...listObj.databaseList, ...RDSmsqlDBList];
      } catch (error) {
        logger('COULDNT GET NAMES FROM RDS MSQL', LogType.ERROR);
      }
    }

    if (dbState.dbsInputted.rds_pg) {
      try {
        const RDSpgDBList = await databaseModel.getDBNames(DBType.RDSPostgres);
        listObj.databaseConnected.RDSPG = true;
        listObj.databaseList = [...listObj.databaseList, ...RDSpgDBList];
      } catch (error) {
        logger('COULDNT GET NAMES FROM RDS PG', LogType.ERROR);
      }
    }

    if (dbState.dbsInputted.sqlite) {
      try {
        const sqliteDBList = await databaseModel.getDBNames(DBType.SQLite);
        // console.log('sqliteDBList', sqliteDBList)
        listObj.databaseConnected.SQLite = true;
        listObj.databaseList = [...listObj.databaseList, ...sqliteDBList];
      } catch (error) {
        logger('COULDNT GET NAMES FROM SQLite DB', LogType.ERROR);
      }
    }

    if (dbType) {
      try {
        const listData = await databaseModel.getDBLists(dbType, dbName);
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

    return listObj;
  },

  // NEED TO LOOK INTO getTableInfo

  getTableInfo: (tableName, dbType) => {
    return databaseModel.getColumnObjects(tableName, dbType);
  },

  // NEED TO LOOK INTO getDBNames

  getDBNames: (dbType) => {
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
        const { path } = dbState.curSQLite_DB;
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

  // THIS FUNCTION IS FKED

  getColumnObjects: (tableName, dbType) => {
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

  getDBLists: (dbType, dbName) => {
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
                databaseModel.getColumnObjects(
                  tables.rows[i].table_name,
                  dbType,
                ),
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
                  databaseModel.getColumnObjects(
                    tableList[i].table_name,
                    dbType,
                  ),
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
              table_catalog: dbState.curSQLite_DB.path.slice(
                dbState.curSQLite_DB.path.lastIndexOf('\\') + 1,
              ),
              table_schema: 'asdf',
              table_name: rows[i].table_name,
              is_insertable_into: 'asdf',
            };
            tableList.push(newTableDetails);
            promiseArray.push(
              databaseModel.getColumnObjects(rows[i].table_name, dbType), // for this dbState would need getColumnObjects... tricky
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

export default databaseModel;
