import { ipcMain } from 'electron'; // IPCMain: Communicate asynchronously from the main process to renderer processes
import path from 'path';
import fs from 'fs';
import os from 'os';
import helperFunctions from './helperFunctions';
import generateDummyData from './DummyD/dummyDataMain';
import { ColumnObj, DBList, DummyRecords, DBType, LogType } from './BE_types';
import backendObjToQuery from './ertable-functions';
import logger from './Logging/masterlog';

const db = require('./models');
const docConfig = require('./_documentsConfig');

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
interface Feedback {
  type: string;
  message: string;
}

// This isn't being used for anything ATM
ipcMain.handle('reset-connection', async (event) => {
  db.setBaseConnections()
    .then(() => {
      logger('Successfully reset base connections', LogType.SUCCESS);
    })
    .catch((err) => {
      logger(
        `Error trying to set base connections on 'reset-connection': ${err.message}`,
        LogType.ERROR
      );
      const feedback: Feedback = {
        type: 'error',
        message: err,
      };
      event.sender.send('feedback', feedback);
      logger(
        "Sent 'feedback' from 'reset-connection' (Note: This is an ERROR!)",
        LogType.SEND
      );
    });
});

// Listen for request from front-end and send back the DB List upon request
ipcMain.on('return-db-list', (event, dbType: DBType = DBType.Postgres) => {
  logger(
    "Received 'return-db-list' (Note: No Async being sent here)",
    LogType.RECEIVE
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
            LogType.ERROR
          );
          const feedback: Feedback = {
            type: 'error',
            message: err,
          };
          event.sender.send('feedback', feedback);
          logger(
            "Sent 'feedback' from 'return-db-list' (Note: This is an ERROR!)",
            LogType.SEND
          );
        });
    })
    .catch((err) => {
      logger(
        `Error trying to set base connections on 'return-db-list': ${err.message}`,
        LogType.ERROR
      );
      const feedback: Feedback = {
        type: 'error',
        message: err,
      };
      event.sender.send('feedback', feedback);
      logger(
        "Sent 'feedback' from 'return-db-list' (Note: This is an ERROR!)",
        LogType.SEND
      );
    });
});

// Listen for database changes sent from the renderer upon changing tabs
// and send back an updated DB List
ipcMain.handle(
  'select-db',
  async (event, dbName: string, dbType: DBType): Promise<void> => {
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
  }
);
// await db.query(dropDBScript, null, dbType);
// Deletes the DB that is passed from the front end and returns an updated DB List
ipcMain.handle(
  'drop-db',
  async (
    event,
    dbName: string,
    currDB: boolean,
    dbType: DBType
  ): Promise<void> => {
    logger("Received 'drop-db'", LogType.RECEIVE);

    event.sender.send('async-started');
    try {
      // if deleting currently connected db, disconnect from db
      if (currDB) await db.connectToDB('', dbType);

      // drop db
      const dropDBScript = dropDBFunc(dbName, dbType);
      await db.query(dropDBScript, null, dbType);

      // send updated db info
      const dbsAndTables: DBList = await db.getLists();
      event.sender.send('db-lists', dbsAndTables);
      logger("Sent 'db-lists' from 'drop-db'", LogType.SEND);
    } finally {
      event.sender.send('async-complete');
    }
  }
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
    dbType: DBType
  ) => {
    logger(
      `Received 'duplicate-db'" of dbType: ${dbType} and: `,
      LogType.RECEIVE
    );

    event.sender.send('async-started');

    // store temporary file in user desktop
    const tempFilePath = path.resolve(
      `${docConfig.getConfigFolder()}/`,
      `temp_${newName}.sql`
    );
    console.log(tempFilePath);
    try {
      // dump database to temp file
      const dumpCmd = withData
        ? runFullCopyFunc(sourceDb, tempFilePath, dbType)
        : runHollowCopyFunc(sourceDb, tempFilePath, dbType);
      try {
        await promExecute(dumpCmd);
      } catch (e) {
        throw new Error(
          `Failed to dump ${sourceDb} to temp file at ${tempFilePath}`
        );
      }

      // create new empty database
      try {
        await db.query(createDBFunc(newName, dbType), null, dbType);
      } catch (e) {
        throw new Error(`Failed to create Database`);
      }

      // run temp sql file on new database
      try {
        await promExecute(runSQLFunc(newName, tempFilePath, dbType));
      } catch (e) {
        // cleanup: drop created db
        const dropDBScript = dropDBFunc(newName, dbType);
        await db.query(dropDBScript);

        throw new Error('Failed to populate newly created database');
      }

      // update frontend with new db list
      const dbsAndTableInfo: DBList = await db.getLists();
      event.sender.send('db-lists', dbsAndTableInfo);
      logger("Sent 'db-lists' from 'duplicate-db'", LogType.SEND);
    } finally {
      //  //cleanup temp file
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
      await db.query(createDBFunc(newDbName, dbType), null, dbType);

      const ext = path.extname(filePath).toLowerCase();
      if (ext !== '.sql' && ext !== '.tar')
        throw new Error('Invalid file extension');

      const restoreCmd =
        ext === '.sql'
          ? runSQLFunc(newDbName, filePath, dbType)
          : runTARFunc(newDbName, filePath, dbType);

      try {
        // populate new db with data from file
        await promExecute(restoreCmd);
      } catch (e) {
        // cleanup: drop created db
        const dropDBScript = dropDBFunc(newDbName, dbType);
        await db.query(dropDBScript);

        throw new Error('Failed to populate database');
      }

      // update frontend with new db list
      const dbsAndTableInfo: DBList = await db.getLists();
      event.sender.send('db-lists', dbsAndTableInfo);
      logger("Sent 'db-lists' from 'import-db'", LogType.SEND);
    } finally {
      event.sender.send('async-complete');
    }
  }
);

interface QueryPayload {
  targetDb: string;
  sqlString: string;
  selectedDb: string;
}

// Run query passed from the front-end, and send back an updated DB List
// DB will rollback if query is unsuccessful
ipcMain.handle(
  'run-query',
  async (
    event,
    { targetDb, sqlString, selectedDb }: QueryPayload,
    dbType: DBType
  ) => {
    logger("Received 'run-query'", LogType.RECEIVE);
    event.sender.send('async-started');

    try {
      let error: string | undefined;
      // connect to db to run query
      if (selectedDb !== targetDb) await db.connectToDB(targetDb, dbType);

      // Run Explain
      let explainResults;
      try {
        const results = await db.query(explainQuery(sqlString, dbType));
        explainResults = results[1].rows;
      } catch (e) {
        error = `Failed to get Execution Plan. EXPLAIN might not support this query.`;
      }

      // Run Query
      let returnedRows;
      try {
        const results = await db.query(sqlString);
        returnedRows = results.rows;
      } catch (e: any) {
        error = e.toString();
      }

      return {
        db: targetDb,
        sqlString,
        returnedRows,
        explainResults,
        error,
      };
    } finally {
      // connect back to initialDb
      if (selectedDb !== targetDb) await db.connectToDB(selectedDb, dbType);

      // send updated db info in case query affected table or database information
      // must be run after we connect back to the originally selected so tables information is accurate
      const dbsAndTables: DBList = await db.getLists();
      event.sender.send('db-lists', dbsAndTables);
      logger("Sent 'db-lists' from 'run-query'", LogType.SEND);
      event.sender.send('async-complete');
    }
  }
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
  }
);

interface dummyDataRequestPayload {
  dbName: string;
  tableName: string;
  rows: number;
}

ipcMain.handle(
  'generate-dummy-data',
  async (event, data: dummyDataRequestPayload, dbType: DBType) => {
    logger("Received 'generate-dummy-data'", LogType.RECEIVE);
    // send notice to front end that DD generation has been started
    event.sender.send('async-started');

    let feedback: Feedback = {
      type: '',
      message: '',
    };
    try {
      // Retrieves the Primary Keys and Foreign Keys for all the tables
      const tableInfo: ColumnObj[] = await db.getTableInfo(data.tableName);

      // generate dummy data
      const dummyArray: DummyRecords = await generateDummyData(
        tableInfo,
        data.rows
      );
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
      await db.query('Begin;');
      await db.query(insertQuery);
      await db.query('Commit;');
      feedback = {
        type: 'success',
        message: 'Dummy data successfully generated.',
      };
    } catch (err: any) {
      // rollback transaction if there's an error in insertion and send back feedback to FE
      await db.query('Rollback;');
      feedback = {
        type: 'error',
        message: err,
      };
    } finally {
      // send updated db info in case query affected table or database information
      const dbsAndTables: DBList = await db.getLists();
      event.sender.send('db-lists', dbsAndTables);

      // send feedback back to FE
      event.sender.send('feedback', feedback);

      // send notice to FE that DD generation has been completed
      event.sender.send('async-complete');

      logger(
        "Sent 'db-lists and feedback' from 'generate-dummy-data'",
        LogType.SEND
      );
    }
  }
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
      payload
    );
    event.sender.send('async-started');

    const { newDbName } = payload;

    try {
      // create new empty db
      await db.query(createDBFunc(newDbName, dbType), null, dbType);

      // connect to initialized db
      await db.connectToDB(newDbName, dbType);

      // update DBList in the sidebar to show this new db
      const dbsAndTableInfo: DBList = await db.getLists();
      event.sender.send('db-lists', dbsAndTableInfo);
      logger("Sent 'db-lists' from 'initialize-db'", LogType.SEND);
    } catch (e) {
      // in the case of an error, delete the created db
      const dropDBScript = dropDBFunc(newDbName, dbType);
      await db.query(dropDBScript);
      throw new Error('Failed to initialize new database');
    } finally {
      event.sender.send('async-complete');
    }
  }
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
      let error: string | undefined;
      // connect to db to run query
      await db.connectToDB(selectedDb, dbType);

      // Run Query
      // let returnedRows;
      try {
        await db.query(sqlString);
      } catch (e) {
        if (e) throw new Error('Failed to update schema');
      }
    } finally {
      // send updated db info in case query affected table or database information
      // must be run after we connect back to the originally selected so tables information is accurate
      const dbsAndTables: DBList = await db.getLists();
      event.sender.send('db-lists', dbsAndTables);
      logger("Sent 'db-lists' from 'update-db'", LogType.SEND);

      event.sender.send('async-complete');
    }
  }
);

// Generate and run query from react-flow ER diagram
ipcMain.handle(
  'ertable-schemaupdate',
  async (event, backendObj, dbName: string, dbType: DBType) => {
    logger(
      `Received 'ertable-schemaupdate' with dbType: ${dbType}, dbName: ${dbName}, and backendObj: `,
      LogType.RECEIVE,
      backendObj
    );
    // send notice to front end that schema update has started
    event.sender.send('async-started');

    let feedback: Feedback = {
      type: '',
      message: '',
    };
    try {
      // Generates query from backendObj
      const query = backendObjToQuery(backendObj);
      // run sql command
      await db.query('Begin;', null, dbType);
      await db.query(query, null, dbType);
      await db.query('Commit;', null, dbType);
      feedback = {
        type: 'success',
        message: 'Database updated successfully.',
      };
      return 'success';
    } catch (err: any) {
      // rollback transaction if there's an error in update and send back feedback to FE
      await db.query('Rollback;', null, dbType);

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
        LogType.SEND
      );
    }
  }
);
