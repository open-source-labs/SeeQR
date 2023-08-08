import { BrowserWindow, dialog } from 'electron';

// Types
import {
  ColumnObj,
  DBList,
  DBType,
  DummyRecords,
  LogType,
} from '../../../BE_types';
import { Feedback } from '../../../../shared/types/utilTypes';

// Helpers
import generateDummyData from '../../utils/dummyData/dummyDataMain';
import logger from '../../utils/logging/masterlog';

// Models used
import databaseModel from '../../models/databaseModel';
import queryModel from '../../models/queryModel';
// import db from '../../../models';

/**
 * EVENT: 'generate-dummy-data'
 *
 * DEFINITION: makes dummy data with Faker
 *
 * Process involes the following steps:
 * 1. get primary and foreign keys for desired database with databaseModel.getTableInfo and put them in an array of objs
 * 2. generate dummy data based on array of objs with generateDummyData helper
 * 3. insert this data into the database it was generated for (poorly designed)
 * 3.1 run queryModel.query
 * 4 update with databaseModel.getLists since list is now updated (this is for every query doe, which is repetitive since not all queries affect the original databse )
 * 8. returns getLists object back
 *
 * ISSUES:
 * step 3 should not be written in our controllers. perhaps need better UI
 */

interface dummyDataRequestPayload {
  dbName: string;
  tableName: string;
  rows: number;
}

export async function dummyData(
  event,
  data: dummyDataRequestPayload,
  dbType: DBType,
) {
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
    const tableInfo: ColumnObj[] = await databaseModel.getTableInfo(
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
    const columnsStringified = '('.concat(dummyArray[0].join(', ')).concat(')');
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
    await queryModel.query('Begin;', [], dbType);
    await queryModel.query(insertQuery, [], dbType);
    await queryModel.query('Commit;', [], dbType);
    feedback = {
      type: 'success',
      message: 'Dummy data successfully generated.',
    };
  } catch (err: any) {
    // rollback transaction if there's an error in insertion and send back feedback to FE
    await queryModel.query('Rollback;', [], dbType);
    feedback = {
      type: 'error',
      message: err,
    };
  } finally {
    // console.log('dbType inside generate-dummy-data', dbType)
    // send updated db info in case query affected table or database information
    const dbsAndTables: DBList = await databaseModel.getLists('', dbType); // dummy data clear error is from here
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
}

/**
 * EVENT: 'showOpenDialog'
 *
 * DEFINITION: I blieve this is the window for choosing files to upload .Currently linked to ConfigView.tsx.
 *
 * Process involes the following steps:
 * 1. select a browerwindow
 * 2. open it with dialog.showOpenDialog
 *
 * PROBLEM:
 * "fix the type of any of the focused window. I cheated it."
 */

export async function showOpenDialog(event, options) {
  const focusedWindow: any = BrowserWindow.fromWebContents(event.sender);
  const result = await dialog.showOpenDialog(focusedWindow, options);
  return result.filePaths[0];
}

/**
 * EVENT: 'showSaveDialog'
 *
 * DEFINITION: I blieve this is the window for saving files to desktop. (?)
 *
 * Process involes the following steps:
 * 1. select a browerwindow
 * 2. open it with dialog.showOpenDialog
 */

export async function showSaveDialog(event, options) {
  const focusedWindow: any = BrowserWindow.fromWebContents(event.sender);
  const result = await dialog.showSaveDialog(focusedWindow, options);
  return result.filePath;
}

/**
 * EVENT: 'feedback'
 *
 * DEFINITION: For sending error messages. kind of tester
 *
 * Process involes the following steps:
 * 1. sends feedback to frontend
 */

export function feedback(event, options: { feedback: Feedback }) {
  event.sender.send('feedback', options);
}
