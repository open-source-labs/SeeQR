import mysql from 'mysql2/promise';
import { Pool } from 'pg';
import { LogType } from './BE_types';
import logger from './Logging/masterlog';
import pools from './poolVariables';

const sqlite3 = require('sqlite3').verbose();

export default {
  /**
   * For a local Postgres database.
   * Uses passed in arguments to create a URI to create a pool, save it, and begin a connection.
   * @param pg_uri URI created in models.ts using login info
   * @param db Name of target database that the login has access to. Initially empty string
   */
  async PG_DBConnect(pg_uri: string, db: string) {
    const newURI = `${pg_uri}${db}`;
    const newPool = new Pool({ connectionString: newURI });
    pools.pg_pool = newPool;
    // await pools.pg_pool.connect(); this is unnecessary for making queries, and causes pg error when trying to drop db
    await pools.pg_pool.query('SELECT pg_database.datname FROM pg_database'); // this test query will throw an error if connection failed
  },

  async PG_DBDisconnect(): Promise<void> {
    await pools.pg_pool.end();
  },

  /**
   * For a local MySQL database.
   * If a connection already exists, end the connection.
   * Use passed in login info to create a new pool and save it.
   * @param MYSQL_CREDS https://github.com/mysqljs/mysql
   *    {
          host: `localhost`,
          port: MSQL_Cred.port,             from config file
          user: MSQL_Cred.user,             from config file
          password: MSQL_Cred.password,     from config file
          database: this.curMSQL_DB,        target database
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
          multipleStatements: true,
        }
   */
  async MSQL_DBConnect(MYSQL_CREDS: any) {
    if (pools.msql_pool) await pools.msql_pool.end();
    pools.msql_pool = await mysql.createPool({ ...MYSQL_CREDS });
  },

  /**
   * Checks that the MySQL database connection/pool is valid by running short query.
   * @param db Name of target MySQL database
   */
  MSQL_DBQuery(db: string) {
    pools.msql_pool
      .query(`USE ${db};`)
      .then(() => {
        logger(`Connected to MSQL DB: ${db}`, LogType.SUCCESS);
      })
      .catch(() => {
        logger(`Couldnt connect to MSQL DB: ${db}`, LogType.ERROR);
      });
  },

  /**
   * Create pool and connect to an RDS Postgres database using login info.
   * @param RDS_PG_INFO from config file
   */
  async RDS_PG_DBConnect(RDS_PG_INFO) {
    pools.rds_pg_pool = new Pool({ ...RDS_PG_INFO });
    await pools.rds_pg_pool.connect();
  },

  /**
   * End RDS MySQL pool if one exists.
   * Create/save new pool using login info.
   * @param RDS_MSQL_INFO from config file
   */
  async RDS_MSQL_DBConnect(RDS_MSQL_INFO) {
    if (pools.rds_msql_pool) await pools.rds_msql_pool.end();
    pools.rds_msql_pool = mysql.createPool({ ...RDS_MSQL_INFO });
  },

  /**
   * Checks that the MySQL database connection/pool is valid by running short query.
   * @param db name of target RDS MySQL database
   */
  RDS_MSQL_DBQuery(db: string) {
    pools.rds_msql_pool
      .query(`USE ${db};`)
      .then(() => {
        logger(`Connected to MSQL DB: ${db}`, LogType.SUCCESS);
      })
      .catch(() => {
        logger(`Couldnt connect to MSQL DB: ${db}`, LogType.ERROR);
      });
  },

  async SQLite_DBConnect(path: string): Promise<void> {
    const newDB = new sqlite3.Database(
      path,
      sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
      (err) => {
        if (err) return console.error(err.message);
      },
    );
    pools.sqlite_db = newDB;
  },
};
