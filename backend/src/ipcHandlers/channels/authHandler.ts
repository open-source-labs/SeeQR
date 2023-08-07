/* eslint-disable no-console */
import { ipcMain } from 'electron'; // IPCMain: Communicate asynchronously from the main process to renderer processes
import { DBList, DocConfigFile, LogType } from '../../../BE_types';
import logger from '../../../Logging/masterlog';
import docConfig from '../../../_documentsConfig';

import { Feedback } from '.../../../shared/types/utilTypes';
// import * as db from './models'; // to be integrated

import db from '../../../models';

// *************************************************** IPC Event Listeners *************************************************** //

/**
 * Handles set-config requests from frontend
 * triggered whenever save is pressed on the config/login page
 * establishes connections to database, logs failed connections, sends contents of config file
 */
ipcMain.handle('set-config', (event, configObj: DocConfigFile) => {
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
      return db.getLists().then((data: DBList) => {
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
ipcMain.handle('get-config', (event) => {
  // asdf is configObj used?
  event.sender.send('get-config', docConfig.getFullConfig());
});
