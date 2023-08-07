// import fs from 'fs';
// import docConfig from './configModel';
// import { LogType } from '../../BE_types';
// import { DBType, connectionModelType } from '../../../shared/types/dbTypes';
// import connectionFunctions from '../../databaseConnections';
// import logger from '../../Logging/masterlog';
// import pools from '../../poolVariables';

// import dbState from './dbStateModel';

// /*
// README: "connectionModel" deals with business logic of connetion actions. This file dealswith logining and connections to different kinds of databases.
// FUNCTIONS: setBaseConnections, connectToDB, disconnectToDrop
// */

// // Functions
// const connectionModel: connectionModelType = {
//   setBaseConnections: async () => {
//     // code
//     const PG_Cred = docConfig.getCredentials(DBType.Postgres);
//     const MSQL_Cred = docConfig.getCredentials(DBType.MySQL);

//     // dbState.curPG_DB = docConfig.getCredentials(DBType.Postgres);
//     dbState.curRDS_PG_DB = docConfig.getCredentials(DBType.RDSPostgres);
//     dbState.curRDS_MSQL_DB = docConfig.getCredentials(DBType.RDSMySQL);
//     dbState.curSQLite_DB.path =
//       docConfig.getCredentials(DBType.SQLite)?.path ?? '';
//     dbState.curdirectPGURI_DB =
//       docConfig.getCredentials(DBType.directPGURI)?.uri ?? '';
//     const configExists = {
//       pg: false,
//       msql: false,
//       rds_pg: false,
//       rds_msql: false,
//       sqlite: false,
//       directPGURI: false,
//     };
//     /*
//      all the if/else and try/catch in dbState function are for various forms of error handling.
//      incorrect passwords/removed entries after successful logins
//     */

//     //  RDS PG POOL: truthy values means user has inputted info into config -> try to log in
//     if (
//       dbState.curRDS_PG_DB.user &&
//       dbState.curRDS_PG_DB.password &&
//       dbState.curRDS_PG_DB.host
//     ) {
//       try {
//         configExists.rds_pg = true;
//         await connectionFunctions.RDS_PG_DBConnect(dbState.curRDS_PG_DB);
//         dbState.dbsInputted.rds_pg = true;
//         logger('CONNECTED TO RDS PG DATABASE!', LogType.SUCCESS);
//       } catch (error) {
//         dbState.dbsInputted.rds_pg = false;
//         logger('FAILED TO CONNECT TO RDS PG DATABASE', LogType.ERROR);
//       }
//     } else {
//       configExists.rds_pg = false;
//       dbState.dbsInputted.rds_pg = false;
//     }

//     //  RDS MSQL POOL: truthy values means user has inputted info into config -> try to log in
//     if (
//       dbState.curRDS_MSQL_DB.user &&
//       dbState.curRDS_MSQL_DB.password &&
//       dbState.curRDS_MSQL_DB.host
//     ) {
//       try {
//         configExists.rds_msql = true;
//         await connectionFunctions.RDS_MSQL_DBConnect(dbState.curRDS_MSQL_DB);

//         // test query to make sure were connected. needed for the
//         // catch statement to hit incase we arent connected.
//         await pools.rds_msql_pool.query('SHOW DATABASES;');
//         logger('CONNECTED TO RDS MYSQL DATABASE!', LogType.SUCCESS);
//         dbState.dbsInputted.rds_msql = true;
//       } catch (error) {
//         dbState.dbsInputted.rds_msql = false;
//         logger('FAILED TO CONNECT TO RDS MSQL DATABASE', LogType.ERROR);
//       }
//     } else {
//       configExists.rds_msql = false;
//       dbState.dbsInputted.rds_msql = false;
//     }

//     //  LOCAL PG POOL: truthy values means user has inputted info into config -> try to connect
//     if (PG_Cred.user && PG_Cred.password) {
//       // eslint-disable-next-line no-console
//       console.log('dbState is PG CRED!!!!', PG_Cred);
//       // add to end of pg uri /postgres
//       dbState.pg_uri = `postgres://${PG_Cred.user}:${PG_Cred.password}@localhost:${PG_Cred.port}`;
//       console.log('dbState is dbState.pgURL~!!!!', dbState.pg_uri);
//       console.log('dbState is the dbState.cur DB!!!!~~', dbState.curPG_DB);
//       dbState.curPG_DB = 'postgres';
//       try {
//         configExists.pg = true;
//         await connectionFunctions.PG_DBConnect(
//           dbState.pg_uri,
//           dbState.curPG_DB,
//         );
//         logger('CONNECTED TO LOCAL PG DATABASE', LogType.SUCCESS);
//         dbState.dbsInputted.pg = true;
//       } catch (error) {
//         // eslint-disable-next-line no-console
//         console.log('THIS IS THE ERRORRR', error);
//         dbState.dbsInputted.pg = false;
//         // eslint-disable-next-line no-console
//         console.log(PG_Cred, 'THIS IS THE PG CRED!!!');
//         logger(
//           'FAILED TO CONNECT TO LOCAL PG DATABASE, hellohello',
//           LogType.ERROR,
//         );
//       }
//     } else {
//       configExists.pg = false;
//       dbState.dbsInputted.pg = false;
//     }

//     //  LOCAL MSQL POOL: truthy values means user has inputted info into config -> try to log in
//     if (MSQL_Cred.user && MSQL_Cred.password) {
//       try {
//         configExists.msql = true;
//         await connectionFunctions.MSQL_DBConnect({
//           host: 'localhost',
//           port: MSQL_Cred.port,
//           user: MSQL_Cred.user,
//           password: MSQL_Cred.password,
//           database: dbState.curMSQL_DB,
//           waitForConnections: true,
//           connectionLimit: 10,
//           queueLimit: 0,
//           multipleStatements: true,
//         });

//         // test query to make sure were connected. needed for the catch statement to hit incase we arent connected.
//         await pools.msql_pool.query('SHOW DATABASES;');
//         dbState.dbsInputted.msql = true;
//         logger('CONNECTED TO LOCAL MYSQL DATABASE!', LogType.SUCCESS);
//       } catch (error) {
//         dbState.dbsInputted.msql = false;
//         logger('FAILED TO CONNECT TO LOCAL MSQL DATABASE', LogType.ERROR);
//       }
//     } else {
//       configExists.msql = false;
//       dbState.dbsInputted.msql = false;
//     }

//     //  RDS PG POOL: truthy values means user has inputted info into config -> try to log in
//     if (dbState.curSQLite_DB.path) {
//       try {
//         configExists.sqlite = true;
//         await connectionFunctions.SQLite_DBConnect(dbState.curSQLite_DB.path);
//         dbState.dbsInputted.sqlite = true;
//         logger('CONNECTED TO SQLITE DATABASE!', LogType.SUCCESS);
//       } catch (error) {
//         dbState.dbsInputted.sqlite = false;
//         logger('FAILED TO CONNECT TO SQLITE DATABASE', LogType.ERROR);
//       }
//     } else {
//       configExists.sqlite = false;
//       dbState.dbsInputted.sqlite = false;
//     }

//     return { dbsInputted: dbState.dbsInputted, configExists };
//   },

//   connectToDB: async (db, dbType) => {
//     // code
//     // change current Db
//     // eslint-disable-next-line no-console
//     console.log(db, 'THIS IS THE DB dbdbdbdbdb');
//     if (dbType === DBType.Postgres) {
//       dbState.curPG_DB = db;
//       // eslint-disable-next-line no-console
//       console.log('THIS IS in CONNECTTODB--curpgdb', dbState.curPG_DB);
//       await connectionFunctions.PG_DBConnect(dbState.pg_uri, db);
//     } else if (dbType === DBType.MySQL) {
//       dbState.curMSQL_DB = db;
//       await connectionFunctions.MSQL_DBQuery(db);
//     } else if (dbType === DBType.RDSMySQL) {
//       dbState.curRDS_MSQL_DB = db;
//       await connectionFunctions.RDS_MSQL_DBQuery(db);
//     } else if (dbType === DBType.RDSPostgres) {
//       await connectionFunctions.RDS_PG_DBConnect(dbState.curRDS_PG_DB);
//     } else if (dbType === DBType.SQLite) {
//       await connectionFunctions.SQLite_DBConnect(dbState.curSQLite_DB.path);
//     }
//   },

//   disconnectToDrop: async (dbType) => {
//     // code
//     if (dbType === DBType.Postgres) {
//       // ending pool
//       await connectionFunctions.PG_DBDisconnect();
//     }
//     if (dbType === DBType.SQLite) {
//       try {
//         // disconnect from and delete sqlite .db file
//         pools.sqlite_db.close();
//         fs.unlinkSync(dbState.curSQLite_DB.path);
//         dbState.curSQLite_DB.path = '';
//       } catch (e) {
//         logger('FAILED TO DELETE SQLITE DB FILE', LogType.ERROR);
//       }
//     }
//   },
// };

// export default connectionModel;
