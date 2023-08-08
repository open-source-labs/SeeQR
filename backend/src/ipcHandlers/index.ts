import { ipcMain } from 'electron';

// // imports all other handlers to this index for main to require/import

import { setConfig, getConfig } from './handlers/authHandler';
import {
  intializeDb,
  updateDb,
  erTableSchemaUpdate,
  // REVIEW: Derek added getPath function.
  getPath,
} from './handlers/dbCRUDHandler';
import {
  returnDbList,
  selectDb,
  dropDb,
  duplicateDb,
  importDb,
  exportDb,
} from './handlers/dbOpsHandler';
import runQuery from './handlers/queryHandler';
import {
  dummyData,
  showOpenDialog,
  showSaveDialog,
  feedback,
} from './handlers/miscHandler';

// console.log('IPCHANDERS SUCCESSFUL');

// // auth
ipcMain.handle('set-config', setConfig);
ipcMain.handle('get-config', getConfig);

// // db Operations
ipcMain.on('return-db-list', returnDbList);
ipcMain.handle('select-db', selectDb);
ipcMain.handle('drop-db', dropDb);
ipcMain.handle('duplicate-db', duplicateDb);
ipcMain.handle('import-db', importDb);
ipcMain.handle('export-db', exportDb);
// REVIEW: Derek adding new handler for get file path.
ipcMain.handle('get-path', getPath);

// // db CRUD functionalities
ipcMain.handle('initialize-db', intializeDb);
ipcMain.handle('update-db', updateDb);
ipcMain.handle('ertable-schemaupdate', erTableSchemaUpdate);

// // // query
ipcMain.handle('run-query', runQuery);

// // // misc (other events bundled together)
ipcMain.handle('generate-dummy-date', dummyData);
ipcMain.handle('showOpenDialog', showOpenDialog);
ipcMain.handle('showSaveDialog', showSaveDialog);
ipcMain.handle('feedback', feedback);
