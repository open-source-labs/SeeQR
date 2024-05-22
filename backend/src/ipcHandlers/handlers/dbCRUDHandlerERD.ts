// Types
import { app } from 'electron';
import {
  DBListInterface,
  LogType,
  Feedback,
  ErdUpdatesType,
} from '../../../../shared/types/types';
import dbState from '../../models/stateModel';
// Helpers
import logger from '../../utils/logging/masterlog';
import erdUpdatesToQuery from '../../utils/erdTableFunctions';
// Models used
import databaseModel from '../../models/databaseModel';
import queryModel from '../../models/queryModel';
// import db from '../../../models';

/**
 * EVENT: 'ertable-schemaupdate'
 *
 * DEFINITION: ERD: Generate and run query from react-flow ER diagram
 *
 * Process involes the following steps:
 * 1. query from object passed back with helper updatesArray
 * 2. run queryModel.query on the sqlstring
 * 3. rollback if fail
 * 4. get tables and return to frontend
 *
 *
 */

export async function erTableSchemaUpdate(e, updatesArray: ErdUpdatesType) {
  // need to update return value and type strongly
  // send notice to front end that schema update has started
  e.sender.send('async-started');
  let feedback: Feedback = {
    type: 'success',
    message: '',
  };

  // get currentDBState
  const { currentERD, currentDb } = dbState;

  try {
    // Generates query srting from updatesArray
    const queryString = erdUpdatesToQuery(updatesArray, currentERD);

    // Query Transaction
    await queryModel.query('Begin;', [], currentERD); // transaction wrapper
    await queryModel.query(queryString, [], currentERD);
    await queryModel.query('Commit;', [], currentERD); // transaction wrapper

    feedback = {
      type: 'success',
      message: 'Database updated successfully.',
    };
    return 'success';
  } catch (err: any) {
    // (chore) strongly type err
    // rollback transaction if there's an error in update and send back feedback to FE
    await queryModel.query('Rollback;', [], currentERD);

    feedback = {
      type: 'error',
      message: err,
    };
  } finally {
    // send updated db info

    const updatedDb: DBListInterface = await databaseModel.getLists(
      currentDb,
      currentERD,
    );
    e.sender.send('db-lists', updatedDb);

    // send feedback back to FE
    e.sender.send('feedback', feedback);

    // send notice to FE that schema update has been completed
    e.sender.send('async-complete');

    logger(
      "Sent 'db-lists and feedback' from 'ertable-schemaupdate'",
      LogType.SEND,
    );
  }
}

export function getPath(e, pathType) {
  return app.getPath(pathType);
}
