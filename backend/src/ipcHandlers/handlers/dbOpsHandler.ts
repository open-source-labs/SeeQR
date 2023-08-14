import fs from 'fs';
import os from 'os';
import path from 'path';

// Types
import { DBList, LogType } from '../../../BE_types';
import { Feedback } from '../../../../shared/types/utilTypes';
import { DBType } from '../../../../shared/types/dbTypes';
// Helpers
import logger from '../../utils/logging/masterlog';
import docConfig from '../../models/configModel';
import helperFunctions from '../../utils/helperFunctions';

// Models
import connectionModel from '../../models/connectionModel';
import databaseModel from '../../models/databaseModel';
import queryModel from '../../models/queryModel';
// import db from '../../../models';

const {
  createDBFunc,
  dropDBFunc,
  runSQLFunc,
  runTARFunc,
  runFullCopyFunc,
  runHollowCopyFunc,
  promExecute,
} = helperFunctions;

// Local Types
interface DuplicatePayload {
  newName: string;
  sourceDb: string;
  withData: boolean;
}

interface ImportPayload {
  newDbName: string;
  filePath: string;
}

interface ExportPayload {
  sourceDb: string;
}

/**
 * EVENT: 'return-db-list'
 *
 * DEFINITION: returns a db-list from frontend. for Sidebar
 *
 * Process involes the following steps:
 * 1. connectionModel.setBaseConections
 * 2. get listObj from databaseModel.getLists
 */

export function returnDbList(event) {
  logger(
    "Received 'return-db-list' (Note: No Async being sent here)",
    LogType.RECEIVE,
  );
  console.log('Setting database connections...');
  connectionModel
    .setBaseConnections()
    .then(() => {
      console.log('Database connections set. Getting dblists...');
      databaseModel
        .getLists()
        .then((data: DBList) => {
          console.log(
            `Dblists acquired: ${JSON.stringify(data)}\nSending to frontend...`,
          );
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
            message: JSON.stringify(err),
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
}

/**
 * EVENT: 'select-db'
 *
 * DEFINITION: connect to selected db, then get object containing a list of all databases abd tables for the selected database, and sends to frontend. This is for ERD table view? check with Peter
 *
 * Process involes the following steps:
 * 1. connectionModel.connectToDB
 * 2. databaseModel.getLists
 * 3. returns getLists object back
 */

export async function selectDb(
  event,
  dbName: string,
  dbType: DBType,
): Promise<void> {
  logger("Received 'select-db'", LogType.RECEIVE);

  event.sender.send('async-started');
  try {
    if (dbName === '') {
      dbName = 'postgres';
    }
    await connectionModel.connectToDB(dbName, dbType);

    // we need a function that sends the dbType to the current "state" in the backend

    // send updated db info
    const dbsAndTables: DBList = await databaseModel.getLists(dbName, dbType);
    event.sender.send('db-lists', dbsAndTables);
    logger("Sent 'db-lists' from 'select-db'", LogType.SEND);
  } finally {
    event.sender.send('async-complete');
  }
}

/**
 * EVENT: 'drop-db'
 *
 * DEFINITION: Handler for drop-db requests from frontend
 *
 * Process involes the following steps:
 * 1. discoonect from all pools first with connectionModel.disconnectToDrop (is there no way to just disconnect from selected db?)
 * 2. reconnect immediately with everything but desired db of deletion with connectionModel.connectToDB
 * 3. use helper function dropDBFunc (a series of sql commands for each sql EXCEPT sqlite)
 * 4. databaseModel.getLists
 * 5. returns getLists object back
 */

export async function dropDb(
  event,
  dbName: string,
  currDB: boolean,
  dbType: DBType,
): Promise<void> {
  logger("Received 'drop-db'", LogType.RECEIVE);

  event.sender.send('async-started');

  try {
    // if deleting currently connected db, disconnect from db
    // end pool connection
    await connectionModel.disconnectToDrop(dbType);
    // reconnect to database server, but not the db that will be dropped
    if (dbType === DBType.Postgres) {
      await connectionModel.connectToDB('postgres', dbType);
    } else {
      await connectionModel.connectToDB('', dbType);
    }

    // await connectionModel.disconnectToDrop(dbType);
    // reconnect to database server, but not the db that will be dropped

    // await connectionModel.connectToDB('', dbType);

    // IN CASE OF EMERGENCY USE THIS CODE TO DROP DATABASES
    // WILL THROW UNCAUGHT ERRORS LAST RESORT ONLY!!!
    // await db.connectToDB('', dbType);
    // if(dbType === DBType.Postgres){
    //   await queryModel.query(`UPDATE pg_database SET datallowconn = 'false' WHERE datname = '${dbName}'`, null, dbType);
    //   await queryModel.query(`
    //   SELECT pid, pg_terminate_backend(pid)
    //   FROM pg_stat_activity
    //   WHERE datname = '${dbName}' AND pid <> pg_backend_pid();
    //   `, null, dbType);
    //   // await db.closeTheDB(dbName, dbType);
    // }

    // const dropDBScript = dropDBFunc(dbName, dbType);
    if (dbType !== DBType.SQLite)
      await queryModel.query(dropDBFunc(dbName, dbType), [], dbType);

    // send updated db info
    const dbsAndTables: DBList = await databaseModel.getLists(dbName, dbType);
    event.sender.send('db-lists', dbsAndTables);
    logger("Sent 'db-lists' from 'drop-db'", LogType.SEND);
  } finally {
    event.sender.send('async-complete');
  }
}

/**
 * EVENT: 'duplicate-db'
 *
 * DEFINITION: Handle duplicate-db events sent from frontend. Cleans up itself in event of failsure
 *
 * Process involes the following steps:
 * 1. create a temporary file path
 * 2. dump database (create a backup) to temporary file
 * 3. create new empty database with helper
 * 4. Run temporary file sql commands on the new empty database
 * 5. databaseModel.getLists
 * 6. returns getLists object back
 * 7. will cleanup the temp file after these operations
 */

export async function duplicateDb(
  event,
  { newName, sourceDb, withData }: DuplicatePayload,
  dbType: DBType,
) {
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
      await queryModel.query(createDBFunc(newName, dbType), [], dbType);
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
      await queryModel.query(dropDBScript, [], dbType);

      throw new Error('Failed to populate newly created database');
    }

    // update frontend with new db list
    const dbsAndTableInfo: DBList = await databaseModel.getLists('', dbType);
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
}

/**
 * EVENT: 'import-db'
 *
 * DEFINITION: Handle import-db events sent from frontend and cleans up after itself
 *
 * Process involes the following steps:
 * 1. create new empty database with helper
 * 2. populate db with new data
 * 3. databaseModel.getLists
 * 4. returns getLists object back
 */

export async function importDb(
  event,
  { newDbName, filePath }: ImportPayload,
  dbType: DBType,
) {
  logger(`Received 'import-db'" of dbType: ${dbType} and: `, LogType.RECEIVE);
  event.sender.send('async-started');

  try {
    // create new empty db
    await queryModel.query(createDBFunc(newDbName, dbType), [], dbType);

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
      await queryModel.query(dropDBScript, [], dbType);

      throw new Error('Failed to populate database');
    }

    // update frontend with new db list
    const dbsAndTableInfo: DBList = await databaseModel.getLists('', dbType);
    event.sender.send('db-lists', dbsAndTableInfo);
    logger("Sent 'db-lists' from 'import-db'", LogType.SEND);
  } finally {
    event.sender.send('async-complete');
  }
}

/**
 * EVENT: 'export-db'
 *
 * DEFINITION: exports a selected database to desktop
 *
 * Process involes the following steps:
 * 1. creates a temporary file on desktop
 * 2. create a function to dump to new file with helper function (poorly designed)
 * 3. use promExecute to execute function created above. this promExecute will run command shell to export the files. basically there is an internal timer in here for 5 seconds and if things do not copy after 5 seconds it terminates.
 * 4. send back a feedback to frontend based on pormExecute.
 */

export async function exportDb(
  event,
  { sourceDb }: ExportPayload,
  dbType: DBType,
) {
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
}
