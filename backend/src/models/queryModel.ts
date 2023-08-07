// import { performance } from 'perf_hooks';

// import { LogType } from '../../BE_types';
// import { DBType, queryModelType } from '../../../shared/types/dbTypes';

// import logger from '../../Logging/masterlog';
// import pools from '../../poolVariables';

// // handles query functionalities

// // query(text, params, dbType)
// // picks which query to use depedning on dbtype

// /*
// README: "queryModel" deals with business logic of any incoming queries from the query sidebar*?. Implement furthur query functionalities here NOT ERDtable
// FUNCTIONS: query, sampler
// */

// // Functions
// const queryModel: queryModelType = {
//   query: (text, params, dbType) => {
//     // RUN ANY QUERY - function that will run query on database that is passed in.
//     logger(`Attempting to run query: \n ${text} for: \n ${dbType}`);

//     if (dbType === DBType.RDSPostgres) {
//       return pools.rds_pg_pool.query(text, params).catch((err) => {
//         logger(err.message, LogType.WARNING);
//       });
//     }

//     if (dbType === DBType.RDSMySQL) {
//       return pools.rds_msql_pool.query(text, params, dbType);
//     }

//     if (dbType === DBType.Postgres) {
//       return pools.pg_pool.query(text, params).catch((err) => {
//         logger(err.message, LogType.WARNING);
//       });
//     }

//     if (dbType === DBType.MySQL) {
//       // pools.msql_pool.query(`USE ${this.curMSQL_DB}`);
//       return pools.msql_pool.query(text, params, dbType);
//     }

//     if (dbType === DBType.SQLite) {
//       // return pools.sqlite_db.all(text, (err, res) => {
//       //   if (err) logger(err.message, LogType.WARNING);
//       //   console.log('res', res);
//       //   return res;
//       // });
//       return new Promise((resolve, reject) => {
//         pools.sqlite_db.all(text, (err, res) => {
//           if (err) {
//             logger(err.message, LogType.WARNING);
//             reject(err);
//           } else {
//             resolve(res);
//           }
//         });
//       });
//     }
//   },

//   sampler: (queryString) => {
//     return new Promise((resolve, reject) => {
//       pools.sqlite_db.run('BEGIN', (err) => {
//         if (err) {
//           console.error(err.message);
//           reject(err);
//         } else {
//           const startTime = performance.now();
//           pools.sqlite_db.all(queryString, (err, res) => {
//             if (err) {
//               console.error(err.message);
//               reject(err);
//             } else {
//               const endTime = performance.now();
//               pools.sqlite_db.run('ROLLBACK', (err) => {
//                 if (err) {
//                   console.error(err.message);
//                   reject(err);
//                 } else {
//                   const elapsedTime = endTime - startTime;
//                   // console.log(`Elapsed time: ${elapsedTime} milliseconds`);
//                   resolve(elapsedTime);
//                 }
//               });
//             }
//           });
//         }
//       });
//     });
//   },
// };

// export default queryModel;
