import pools from './poolVariables';
const { Pool } = require('pg');
const mysql = require('mysql2/promise');
import logger from './Logging/masterlog';
import { LogType } from './BE_types';

export default {
  PG_DBConnect: async function (pg_uri: string, db: string) {
    const newURI = `${pg_uri}${db}`;
    const newPool = new Pool({ connectionString: newURI });
    pools.pg_pool = newPool;
    await pools.pg_pool.connect();
  },

  //////eric///////
  PG_DBclose: async function (pg_uri: string, db: string) {

    pools.pg_pool.end();
    // pools.pg_pool = null;
  },

  MSQL_DBConnect: async function (MYSQL_CREDS: any) {
    if (pools.msql_pool) await pools.msql_pool.end();
    pools.msql_pool = await mysql.createPool({ ...MYSQL_CREDS });
  },

  MSQL_DBQuery: function (db: string) {
    pools.msql_pool
      .query(`USE ${db};`)
      .then(() => {
        logger(`Connected to MSQL DB: ${db}`, LogType.SUCCESS);
      })
      .catch(() => {
        logger(`Couldnt connect to MSQL DB: ${db}`, LogType.ERROR);
      });
  },

  RDS_PG_DBConnect: async function (RDS_PG_INFO) {
    pools.rds_pg_pool = new Pool({ ...RDS_PG_INFO });
    await pools.rds_pg_pool.connect();
  },

  RDS_MSQL_DBConnect: async function (RDS_MSQL_INFO) {
    if (pools.rds_msql_pool) await pools.rds_msql_pool.end();
    pools.rds_msql_pool = mysql.createPool({ ...RDS_MSQL_INFO });
  },

  RDS_MSQL_DBQuery: function (db: string) {
    pools.rds_msql_pool
      .query(`USE ${db};`)
      .then(() => {
        logger(`Connected to MSQL DB: ${db}`, LogType.SUCCESS);
      })
      .catch(() => {
        logger(`Couldnt connect to MSQL DB: ${db}`, LogType.ERROR);
      });
  },
};
