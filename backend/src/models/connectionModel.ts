import fs from 'fs';
import docConfig from './configModel';
import { LogType } from '../../BE_types';
import { DBType, connectionModelType } from '../../../shared/types/dbTypes';
import connectionFunctions from '../db/databaseConnections';
import logger from '../utils/logging/masterlog';
import pools from '../db/poolVariables';

import dbState from './stateModel';

/*
README: "connectionModel" deals with business logic of connetion actions. This file dealswith logining and connections to different kinds of databases.
FUNCTIONS: setBaseConnections, connectToDB, disconnectToDrop
*/

// Functions
const connectionModel: connectionModelType = {
  setBaseConnections: async () => {
    dbState.mysql_options = docConfig.getCredentials(DBType.MySQL);
    dbState.pg_options = docConfig.getCredentials(DBType.Postgres);
    dbState.rds_pg_options = docConfig.getCredentials(DBType.RDSPostgres);
    dbState.rds_mysql_options = docConfig.getCredentials(DBType.RDSMySQL);
    dbState.sqlite_options = docConfig.getCredentials(DBType.SQLite);
    dbState.directPGURI_options = docConfig.getCredentials(DBType.directPGURI);

    const configExists = {
      pg: false,
      msql: false,
      rds_pg: false,
      rds_msql: false,
      sqlite: false,
      directPGURI: false,
    };
    /*
     all the if/else and try/catch in this function are for various forms of error handling.
     incorrect passwords/removed entries after successful logins
    */

    //  RDS PG POOL: truthy values means user has inputted info into config -> try to log in
    if (
      dbState.rds_pg_options.user &&
      dbState.rds_pg_options.password &&
      dbState.rds_pg_options.host
    ) {
      try {
        configExists.rds_pg = true;
        await connectionFunctions.RDS_PG_DBConnect(dbState.rds_pg_options);
        dbState.dbsInputted.rds_pg = true;
        logger('CONNECTED TO RDS PG DATABASE!', LogType.SUCCESS);
      } catch (error) {
        dbState.dbsInputted.rds_pg = false;
        logger('FAILED TO CONNECT TO RDS PG DATABASE', LogType.ERROR);
      }
    } else {
      configExists.rds_pg = false;
      dbState.dbsInputted.rds_pg = false;
    }

    //  RDS MSQL POOL: truthy values means user has inputted info into config -> try to log in
    if (
      dbState.rds_mysql_options.user &&
      dbState.rds_mysql_options.password &&
      dbState.rds_mysql_options.host
    ) {
      try {
        configExists.rds_msql = true;
        await connectionFunctions.RDS_MSQL_DBConnect(dbState.rds_mysql_options);

        // test query to make sure were connected. needed for the
        // catch statement to hit incase we arent connected.
        if (pools.rds_msql_pool === undefined)
          throw new Error('No RDS msql pool connected');
        await pools.rds_msql_pool.query('SHOW DATABASES;');
        logger('CONNECTED TO RDS MYSQL DATABASE!', LogType.SUCCESS);
        dbState.dbsInputted.rds_msql = true;
      } catch (error) {
        dbState.dbsInputted.rds_msql = false;
        logger('FAILED TO CONNECT TO RDS MSQL DATABASE', LogType.ERROR);
      }
    } else {
      configExists.rds_msql = false;
      dbState.dbsInputted.rds_msql = false;
    }

    //  LOCAL PG POOL: truthy values means user has inputted info into config -> try to connect
    if (dbState.pg_options.user && dbState.pg_options.password) {
      // Commented this out because switched to intersection type in DocConfigFile interface
      // if (typeof PG_Cred.password !== 'string') {
      //   const calledPass = PG_Cred.password();
      //   PG_Cred.password = await Promise.resolve(calledPass);
      // }
      console.log('SHOULD SEE THIS');
      dbState.pg_options.connectionString = `postgres://${dbState.pg_options.user}:${dbState.pg_options.password}@localhost:${dbState.pg_options.port}`;
      dbState.pg_options.database = 'postgres';
      try {
        configExists.pg = true;
        await connectionFunctions.PG_DBConnect(
          dbState.pg_options.connectionString,
          dbState.pg_options.database,
        );
        logger('CONNECTED TO LOCAL PG DATABASE', LogType.SUCCESS);
        dbState.dbsInputted.pg = true;
      } catch (error) {
        dbState.dbsInputted.pg = false;
        logger('FAILED TO CONNECT TO LOCAL PG DATABASE', LogType.ERROR);
      }
    } else {
      configExists.pg = false;
      dbState.dbsInputted.pg = false;
    }

    //  LOCAL MSQL POOL: truthy values means user has inputted info into config -> try to log in
    if (dbState.mysql_options.user && dbState.mysql_options.password) {
      try {
        configExists.msql = true;
        dbState.mysql_options = {
          ...dbState.mysql_options,
          host: 'localhost',
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
          multipleStatements: true,
        };
        await connectionFunctions.MSQL_DBConnect(dbState.mysql_options);

        // test query to make sure were connected. needed for the catch statement to hit incase we arent connected.
        if (pools.msql_pool === undefined)
          throw new Error('No active msql pool');
        await pools.msql_pool.query('SHOW DATABASES;');
        dbState.dbsInputted.msql = true;
        logger('CONNECTED TO LOCAL MYSQL DATABASE!', LogType.SUCCESS);
      } catch (error) {
        dbState.dbsInputted.msql = false;
        logger('FAILED TO CONNECT TO LOCAL MSQL DATABASE', LogType.ERROR);
      }
    } else {
      configExists.msql = false;
      dbState.dbsInputted.msql = false;
    }

    //  RDS PG POOL: truthy values means user has inputted info into config -> try to log in
    if (dbState.sqlite_options.filename) {
      try {
        configExists.sqlite = true;
        connectionFunctions.SQLite_DBConnect(dbState.sqlite_options.filename);
        dbState.dbsInputted.sqlite = true;
        logger('CONNECTED TO SQLITE DATABASE!', LogType.SUCCESS);
      } catch (error) {
        dbState.dbsInputted.sqlite = false;
        logger('FAILED TO CONNECT TO SQLITE DATABASE', LogType.ERROR);
      }
    } else {
      configExists.sqlite = false;
      dbState.dbsInputted.sqlite = false;
    }

    return { dbsInputted: dbState.dbsInputted, configExists };
  },

  // connectToDB : chooses what kind of database this is based on received dbType.
  connectToDB: async (db, dbType) => {
    // change current Db

    if (dbType === DBType.Postgres) {
      dbState.pg_options.database = db;

      if (dbState.pg_options.connectionString) {
        await connectionFunctions.PG_DBConnect(
          dbState.pg_options.connectionString,
          db,
        );
      } else {
        // handle case where connection string is undefined}
      }
    } else if (dbType === DBType.MySQL) {
      dbState.mysql_options.database = db;
      await connectionFunctions.MSQL_DBQuery(db);
    } else if (dbType === DBType.RDSMySQL) {
      dbState.rds_mysql_options.database = db;
      await connectionFunctions.RDS_MSQL_DBQuery(db);
    } else if (dbType === DBType.RDSPostgres) {
      await connectionFunctions.RDS_PG_DBConnect(dbState.rds_pg_options);
    } else if (dbType === DBType.SQLite) {
      connectionFunctions.SQLite_DBConnect(dbState.sqlite_options.filename);
    }
  },

  disconnectToDrop: async (dbType) => {
    if (dbType === DBType.Postgres) {
      // ending pool
      await connectionFunctions.PG_DBDisconnect();
    }
    if (dbType === DBType.SQLite) {
      try {
        // disconnect from and delete sqlite .db file
        pools.sqlite_db?.close();
        fs.unlinkSync(dbState.sqlite_options.filename);
        dbState.sqlite_options.filename = '';
      } catch (e) {
        logger('FAILED TO DELETE SQLITE DB FILE', LogType.ERROR);
      }
    }
  },
};

export default connectionModel;
