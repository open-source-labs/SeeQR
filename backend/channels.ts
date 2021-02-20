import { ipcMain } from 'electron'; // IPCMain: Communicate asynchronously from the main process to renderer processes
import path from 'path';
import fs from 'fs';
import os from 'os';
import helperFunctions from './helperFunctions';

const db = require('./models');
const { generateDummyData, writeCSVFile } = require('./DummyD/dummyDataMain'); // TODO: take out destructuring once merged with upstream

const {
  createDBFunc,
  dropDBFunc,
  explainQuery,
  runSQLFunc,
  runTARFunc,
  runFullCopyFunc,
  runHollowCopyFunc,
  execute, // TODO: delete once merged with upstream
  promExecute,
} = helperFunctions;

// *************************************************** IPC Event Listeners *************************************************** //

interface dbDetails {
  db_name: string;
  db_size: string;
}
interface ColumnObj {
  column_name: string;
  data_type: string;
  character_maximum_length: number | null;
  is_nullable: string;
  constraint_type: string;
  foreign_table: string;
  foreign_column: string;
}
interface TableDetails {
  table_catalog: string;
  table_schema: string;
  table_name: string;
  is_insertable_into: string;
  column?: ColumnObj[];
}
interface DBList {
  databaseList: dbDetails[];
  tableList: TableDetails[];
}

ipcMain.on('return-db-list', (event) => {
  db.getLists()
    .then((data: DBList) => {
      event.sender.send('db-lists', data);
    })
    .catch((err) => {
      const feedback = {
        type: 'error',
        message: err,
      };
      event.sender.send('feedback', feedback);
    });
});

// Listen for database changes sent from the renderer upon changing tabs.
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

// Deletes the dbName that is passed from the front end and returns the DB List
ipcMain.handle('drop-db', async (event, dbName: string, currDB: boolean) => {
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

ipcMain.handle(
  'run-query',
  async (event, { targetDb, sqlString, selectedDb }: QueryPayload) => {
    event.sender.send('async-started');
    try {
      let error: string | undefined
      // connect to db to run query
      if (selectedDb !== targetDb) await db.connectToDB(targetDb);

      // Run Explain
      let explainResults
      try {
        const results = await db.query(explainQuery(sqlString));
        explainResults = results[1].rows;
      } catch (e) {
        error = `Failed to get Execution Plan. EXPLAIN might not support this query.`
      }

      // Run Query
      let returnedRows
      try {
        const results = await db.query(sqlString);
        returnedRows = results.rows
      } catch (e) {
        error = e.toString()
      }

      return {
        db: targetDb,
        sqlString,
        returnedRows,
        explainResults,
        error
      }
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

interface dummyDataRequestType {
  dbName: string;
  tableName: string;
  rows: number;
}

ipcMain.on('generate-dummy-data', async (event: any, data: dummyDataRequestType) => {
  // send notice to front end that DD generation has been started
  event.sender.send('async-started');
  const dummyDataRequest: dummyDataRequestType = data;
  try {
    // Retrieves the Primary Keys and Foreign Keys for all the tables
    const tableInfo = await db.getTableInfo(data.tableName);
    console.log('tableInfo: ', tableInfo);
    const dummyArray = await generateDummyData(tableInfo, data.rows);
    console.log('dummyArray: ', dummyArray);
    const dummyArrayStringified = [] as any;
    const columnsStringified = '('.concat(dummyArray[0].join(', ')).concat(')');
    let insertQuery = `INSERT INTO ${data.tableName} ${columnsStringified} VALUES `;
    for (let i = 1; i < dummyArray.length - 1; i += 1) {
      const recordStringified = '('.concat(dummyArray[i].join(', ')).concat('), ');
      insertQuery = insertQuery.concat(recordStringified)
    };
    const lastRecordStringified = '('.concat(dummyArray[dummyArray.length - 1].join(', ')).concat(');');
    insertQuery = insertQuery.concat(lastRecordStringified);
    console.log(insertQuery);
    await db.query('Begin;');
    await db.query(insertQuery);
    await db.query('Commit;');
    event.sender.send('async-complete');
  } catch(err) {
    await db.query('Rollback;');
    const feedback = {
      type: 'error',
      message: err,
    };
    event.sender.send('feedback', feedback);
  }
});

// INSERT INTO products (product_no, name, price) VALUES
//     (1, 'Cheese', 9.99),
//     (2, 'Bread', 1.99),
//     (3, 'Milk', 2.99);


// ipcMain.on('generate-dummy-data', (event: any, data: dummyDataRequestType) => {
//   // send notice to front end that DD generation has been started
//   event.sender.send('async-started');
//   let schemaLayout: any;
//   const dummyDataRequest: dummyDataRequestType = data; // { schemaName: 'hello', dummyData: { people: 1 } }
//   let tableMatricesArray: any;
//   let keyObject: any = 'Unresolved';

//   // Retrieves the Primary Keys and Foreign Keys for all the tables
//   //   tableName: { primaryKeyColumns: { _id: true }, foreignKeyColumns: { key: value, key: value} },
//   db.createKeyObject().then((result) => {
//     keyObject = result;
//     // Iterating over the passed in keyObject to remove the primaryKeyColumn and all foreignKeyColumns from table
//     // db.dropKeyColumns(keyObject).then(() => {
//     // db.addNewKeyColumns(keyObject).then(() => {
//     db.getSchemaLayout().then((schemaLayoutResult) => {
//       console.log('schemaLayout: ', schemaLayoutResult);
//       console.log('films layout: ', schemaLayoutResult.tables.films[0]);
//       console.log('films layout: ', schemaLayoutResult.tables.films[1]);
//       schemaLayout = schemaLayoutResult;
//       // generate the dummy data and save it into matrices associated with table names
//       tableMatricesArray = generateDummyData(
//         schemaLayout,
//         dummyDataRequest,
//         keyObject
//       );
//       // iterate through tableMatricesArray to write individual .csv files
//       for (const tableObject of tableMatricesArray) {
//         // write all entries in tableMatrix to csv file
//         writeCSVFile(
//           tableObject,
//           schemaLayout,
//           keyObject,
//           dummyDataRequest,
//           event
//         );
//       }
//     });
//   });
// });

export default execute;
