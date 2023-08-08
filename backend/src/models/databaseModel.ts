import fs from 'fs';
import { Pool } from 'pg';
import { Pool as MSQLPool } from 'mysql2/promise';
import { RowDataPacket } from 'mysql2';
import {
  ColumnObj,
  dbDetails,
  DBList,
  DBType,
  LogType,
  TableDetails,
  databaseModelType,
} from '../../../shared/types/dbTypes';
import logger from '../utils/logging/masterlog';
import pools from '../db/poolVariables';

import dbState from './stateModel';

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
        console.log('trying to populate pg dbs');
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
    // console.log(listObj);
    return listObj;
  },

  // NEED TO LOOK INTO getTableInfo

  getTableInfo: (tableName, dbType) =>
    databaseModel.getColumnObjects(tableName, dbType),

  // NEED TO LOOK INTO getDBNames

  getDBNames: (dbType) =>
    new Promise((resolve, reject) => {
      let query: string;
      if (dbType === DBType.Postgres || dbType === DBType.RDSPostgres) {
        let pool: Pool | undefined; // changes which pool is being queried based on dbType

        if (dbType === DBType.Postgres) pool = pools.pg_pool;
        if (dbType === DBType.RDSPostgres) pool = pools.rds_pg_pool;
        if (pool === undefined) {
          reject(Error('No pool for Postgres DB'));
          return;
        }
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
            .query<{ db_name: string; db_size: string }>(query)
            .then((databases) => {
              for (let i = 0; i < databases.rows.length; i += 1) {
                const data = databases.rows[i];
                const { db_name } = data;

                if (
                  db_name !== 'postgres' &&
                  db_name !== 'template0' &&
                  db_name !== 'template1'
                ) {
                  dbList.push({ ...data, db_type: dbType });
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
        let pool: MSQLPool | undefined; // changes which pool is being queried based on dbType
        if (dbType === DBType.MySQL) pool = pools.msql_pool;
        if (dbType === DBType.RDSMySQL) pool = pools.rds_msql_pool;
        if (pool === undefined) {
          reject(Error('No pool for MySQL DB'));
          return;
        }

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
            .query<RowDataPacket[]>(query)
            .then((databases) => {
              for (let i = 0; i < databases[0].length; i += 1) {
                const data = databases[0][i];
                const filterData: dbDetails = {
                  db_type: dbType,
                  db_size: data.db_size ? `${data.db_size}KB` : '0KB',
                  db_name:
                    typeof data.db_name === 'string' ? data.db_name : 'ERROR',
                };
                data.db_type = dbType;
                data.db_size = data.db_size ? `${data.db_size}KB` : '0KB';
                data.db_name ??= 'ERROR';
                dbList.push(filterData);
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
        let { filename } = dbState.sqlite_options;
        filename = filename.slice(
          filename.lastIndexOf('\\') + 1,
          filename.lastIndexOf('.db'),
        );
        const stats = fs.statSync(filename);
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
    }),

  // THIS FUNCTION IS FKED

  getColumnObjects: (tableName, dbType) => {
    let queryString: string;
    const value = [tableName];
    if (dbType === DBType.Postgres || dbType === DBType.RDSPostgres) {
      // added to check for RDS
      let pool: Pool | undefined; // changes which pool is being queried based on dbType
      if (dbType === DBType.Postgres) pool = pools.pg_pool;
      if (dbType === DBType.RDSPostgres) pool = pools.rds_pg_pool;
      if (pool === undefined) {
        throw Error('No pool for psql DB');
      }
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
          ?.query<ColumnObj>(queryString, value)
          .then((result) => {
            const columnInfoArray: ColumnObj[] = [];
            for (let i = 0; i < result.rows.length; i += 1) {
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

      let pool: MSQLPool | undefined; // changes which pool is being queried based on dbType
      if (dbType === DBType.MySQL) pool = pools.msql_pool;
      if (dbType === DBType.RDSMySQL) pool = pools.rds_msql_pool;
      if (pool === undefined) {
        throw Error('No pool for mysql db');
      }
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
          ?.query<RowDataPacket[]>(queryString, value)
          .then((result) => {
            const columnInfoArray: ColumnObj[] = [];
            for (let i = 0; i < result[0].length; i += 1) {
              const data = result[0][i];
              const colObjFromData: ColumnObj = {
                column_name:
                  typeof data.column_data === 'string' ? data.column_data : '',
                data_type:
                  typeof data.data_type === 'string' ? data.data_type : '',
                character_maximum_length:
                  typeof data.character_maximum_length === 'number'
                    ? data.character_maximum_length
                    : null,
                is_nullable:
                  typeof data.is_nullable === 'string' ? data.is_nullable : '',
                constraint_type:
                  typeof data.constraint_type === 'string'
                    ? data.constraint_type
                    : null,
                foreign_table:
                  typeof data.foreign_table === 'string'
                    ? data.foreign_table
                    : null,
                foreign_column:
                  typeof data.foreign_column === 'string'
                    ? data.foreign_column
                    : null,
              };
              columnInfoArray.push(colObjFromData);
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
        sqliteDB?.all<{
          column_name: string;
          data_type: string;
          not_null: 0 | 1;
          pk: 0 | 1;
          foreign_table: string;
          foreign_column: string;
        }>(queryString, value, (err, rows) => {
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

  getDBLists: (dbType, dbName) =>
    new Promise((resolve, reject) => {
      let query: string;
      const tableList: TableDetails[] = [];
      const promiseArray: Promise<ColumnObj[]>[] = [];

      if (dbType === DBType.Postgres || dbType === DBType.RDSPostgres) {
        let pool: Pool | undefined;
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
          ?.query<TableDetails>(query)
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

        let pool: MSQLPool | undefined;
        if (dbType === DBType.MySQL) pool = pools.msql_pool;
        else pool = pools.rds_msql_pool;
        if (pool === undefined) {
          throw Error('No pool for msql DB');
        }

        // const query2 = `SELECT
        // table_catalog,
        // table_schema,
        // table_name,
        // is_insertable_into
        // FROM information_schema.tables
        // WHERE table_schema = 'public' or table_schema = 'base'
        // ORDER BY table_name;`;

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
          .query<RowDataPacket[]>(query)
          .then((tables) => {
            for (let i = 0; i < tables[0].length; i++) {
              const data = tables[0][i];
              const tableDetailsFromData: TableDetails = {
                table_catalog:
                  typeof data.table_catalog === 'string'
                    ? data.table_catalog
                    : '',
                table_schema:
                  typeof data.table_schema === 'string'
                    ? data.table_schema
                    : '',
                table_name:
                  typeof data.table_name === 'string' ? data.table_name : '',
                is_insertable_into:
                  typeof data.is_insertable_into === 'string'
                    ? data.is_insertable_into
                    : '',
              };
              tableList.push(tableDetailsFromData);

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
        sqliteDB?.all<{ table_name: string }>(query, (err, rows) => {
          if (err) console.error(err.message);
          for (let i = 0; i < rows.length; i += 1) {
            const newTableDetails: TableDetails = {
              table_catalog: dbState.sqlite_options.filename.slice(
                dbState.sqlite_options.filename.lastIndexOf('\\') + 1,
              ),
              table_schema: 'asdf',
              table_name: rows[i].table_name,
              is_insertable_into: 'asdf',
            };
            tableList.push(newTableDetails);
            promiseArray.push(
              databaseModel.getColumnObjects(rows[i].table_name, dbType),
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
    }),
};

export default databaseModel;
