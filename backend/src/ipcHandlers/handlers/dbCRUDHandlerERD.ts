// Types
import { app } from 'electron';
import { DBList, LogType } from '../../../BE_types';
import { Feedback } from '../../../../shared/types/utilTypes';
import { ErdUpdatesType } from '../../../../shared/types/erTypes';
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

export async function erTableSchemaUpdate(event, updatesArray: ErdUpdatesType) {
  // send notice to front end that schema update has started
  event.sender.send('async-started');
  let feedback: Feedback = {
    type: '',
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
    // rollback transaction if there's an error in update and send back feedback to FE
    await queryModel.query('Rollback;', [], currentERD);

    feedback = {
      type: 'error',
      message: err,
    };
  } finally {
    // send updated db info

    const updatedDb: DBList = await databaseModel.getLists(
      currentDb,
      currentERD,
    );
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
