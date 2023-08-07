// Types
import { DBList, LogType } from '../../../BE_types';
import { Feedback } from '../../../../shared/types/utilTypes';

// Helpers
import logger from '../../../Logging/masterlog';
import docConfig from '../../models/configModel';

// Models used
import connectionModel from '../../models/connectionModel';
import databaseModel from '../../models/databaseModel';

// TESTING GROUND:
import db from '../../../models';

/**
 * EVENT: 'set-config'
 *
 * DEFINITION: triggered when frontend 'saves' login information
 *
 * Process involes the following steps:
 * 1. saves login info to config
 * 2. run setBaseConnections from connectionModel.ts to make a new config
 * 3. uses get-config to get this latest config and sends it back to frontend
 */

export function setConfig(event, configObj) {
  // at some point change this name docConfig as well
  docConfig.saveConfig(configObj);

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
}

/**
 * EVENT: 'get-config'
 *
 * DEFINITION: get;s the current config (used during log in, or for new logins with set-config)
 *
 * Process involes the following steps:
 * 1. send back to event from configModel.ts docConfig.getFullConfig()
 */

export async function getConfig(event) {
  // asdf is configObj used?
  event.sender.send('get-config', docConfig.getFullConfig());
}
