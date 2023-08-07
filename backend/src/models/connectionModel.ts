import fs from 'fs';
import docConfig from './configModel';
import { LogType } from '../../BE_types';
import { DBType, connectionModelType } from '../../../shared/types/dbTypes';
import connectionFunctions from '../../databaseConnections';
import logger from '../../Logging/masterlog';
import pools from '../../poolVariables';

import dbState from './stateModel';

/*
README: "connectionModel" deals with business logic of connetion actions. This file dealswith logining and connections to different kinds of databases.
FUNCTIONS: setBaseConnections, connectToDB, disconnectToDrop
*/

// Functions
const connectionModel: connectionModelType = {
  setBaseConnections: async () => {
    this.mysql_options = docConfig.getCredentials(DBType.MySQL);
    this.pg_options = docConfig.getCredentials(DBType.Postgres);
    console.log(this.pg_options);
    this.rds_pg_options = docConfig.getCredentials(DBType.RDSPostgres);
    this.rds_mysql_options = docConfig.getCredentials(DBType.RDSMySQL);
    this.sqlite_options = docConfig.getCredentials(DBType.SQLite);
    this.directPGURI_options = docConfig.getCredentials(DBType.directPGURI);

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
      this.rds_pg_options.user &&
      this.rds_pg_options.password &&
      this.rds_pg_options.host
    ) {
      try {
        configExists.rds_pg = true;
        await connectionFunctions.RDS_PG_DBConnect(this.rds_pg_options);
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
      this.rds_mysql_options.user &&
      this.rds_mysql_options.password &&
      this.rds_mysql_options.host
    ) {
      try {
        configExists.rds_msql = true;
        await connectionFunctions.RDS_MSQL_DBConnect(this.rds_mysql_options);

        // test query to make sure were connected. needed for the
        // catch statement to hit incase we arent connected.
        if (pools.rds_msql_pool === undefined)
          throw new Error('No RDS msql pool connected');
        await pools.rds_msql_pool.query('SHOW DATABASES;');
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
    if (this.pg_options.user && this.pg_options.password) {
      // Commented this out because switched to intersection type in DocConfigFile interface
      // if (typeof PG_Cred.password !== 'string') {
      //   const calledPass = PG_Cred.password();
      //   PG_Cred.password = await Promise.resolve(calledPass);
      // }
      console.log('SHOULD SEE THIS');
      this.pg_options.connectionString = `postgres://${this.pg_options.user}:${this.pg_options.password}@localhost:${this.pg_options.port}`;
      this.pg_options.database = 'postgres';
      try {
        configExists.pg = true;
        await connectionFunctions.PG_DBConnect(
          this.pg_options.connectionString,
          this.pg_options.database,
        );
        logger('CONNECTED TO LOCAL PG DATABASE', LogType.SUCCESS);
        this.dbsInputted.pg = true;
      } catch (error) {
        this.dbsInputted.pg = false;
        logger('FAILED TO CONNECT TO LOCAL PG DATABASE', LogType.ERROR);
      }
    } else {
      configExists.pg = false;
      this.dbsInputted.pg = false;
    }

    //  LOCAL MSQL POOL: truthy values means user has inputted info into config -> try to log in
    if (this.mysql_options.user && this.mysql_options.password) {
      try {
        configExists.msql = true;
        this.mysql_options = {
          ...this.mysql_options,
          host: 'localhost',
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
          multipleStatements: true,
        };
        await connectionFunctions.MSQL_DBConnect(this.mysql_options);

        // test query to make sure were connected. needed for the catch statement to hit incase we arent connected.
        if (pools.msql_pool === undefined)
          throw new Error('No active msql pool');
        await pools.msql_pool.query('SHOW DATABASES;');
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
    if (this.sqlite_options.filename) {
      try {
        configExists.sqlite = true;
        connectionFunctions.SQLite_DBConnect(this.sqlite_options.filename);
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

  query(text, params, dbType): Promise<unknown> | undefined {
    // RUN ANY QUERY - function that will run query on database that is passed in.
    logger(`Attempting to run query: \n ${text} for: \n ${dbType}`);

    if (dbType === DBType.RDSPostgres) {
      return pools.rds_pg_pool?.query(text, params).catch((err) => {
        logger(err.message, LogType.WARNING);
      });
    }

    if (dbType === DBType.RDSMySQL) {
      return pools.rds_msql_pool?.query(text, params);
    }

    if (dbType === DBType.Postgres) {
      return pools.pg_pool?.query(text, params).catch((err) => {
        logger(err.message, LogType.WARNING);
      });
    }

    if (dbType === DBType.MySQL) {
      // pools.msql_pool.query(`USE ${this.curMSQL_DB}`);
      return pools.msql_pool?.query(text, params);
    }

    if (dbType === DBType.SQLite) {
      // return pools.sqlite_db.all(text, (err, res) => {
      //   if (err) logger(err.message, LogType.WARNING);
      //   console.log('res', res);
      //   return res;
      // });
      return new Promise((resolve, reject) => {
        pools.sqlite_db?.all(text, (err, res) => {
          if (err) {
            logger(err.message, LogType.WARNING);
            reject(err);
          } else {
            resolve(res);
          }
        });
      });
    }
    return new Promise((resolve, reject) => {
      reject(Error('Invalid DB Type'));
    });
  },

  connectToDB: async (db, dbType) => {
    // change current Db
    if (dbType === DBType.Postgres) {
      this.pg_options.database = db;
      await connectionFunctions.PG_DBConnect(
        this.pg_options.connectionString || '',
        db,
      );
    } else if (dbType === DBType.MySQL) {
      this.mysql_options.database = db;
      await connectionFunctions.MSQL_DBQuery(db);
    } else if (dbType === DBType.RDSMySQL) {
      this.rds_mysql_options.database = db;
      await connectionFunctions.RDS_MSQL_DBQuery(db);
    } else if (dbType === DBType.RDSPostgres) {
      await connectionFunctions.RDS_PG_DBConnect(this.rds_pg_options);
    } else if (dbType === DBType.SQLite) {
      connectionFunctions.SQLite_DBConnect(this.sqlite_options.filename);
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
        fs.unlinkSync(this.sqlite_options.filename);
        this.sqlite_options.filename = '';
      } catch (e) {
        logger('FAILED TO DELETE SQLITE DB FILE', LogType.ERROR);
      }
    }
  },
};

export default connectionModel;
