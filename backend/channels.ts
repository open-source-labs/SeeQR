import { ipcMain } from 'electron'; // IPCMain: Communicate asynchronously from the main process to renderer processes
import path from 'path';
import fs from 'fs';
import os from 'os';
import helperFunctions from './helperFunctions';
import generateDummyData from './DummyD/dummyDataMain';
import { ColumnObj, DBList, DummyRecords } from './BE_types';

const db = require('./models');

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

// Listen for request from front-end and send back the DB List upon request
ipcMain.on('return-db-list', (event) => {
  db.getLists()
    .then((data: DBList) => {
      event.sender.send('db-lists', data);
    })
    .catch((err) => {
      const feedback: Feedback = {
        type: 'error',
        message: err,
      };
      event.sender.send('feedback', feedback);
    });
});

// Listen for database changes sent from the renderer upon changing tabs
// and send back an updated DB List
ipcMain.handle(
  'select-db',
  async (event, dbName: string): Promise<void> => {
    event.sender.send('async-started');
    try {
      await db.connectToDB(dbName);

      // send updated db info
      const dbsAndTables: DBList = await db.getLists();
      event.sender.send('db-lists', dbsAndTables);
    } finally {
      event.sender.send('async-complete');
    }
  }
);

// Deletes the DB that is passed from the front end and returns an updated DB List
ipcMain.handle('drop-db', async (event, dbName: string, currDB: boolean): Promise<void> => {
  event.sender.send('async-started');
  try {
    // if deleting currently connected db, disconnect from db
    if (currDB) await db.connectToDB('');

    // drop db
    const dropDBScript = dropDBFunc(dbName);
    await db.query(dropDBScript);

    // send updated db info
    const dbsAndTables: DBList = await db.getLists();
    event.sender.send('db-lists', dbsAndTables);
  } finally {
    event.sender.send('async-complete');
  }
});

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
  async (event, { newName, sourceDb, withData }: DuplicatePayload) => {
    event.sender.send('async-started');

    // store temporary file in user desktop
    const tempFilePath = path.resolve(
      os.homedir(),
      'desktop',
      `temp_${newName}.sql`
    );

    try {
      // dump database to temp file
      const dumpCmd = withData
        ? runFullCopyFunc(sourceDb, tempFilePath)
        : runHollowCopyFunc(sourceDb, tempFilePath);
      try {
        await promExecute(dumpCmd);
      } catch (e) {
        throw new Error(
          `Failed to dump ${sourceDb} to temp file at ${tempFilePath}`
        );
      }

      // create new empty database
      try {
        await db.query(createDBFunc(newName));
      } catch (e) {
        throw new Error(`Failed to create Database`);
      }

      // run temp sql file on new database
      try {
        await promExecute(runSQLFunc(newName, tempFilePath));
      } catch (e) {
        // cleanup: drop created db
        const dropDBScript = dropDBFunc(newName);
        await db.query(dropDBScript);

        throw new Error('Failed to populate newly created database');
      }

      // update frontend with new db list
      const dbsAndTableInfo: DBList = await db.getLists();
      event.sender.send('db-lists', dbsAndTableInfo);
    } finally {
      // cleanup temp file
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
  async (event, { newDbName, filePath }: ImportPayload) => {
    event.sender.send('async-started');
    try {
      // create new empty db
      await db.query(createDBFunc(newDbName));

      const ext = path.extname(filePath).toLowerCase();
      if (ext !== '.sql' && ext !== '.tar')
        throw new Error('Invalid file extension');

      const restoreCmd =
        ext === '.sql'
          ? runSQLFunc(newDbName, filePath)
          : runTARFunc(newDbName, filePath);

      try {
        // populate new db with data from file
        await promExecute(restoreCmd);
      } catch (e) {
        // cleanup: drop created db
        const dropDBScript = dropDBFunc(newDbName);
        await db.query(dropDBScript);

        throw new Error('Failed to populate database');
      }

      // update frontend with new db list
      const dbsAndTableInfo: DBList = await db.getLists();
      event.sender.send('db-lists', dbsAndTableInfo);
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
  async (event, { targetDb, sqlString, selectedDb }: QueryPayload) => {
    event.sender.send('async-started');
    try {
      let error: string | undefined;
      // connect to db to run query
      if (selectedDb !== targetDb) await db.connectToDB(targetDb);

      // Run Explain
      let explainResults;
      try {
        const results = await db.query(explainQuery(sqlString));
        explainResults = results[1].rows;
      } catch (e) {
        error = `Failed to get Execution Plan. EXPLAIN might not support this query.`;
      }

      // Run Query
      let returnedRows;
      try {
        const results = await db.query(sqlString);
        returnedRows = results.rows;
      } catch (e) {
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
      if (selectedDb !== targetDb) await db.connectToDB(selectedDb);

      // send updated db info in case query affected table or database information
      // must be run after we connect back to the originally selected so tables information is accurate
      const dbsAndTables: DBList = await db.getLists();
      event.sender.send('db-lists', dbsAndTables);

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
  async (event, data: dummyDataRequestPayload) => {
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
      const dummyArray: DummyRecords = await generateDummyData(tableInfo, data.rows);

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
    } catch (err) {
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
    }
  }
);
