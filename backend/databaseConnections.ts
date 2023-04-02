//ATTEMPT AT EXTRACTING TO ANOTHER FILE, NOT WORKING YET :(

const poolVariables = require('./models');
const { Pool } = require('pg');
const mysql = require('mysql2/promise');
import logger from './Logging/masterlog';
import { LogType } from './BE_types';

module.exports = {
  PG_DBConnect: async function (pg_uri: string, db: string) {
    const newURI = `${pg_uri}${db}`;
    const newPool = new Pool({ connectionString: newURI });
    if (poolVariables.pools.pg_pool) await poolVariables.pools.pg_pool.end();
    poolVariables.pools.pg_pool = newPool;
    logger(`New pool URI set: ${newURI}`, LogType.SUCCESS);
  },

  MSQL_DBConnect: async function (MYSQL_CREDS: any) {
    if (poolVariables.pools.msql_pool)
      await poolVariables.pools.msql_pool.end();
    poolVariables.pools.msql_pool = mysql.createPool({ ...MYSQL_CREDS });
  },

  MSQL_DBQuery: function (db: string) {
    poolVariables.pools.msql_pool
      .query(`USE ${db};`)
      .then(() => {
        logger(`Connected to MSQL DB: ${db}`, LogType.SUCCESS);
      })
      .catch((err) => {
        logger(`Couldnt connect to MSQL DB: ${db}`, LogType.ERROR);
      });
  },

  RDS_PG_DBConnect: async function (RDS_PG_INFO) {
    poolVariables.pools.rds_pg_pool = new Pool({ ...RDS_PG_INFO });
    poolVariables.pools.rds_pg_pool.connect((err) => {
      if (err) console.log(err, 'ERR PG');
      else console.log('CONNECTED TO RDS PG DATABASE!');
    });
  },

  RDS_MSQL_DBConnect: async function (RDS_MSQL_INFO) {
    if (poolVariables.pools.rds_msql_pool)
      await poolVariables.pools.rds_msql_pool.end();
    poolVariables.pools.rds_msql_pool = mysql.createPool({ ...RDS_MSQL_INFO });
    const testQuery = await poolVariables.pools.rds_msql_pool.query(
      'SHOW DATABASES;'
    ); //  just a test query to make sure were connected (it works, i tested with other queries creating tables too)
    console.log(
      `CONNECTED TO RDS ${testQuery[0][1].Database.toUpperCase()} DATABASE!`
    );
  },

  RDS_MSQL_DBQuery: function (db: string) {
    poolVariables.pools.rds_msql_pool
      .query(`USE ${db};`)
      .then(() => {
        logger(`Connected to MSQL DB: ${db}`, LogType.SUCCESS);
      })
      .catch((err) => {
        logger(`Couldnt connect to MSQL DB: ${db}`, LogType.ERROR);
      });
  },
};
