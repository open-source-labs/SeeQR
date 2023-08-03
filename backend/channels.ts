/* eslint-disable no-console */
/* eslint-disable prefer-destructuring */
import { BrowserWindow, dialog, ipcMain } from 'electron'; // IPCMain: Communicate asynchronously from the main process to renderer processes
import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  ColumnObj,
  DBList,
  DBType,
  DummyRecords,
  LogType,
  QueryPayload,
} from './BE_types';
import generateDummyData from './DummyD/dummyDataMain';
import logger from './Logging/masterlog';
import docConfig from './_documentsConfig';
import backendObjToQuery from './ertable-functions';
import helperFunctions from './helperFunctions';

import { Feedback } from '../shared/types/utilTypes';
// import * as db from './models'; // to be integrated

import db from './models';

// import { Integer } from 'type-fest';

const {
  createDBFunc,
  dropDBFunc,
  explainQuery,
  runSQLFunc,
  runTARFunc,
  runFullCopyFunc,
  runHollowCopyFunc,
  promExecute,
} = helperFunctions;

// *************************************************** IPC Event Listeners *************************************************** //

/**
 * Handles set-config requests from frontend
 * triggered whenever save is pressed on the config/login page
 * establishes connections to database, logs failed connections, sends contents of config file
 */
ipcMain.handle('set-config', (event, configObj) => {
  docConfig.saveConfig(configObj); // saves login info from frontend into config file

  db.setBaseConnections() // tries to log in using config data
    .then(({ dbsInputted, configExists }) => {
      // error handling for trying and failing to log in to databases
      let errorStr = '';
      const dbs = Object.keys(dbsInputted);
      dbs.forEach((e) => {
        if (!dbsInputted[e] && configExists[e]) errorStr += ` ${e}`;
      });
      if (errorStr.length) {
        const err = `Unsuccessful login(s) for ${errorStr.toUpperCase()} database(s)`;
        const feedback: Feedback = {
          type: 'error',
          message: err,
        };
        event.sender.send('feedback', feedback);
      }
      logger('Successfully reset base connections', LogType.SUCCESS);
      db.getLists().then((data: DBList) => {
        event.sender.send('db-lists', data); // used to populate sidebar
      });
    })
    .catch((err) => {
      logger(
        `Error trying to set base connections on 'reset-connection': ${err.message}`,
        LogType.ERROR,
      );
      const feedback: Feedback = {
        type: 'error',
        message: err,
      };
      event.sender.send('feedback', feedback);
      logger(
        "Sent 'feedback' from 'reset-connection' (Note: This is an ERROR!)",
        LogType.ERROR,
      );
    })
    .finally(() => {
      event.sender.send('get-config', docConfig.getFullConfig());
    });
});

/**
 * Handles get-config request from frontend
 * sends configuration from config file
 */
ipcMain.handle('get-config', async (event) => {
  // asdf is configObj used?
  event.sender.send('get-config', docConfig.getFullConfig());
});

/**
 * Handles return-db-list request from the frontend
 * establishes connection to databases, then gets listObj from getLists, then sends to frontend
 */
ipcMain.on('return-db-list', (event) => {
  logger(
    "Received 'return-db-list' (Note: No Async being sent here)",
    LogType.RECEIVE,
  );

  db.setBaseConnections()
    .then(() => {
      db.getLists()
        .then((data: DBList) => {
          event.sender.send('db-lists', data);
          logger("Sent 'db-lists' from 'return-db-list'", LogType.SEND);
        })
        .catch((err) => {
          logger(
            `Error trying to get lists on 'return-db-list': ${err.message}`,
            LogType.ERROR,
          );
          const feedback: Feedback = {
            type: 'error',
            message: err,
          };
          event.sender.send('feedback', feedback);
          logger(
            "Sent 'feedback' from 'return-db-list' (Note: This is an ERROR!)",
            LogType.SEND,
          );
        });
    })
    .catch((err) => {
      logger(
        `Error trying to set base connections on 'return-db-list': ${err.message}`,
        LogType.ERROR,
      );
      const feedback: Feedback = {
        type: 'error',
        message: err,
      };
      event.sender.send('feedback', feedback);
      logger(
        "Sent 'feedback' from 'return-db-list' (Note: This is an ERROR!)",
        LogType.SEND,
      );
    });
});

/**
 * Handles select-db request from frontend
 * connect to selected db, then get object containing a list of all databases and a list of tables for the selected database, and sends to frontend
 */
ipcMain.handle(
  'select-db',
  async (event, dbName: string, dbType: DBType): Promise<void> => {
    console.log(
      dbName,
      dbType,
      'THIS IS IN CHANNELS.TS -- DB NAME AND DB TYPE',
    );
    logger("Received 'select-db'", LogType.RECEIVE);

    event.sender.send('async-started');
    try {
      await db.connectToDB(dbName, dbType);

      // send updated db info
      const dbsAndTables: DBList = await db.getLists(dbName, dbType);
      event.sender.send('db-lists', dbsAndTables);
      logger("Sent 'db-lists' from 'select-db'", LogType.SEND);
    } finally {
      event.sender.send('async-complete');
    }
  },
);

/**
 * Handler for drop-db requests from frontend
 * Drops the passed in DB and returns updated DB List
 */
ipcMain.handle(
  'drop-db',
  async (
    event,
    dbName: string,
    currDB: boolean,
    dbType: DBType,
  ): Promise<void> => {
    logger("Received 'drop-db'", LogType.RECEIVE);

    event.sender.send('async-started');

    try {
      // if deleting currently connected db, disconnect from db
      // end pool connection
      await db.disconnectToDrop(dbType);
      // reconnect to database server, but not the db that will be dropped
      await db.connectToDB('', dbType);

      // IN CASE OF EMERGENCY USE THIS CODE TO DROP DATABASES
      // WILL THROW UNCAUGHT ERRORS LAST RESORT ONLY!!!
      // await db.connectToDB('', dbType);
      // if(dbType === DBType.Postgres){
      //   await db.query(`UPDATE pg_database SET datallowconn = 'false' WHERE datname = '${dbName}'`, null, dbType);
      //   await db.query(`
      //   SELECT pid, pg_terminate_backend(pid)
      //   FROM pg_stat_activity
      //   WHERE datname = '${dbName}' AND pid <> pg_backend_pid();
      //   `, null, dbType);
      //   // await db.closeTheDB(dbName, dbType);
      // }

      const dropDBScript = dropDBFunc(dbName, dbType);
      if (dbType !== DBType.SQLite) await db.query(dropDBScript, [], dbType);

      // send updated db info
      const dbsAndTables: DBList = await db.getLists(dbName, dbType);
      event.sender.send('db-lists', dbsAndTables);
      logger("Sent 'db-lists' from 'drop-db'", LogType.SEND);
    } finally {
      event.sender.send('async-complete');
    }
  },
);

interface DuplicatePayload {
  newName: string;
  sourceDb: string;
  withData: boolean;
}

/**
 * Handle duplicate-db events sent from frontend. Cleans up after itself in
 * the event of failure
 */
ipcMain.handle(
  'duplicate-db',
  async (
    event,
    { newName, sourceDb, withData }: DuplicatePayload,
    dbType: DBType,
  ) => {
    logger(
      `Received 'duplicate-db'" of dbType: ${dbType} and: `,
      LogType.RECEIVE,
    );

    event.sender.send('async-started');

    const tempFilePath = path.resolve(
      `${docConfig.getConfigFolder()}/`,
      `temp_${newName}.sql`,
    );

    try {
      // dump database to temp file
      const dumpCmd = withData
        ? runFullCopyFunc(sourceDb, tempFilePath, dbType)
        : runHollowCopyFunc(sourceDb, tempFilePath, dbType);
      try {
        await promExecute(dumpCmd);
      } catch (e) {
        throw new Error(
          `Failed to dump ${sourceDb} to temp file at ${tempFilePath}`,
        );
      }

      // create new empty database
      try {
        await db.query(createDBFunc(newName, dbType), [], dbType);
      } catch (e) {
        throw new Error('Failed to create Database');
      }

      // run temp sql file on new database
      try {
        await promExecute(runSQLFunc(newName, tempFilePath, dbType));
      } catch (e: any) {
        // cleanup: drop created db
        logger(`Dropping duplicate db because: ${e.message}`, LogType.WARNING);
        const dropDBScript = dropDBFunc(newName, dbType);
        await db.query(dropDBScript, [], dbType);

        throw new Error('Failed to populate newly created database');
      }

      // update frontend with new db list
      const dbsAndTableInfo: DBList = await db.getLists('', dbType);
      event.sender.send('db-lists', dbsAndTableInfo);
      logger("Sent 'db-lists' from 'duplicate-db'", LogType.SEND);
    } finally {
      // clean up temp file
      try {
        fs.unlinkSync(tempFilePath);
      } catch (e) {
        event.sender.send('feedback', {
          type: 'error',
          message: `Failed to cleanup temp files. ${tempFilePath} could not be removed.`,
        });
      }

      event.sender.send('async-complete');
    }
  },
);

interface ImportPayload {
  newDbName: string;
  filePath: string;
}

/**
 * Handle import-db events sent from frontend. Cleans up after itself
 * in the event of failure
 */
ipcMain.handle(
  'import-db',
  async (event, { newDbName, filePath }: ImportPayload, dbType: DBType) => {
    logger(`Received 'import-db'" of dbType: ${dbType} and: `, LogType.RECEIVE);
    event.sender.send('async-started');

    try {
      // create new empty db
      await db.query(createDBFunc(newDbName, dbType), [], dbType);

      const ext = path.extname(filePath).toLowerCase();
      if (ext !== '.sql' && ext !== '.tar') {
        throw new Error('Invalid file extension');
      }

      const restoreCmd =
        ext === '.sql'
          ? runSQLFunc(newDbName, filePath, dbType)
          : runTARFunc(newDbName, filePath, dbType);

      try {
        // populate new db with data from file
        await promExecute(restoreCmd);
      } catch (e: any) {
        // cleanup: drop created db
        logger(`Dropping imported db because: ${e.message}`, LogType.WARNING);
        const dropDBScript = dropDBFunc(newDbName, dbType);
        await db.query(dropDBScript, [], dbType);

        throw new Error('Failed to populate database');
      }

      // update frontend with new db list
      const dbsAndTableInfo: DBList = await db.getLists('', dbType);
      event.sender.send('db-lists', dbsAndTableInfo);
      logger("Sent 'db-lists' from 'import-db'", LogType.SEND);
    } finally {
      event.sender.send('async-complete');
    }
  },
);

/*
look at this to check the explain might not support query error
*/
/**
 * Handle run-query events passed from the front-end, and send back an updated DB List
 * If error occurs, will rollback to pre-query state
 */
ipcMain.handle(
  'run-query',
  async (
    event,
    { targetDb, sqlString, selectedDb, runQueryNumber }: QueryPayload,
    dbType: DBType,
  ) => {
    logger(
      "Received 'run-query'",
      LogType.RECEIVE,
      `selectedDb: ${selectedDb} and dbType: ${dbType} and runQueryNumber: ${runQueryNumber}`,
    );
    event.sender.send('async-started');
    const arr: any[] = []; // array of sample
    const numberOfSample: number = runQueryNumber;
    let totalSampleTime: number = 0;
    let minimumSampleTime: number = 0;
    let maximumSampleTime: number = 0;
    let averageSampleTime: number = 0;

    function parseExplainExplanation(explain) {
      const regex =
        /actual time=(\d+\.\d+)\.\.(\d+\.\d+) rows=\d+ loops=(\d+)/g;
      const matches: any[] = Array.from(explain.matchAll(regex));
      let result: number = 0;

      for (let i = 0; i < matches.length; i += 1) {
        result +=
          (parseFloat(matches[i][2]) - parseFloat(matches[i][1])) *
          parseFloat(matches[i][3]);
      }
      return result;
    }

    try {
      let error: string | undefined;
      // connect to db to run query

      if (selectedDb !== targetDb) await db.connectToDB(targetDb, dbType);

      // Run Explain
      let explainResults;
      try {
        // console.log('start of try');
        for (let i = 0; i < numberOfSample; i++) {
          // console.log('start of for loopo');
          if (dbType === DBType.Postgres) {
            const results = await db.query(
              explainQuery(sqlString, dbType),
              [],
              dbType,
            );

            // console.log('query results', results);
            // console.log('explain query results', results[1].rows);
            // console.log('query plan including sample time data', results[1].rows[0]["QUERY PLAN"][0]);

            explainResults = results[1].rows;
            const eachSampleTime: any =
              results[1].rows[0]['QUERY PLAN'][0]['Planning Time'] +
              results[1].rows[0]['QUERY PLAN'][0]['Execution Time'];
            arr.push(eachSampleTime);
            totalSampleTime += eachSampleTime;
          } else if (dbType === DBType.MySQL) {
            const results = await db.query(
              explainQuery(sqlString, dbType),
              [],
              dbType,
            );
            const eachSampleTime: any = parseExplainExplanation(
              results[0][0].EXPLAIN,
            );
            arr.push(eachSampleTime);
            totalSampleTime += eachSampleTime;

            // hard coded explainResults just to get it working for now
            explainResults = {
              Plan: {
                'Node Type': 'Seq Scan',
                'Parallel Aware': false,
                'Async Capable': false,
                'Relation Name': 'newtable1',
                Schema: 'public',
                Alias: 'newtable1',
                'Startup Cost': 0,
                'Total Cost': 7,
                'Plan Rows': 200,
                'Plan Width': 132,
                'Actual Startup Time': 0.015,
                'Actual Total Time': 0.113,
                'Actual Rows': 200,
                'Actual Loops': 1,
                Output: ['newcolumn1'],
                'Shared Hit Blocks': 5,
                'Shared Read Blocks': 0,
                'Shared Dirtied Blocks': 0,
                'Shared Written Blocks': 0,
                'Local Hit Blocks': 0,
                'Local Read Blocks': 0,
                'Local Dirtied Blocks': 0,
                'Local Written Blocks': 0,
                'Temp Read Blocks': 0,
                'Temp Written Blocks': 0,
              },
              Planning: {
                'Shared Hit Blocks': 64,
                'Shared Read Blocks': 0,
                'Shared Dirtied Blocks': 0,
                'Shared Written Blocks': 0,
                'Local Hit Blocks': 0,
                'Local Read Blocks': 0,
                'Local Dirtied Blocks': 0,
                'Local Written Blocks': 0,
                'Temp Read Blocks': 0,
                'Temp Written Blocks': 0,
              },
              'Planning Time': 9999,
              Triggers: [],
              'Execution Time': 9999,
            };
          } else if (dbType === DBType.SQLite) {
            const sampleTime = await db.sampler(sqlString);
            arr.push(sampleTime);
            totalSampleTime += sampleTime;

            // hard coded explainResults just to get it working for now
            explainResults = {
              Plan: {
                'Node Type': 'Seq Scan',
                'Parallel Aware': false,
                'Async Capable': false,
                'Relation Name': 'newtable1',
                Schema: 'public',
                Alias: 'newtable1',
                'Startup Cost': 0,
                'Total Cost': 7,
                'Plan Rows': 200,
                'Plan Width': 132,
                'Actual Startup Time': 0.015,
                'Actual Total Time': 0.113,
                'Actual Rows': 200,
                'Actual Loops': 1,
                Output: ['newcolumn1'],
                'Shared Hit Blocks': 5,
                'Shared Read Blocks': 0,
                'Shared Dirtied Blocks': 0,
                'Shared Written Blocks': 0,
                'Local Hit Blocks': 0,
                'Local Read Blocks': 0,
                'Local Dirtied Blocks': 0,
                'Local Written Blocks': 0,
                'Temp Read Blocks': 0,
                'Temp Written Blocks': 0,
              },
              Planning: {
                'Shared Hit Blocks': 64,
                'Shared Read Blocks': 0,
                'Shared Dirtied Blocks': 0,
                'Shared Written Blocks': 0,
                'Local Hit Blocks': 0,
                'Local Read Blocks': 0,
                'Local Dirtied Blocks': 0,
                'Local Written Blocks': 0,
                'Temp Read Blocks': 0,
                'Temp Written Blocks': 0,
              },
              'Planning Time': 9999,
              Triggers: [],
              'Execution Time': 9999,
            };
          }
        }
        // get 5 decimal points for sample time
        minimumSampleTime = Math.round(Math.min(...arr) * 10 ** 5) / 10 ** 5;
        maximumSampleTime = Math.round(Math.max(...arr) * 10 ** 5) / 10 ** 5;
        averageSampleTime =
          Math.round((totalSampleTime / numberOfSample) * 10 ** 5) / 10 ** 5;
        totalSampleTime = Math.round(totalSampleTime * 10 ** 5) / 10 ** 5;
      } catch (e) {
        error =
          'Failed to get Execution Plan. EXPLAIN might not support this query.';
      }

      // Run Query
      let returnedRows;
      try {
        const results = await db.query(sqlString, [], dbType);
        if (dbType === DBType.MySQL) {
          // console.log('mySQL results', results);
          returnedRows = results[0];
          // console.log('returnedRows in channels for MySQL', returnedRows);
        }
        if (dbType === DBType.Postgres) {
          // console.log('results in channels for Postgres', results);
          returnedRows = results?.rows;
          // console.log('returnedRows in channels for Postgres', returnedRows);
        }
        if (dbType === DBType.SQLite) {
          returnedRows = results;
          // console.log('returnedRows in channels for SQLite', returnedRows)
        }
      } catch (e: any) {
        error = e.toString();
      }

      return {
        db: targetDb,
        sqlString,
        returnedRows,
        explainResults,
        error,
        numberOfSample,
        totalSampleTime,
        minimumSampleTime,
        maximumSampleTime,
        averageSampleTime,
      };
    } finally {
      // connect back to initialDb

      if (selectedDb !== targetDb) await db.connectToDB(selectedDb, dbType);

      // send updated db info in case query affected table or database information
      // must be run after we connect back to the originally selected so tables information is accurate
      const dbsAndTables: DBList = await db.getLists('', dbType);
      event.sender.send('db-lists', dbsAndTables);
      logger(
        "Sent 'db-lists' from 'run-query'",
        LogType.SEND,
        `selectedDb: ${selectedDb} -- targetDb: ${targetDb} -- dbType: ${dbType}`,
      );
      event.sender.send('async-complete');
    }
  },
);

interface ExportPayload {
  sourceDb: string;
}

ipcMain.handle(
  'export-db',
  async (event, { sourceDb }: ExportPayload, dbType: DBType) => {
    logger("Received 'export-db'", LogType.RECEIVE);
    event.sender.send('async-started');

    // store temporary file in user desktop
    const FilePath = path.resolve(os.homedir(), 'desktop', `${sourceDb}.sql`);

    let feedback: Feedback = {
      type: '',
      message: '',
    };

    try {
      // dump database to new file
      const dumpCmd = runFullCopyFunc(sourceDb, FilePath, dbType);

      try {
        await promExecute(dumpCmd);
        feedback = {
          type: 'success',
          message: `${sourceDb} Schema successfully exported to ${FilePath}`,
        };
        event.sender.send('feedback', feedback);
        logger("Sent 'feedback' from 'export-db'", LogType.SEND);
      } catch (e) {
        throw new Error(`Failed to dump ${sourceDb} to a file at ${FilePath}`);
      }
    } finally {
      event.sender.send('async-complete');
    }
  },
);

// leave this here since it is only used in this context
interface dummyDataRequestPayload {
  dbName: string;
  tableName: string;
  rows: number;
}

ipcMain.handle(
  // generate dummy data
  'generate-dummy-data',
  async (event, data: dummyDataRequestPayload, dbType: DBType) => {
    logger("Received 'generate-dummy-data'", LogType.RECEIVE);
    // send notice to front end that DD generation has been started
    event.sender.send('async-started');
    // console.log('genereatedata ipcMain dbType: ', dbType)
    let feedback: Feedback = {
      type: '',
      message: '',
    };
    try {
      // console.log('data in generate-dummy-data', data); // gets here fine

      // Retrieves the Primary Keys and Foreign Keys for all the tables
      const tableInfo: ColumnObj[] = await db.getTableInfo(
        data.tableName,
        dbType,
      ); // passed in dbType to second argument
      // console.log('tableInfo in generate-dummy-data', tableInfo); // working

      // generate dummy data
      const dummyArray: DummyRecords = await generateDummyData(
        tableInfo,
        data.rows,
      );
      // console.log('dummyArray output: ', dummyArray)
      // generate insert query string to insert dummy records
      const columnsStringified = '('
        .concat(dummyArray[0].join(', '))
        .concat(')');
      let insertQuery = `INSERT INTO ${data.tableName} ${columnsStringified} VALUES `;
      for (let i = 1; i < dummyArray.length - 1; i += 1) {
        const recordStringified = '('
          .concat(dummyArray[i].join(', '))
          .concat('), ');
        insertQuery = insertQuery.concat(recordStringified);
      }
      const lastRecordStringified = '('
        .concat(dummyArray[dummyArray.length - 1].join(', '))
        .concat(');');
      insertQuery = insertQuery.concat(lastRecordStringified);
      // insert dummy records into DB
      await db.query('Begin;', [], dbType);
      await db.query(insertQuery, [], dbType);
      await db.query('Commit;', [], dbType);
      feedback = {
        type: 'success',
        message: 'Dummy data successfully generated.',
      };
    } catch (err: any) {
      // rollback transaction if there's an error in insertion and send back feedback to FE
      await db.query('Rollback;', [], dbType);
      feedback = {
        type: 'error',
        message: err,
      };
    } finally {
      // console.log('dbType inside generate-dummy-data', dbType)
      // send updated db info in case query affected table or database information
      const dbsAndTables: DBList = await db.getLists('', dbType); // dummy data clear error is from here
      // console.log('dbsAndTables in generate-dummy-data', dbsAndTables)
      event.sender.send('db-lists', dbsAndTables); // dummy data clear error is from here

      // send feedback back to FE
      event.sender.send('feedback', feedback);

      // send notice to FE that DD generation has been completed
      event.sender.send('async-complete');

      logger(
        "Sent 'db-lists and feedback' from 'generate-dummy-data'",
        LogType.SEND,
      );
    }
  },
);

// handle initialization of a new schema from frontend (newSchemaView)
interface InitializePayload {
  newDbName: string;
}

ipcMain.handle(
  'initialize-db',
  async (event, payload: InitializePayload, dbType: DBType) => {
    logger(
      `Received 'initialize-db' of dbType: ${dbType} and: `,
      LogType.RECEIVE,
      payload,
    );
    event.sender.send('async-started');
    const { newDbName } = payload;

    try {
      // create new empty db
      await db.query(createDBFunc(newDbName, dbType), [], dbType);
      // connect to initialized db
      await db.connectToDB(newDbName, dbType);

      // update DBList in the sidebar to show this new db
      const dbsAndTableInfo: DBList = await db.getLists(newDbName, dbType);
      event.sender.send('db-lists', dbsAndTableInfo);
      ///
      logger("Sent 'db-lists' from 'initialize-db'", LogType.SEND);
    } catch (e) {
      const err = `Unsuccessful DB Creation for ${newDbName} in ${dbType} database`;
      const feedback: Feedback = {
        type: 'error',
        message: err,
      };
      event.sender.send('feedback', feedback);
      // in the case of an error, delete the created db
      // const dropDBScript = dropDBFunc(newDbName, dbType);
      // await db.query(dropDBScript, null, dbType);
      // throw new Error('Failed to initialize new database');
    } finally {
      event.sender.send('async-complete');
    }
  },
);

// handle updating schemas from the frontend (newSchemaView)
interface UpdatePayload {
  // targetDb: string;
  sqlString: string;
  selectedDb: string;
}

// Run query passed from the front-end, and send back an updated DB List
// DB will rollback if query is unsuccessful
ipcMain.handle(
  'update-db',
  async (event, { sqlString, selectedDb }: UpdatePayload, dbType: DBType) => {
    logger("Received 'update-db'", LogType.RECEIVE);
    event.sender.send('async-started');

    try {
      // connect to db to run query
      await db.connectToDB(selectedDb, dbType);

      // Run Query
      try {
        await db.query(sqlString, [], dbType);
      } catch (e) {
        if (e) throw new Error('Failed to update schema');
      }
    } finally {
      // send updated db info in case query affected table or database information
      // must be run after we connect back to the originally selected so tables information is accurate
      const dbsAndTables: DBList = await db.getLists('', dbType);
      event.sender.send('db-lists', dbsAndTables);
      logger("Sent 'db-lists' from 'update-db'", LogType.SEND);

      event.sender.send('async-complete');
    }
  },
);

// Generate and run query from react-flow ER diagram
ipcMain.handle(
  'ertable-schemaupdate',
  async (event, backendObj, dbName: string, dbType: DBType) => {
    logger(
      `Received 'ertable-schemaupdate' with dbType: ${dbType}, dbName: ${dbName}, and backendObj: `,
      LogType.RECEIVE,
      backendObj,
    );
    // send notice to front end that schema update has started
    event.sender.send('async-started');

    let feedback: Feedback = {
      type: '',
      message: '',
    };
    try {
      // Generates query from backendObj
      const query = backendObjToQuery(backendObj, dbType);

      // run sql command
      await db.query('Begin;', [], dbType);
      await db.query(query, [], dbType);
      await db.query('Commit;', [], dbType);
      feedback = {
        type: 'success',
        message: 'Database updated successfully.',
      };
      return 'success';
    } catch (err: any) {
      // rollback transaction if there's an error in update and send back feedback to FE
      await db.query('Rollback;', [], dbType);

      feedback = {
        type: 'error',
        message: err,
      };
    } finally {
      // send updated db info

      const updatedDb: DBList = await db.getLists(dbName, dbType);
      event.sender.send('db-lists', updatedDb);

      // send feedback back to FE
      event.sender.send('feedback', feedback);

      // send notice to FE that schema update has been completed
      event.sender.send('async-complete');

      logger(
        "Sent 'db-lists and feedback' from 'ertable-schemaupdate'",
        LogType.SEND,
      );
    }
  },
);

// ipc handler for when the showOpenDialog occurs currently linked to ConfigView.tsx.
// TODO: fix the type of any of the focused window. I cheated it.
ipcMain.handle('showOpenDialog', async (event, options) => {
  const focusedWindow: any = BrowserWindow.fromWebContents(event.sender);
  const result = await dialog.showOpenDialog(focusedWindow, options);
  return result.filePaths[0];
});

ipcMain.handle('showSaveDialog', async (event, options) => {
  const focusedWindow: any = BrowserWindow.fromWebContents(event.sender);
  const result = await dialog.showSaveDialog(focusedWindow, options);
  return result.filePath;
});

ipcMain.handle('feedback', async (event, options: { feedback: Feedback }) => {
  event.sender.send('feedback', options.feedback);
});
