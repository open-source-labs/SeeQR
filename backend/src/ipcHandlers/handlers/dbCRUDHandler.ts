// Types
import { app } from 'electron';
import { BackendObjType, DBList, DBType, LogType } from '../../../BE_types';
import { Feedback } from '../../../../shared/types/utilTypes';

// Helpers
import logger from '../../utils/logging/masterlog';
import backendObjToQuery from '../../utils/ertable-functions';
import helperFunctions from '../../utils/helperFunctions';

// Models used
import connectionModel from '../../models/connectionModel';
import databaseModel from '../../models/databaseModel';
import queryModel from '../../models/queryModel';
// import db from '../../../models';

const { createDBFunc } = helperFunctions;

// Local Types

interface InitializePayload {
  // handle initialization of a new schema from frontend (newSchemaView)
  newDbName: string;
}

interface UpdatePayload {
  // handle updating schemas from the frontend (newSchemaView)
  // targetDb: string;
  sqlString: string;
  selectedDb: string;
}

/**
 * EVENT: 'initialize-db'
 *
 * DEFINITION: creates a new database on the side
 *
 * Process involes the following steps:
 * 1. create a new database with queryModel.query
 * 2. connect to this new db with connectionModel.connectToDB
 * 3. update sidebar with databaseModel.getLists
 * 4. send a feedback back to frontend
 */

export async function intializeDb(
  event,
  payload: InitializePayload,
  dbType: DBType,
) {
  logger(
    `Received 'initialize-db' of dbType: ${dbType} and: `,
    LogType.RECEIVE,
    payload,
  );
  event.sender.send('async-started');
  const { newDbName } = payload;

  try {
    // create new empty db
    await queryModel.query(createDBFunc(newDbName, dbType), [], dbType);
    // connect to initialized db
    await connectionModel.connectToDB(newDbName, dbType);

    // update DBList in the sidebar to show this new db
    const dbsAndTableInfo: DBList = await databaseModel.getLists(
      newDbName,
      dbType,
    );
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
}

/**
 * EVENT: 'update-db' (i would rename to db-schemaupdate)
 *
 * DEFINITION: SIDEBAR: updates selected database table's schema and send back updated list. db will rollback if query is unsuccessful
 *
 * Process involes the following steps:
 * 1. connect to the database to query (!)
 * 2. run queryModel.query on the sqlstring
 * 3. get tables and return to frontend
 *
 * ISSUES:
 * 1. shouldnt the current database be active? why do we need to connect it again? seems like this is an eeror checker step
 */

export async function updateDb(
  event,
  { sqlString, selectedDb }: UpdatePayload,
  dbType: DBType,
) {
  logger("Received 'update-db'", LogType.RECEIVE);
  event.sender.send('async-started');

  try {
    // connect to db to run query
    await connectionModel.connectToDB(selectedDb, dbType);

    // Run Query
    try {
      await queryModel.query(sqlString, [], dbType);
    } catch (e) {
      if (e) throw new Error('Failed to update schema');
    }
  } finally {
    // send updated db info in case query affected table or database information
    // must be run after we connect back to the originally selected so tables information is accurate
    const dbsAndTables: DBList = await databaseModel.getLists('', dbType);
    event.sender.send('db-lists', dbsAndTables);
    logger("Sent 'db-lists' from 'update-db'", LogType.SEND);

    event.sender.send('async-complete');
  }
}

/**
 * EVENT: 'ertable-schemaupdate'
 *
 * DEFINITION: ERD: Generate and run query from react-flow ER diagram
 *
 * Process involes the following steps:
 * 1. query from object passed back with helper backendObjToQuery
 * 2. run queryModel.query on the sqlstring
 * 3. rollback if fail
 * 4. get tables and return to frontend
 *
 * SUGGESTION: honestly, i would make a copy of a file if we are working on it in the ERD view. this way we can just iterate over this copy and replace the original one instead of the current UI of saving twice
 *
 * QUESTION: what is the event sent back when we hit SAVE in the ER diagram?
 */

export async function erTableSchemaUpdate(
  event,
  backendObj: BackendObjType,
  dbName: string,
  dbType: DBType,
) {
  logger(
    `backendObj: ${dbType}, \n
    dbName: ${dbName}, \n`,
    LogType.RECEIVE,
    backendObj,
  );

  console.log('backendObj: ', backendObj);

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
    await queryModel.query('Begin;', [], dbType);
    await queryModel.query(query, [], dbType);
    await queryModel.query('Commit;', [], dbType);
    feedback = {
      type: 'success',
      message: 'Database updated successfully.',
    };
    return 'success';
  } catch (err: any) {
    // rollback transaction if there's an error in update and send back feedback to FE
    await queryModel.query('Rollback;', [], dbType);

    feedback = {
      type: 'error',
      message: err,
    };
  } finally {
    // send updated db info

    const updatedDb: DBList = await databaseModel.getLists(dbName, dbType);
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
}

export function getPath(event, pathType) {
  return app.getPath(pathType);
}
