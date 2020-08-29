// main.js is the entry point to the main process (the node process)

// Import parts of electron to use
import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import { join } from 'path';
import { format } from 'url';
import { Children } from 'react';
const { exec } = require('child_process');
const appMenu = require('./mainMenu');
const db = require('./modal');
const path = require('path');
/************************************************************
 ********* CREATE & CLOSE WINDOW UPON INITIALIZATION *********
 ************************************************************/
// Keep a global reference of the window objects, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: any;

let mainMenu = Menu.buildFromTemplate(require('./mainMenu'));
// Keep a reference for dev mode
let dev = false;
if (process.env.NODE_ENV !== undefined && process.env.NODE_ENV === 'development') {
  dev = true;
}

// Create browser window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1800,
    height: 1400,
    minWidth: 900,
    minHeight: 720,
    title: 'SeeQR',
    show: false,
    webPreferences: { nodeIntegration: true, enableRemoteModule: true },
    icon: path.join(__dirname, '../../frontend/assets/images/seeqr_dock.png'),
  });
  if (process.platform === 'darwin') {
    app.dock.setIcon(path.join(__dirname, '../../frontend/assets/images/seeqr_dock.png'));
  }

  // Load index.html of the app
  let indexPath;
  if (dev && process.argv.indexOf('--noDevServer') === -1) {
    indexPath = format({
      protocol: 'http:',
      host: 'localhost:8080',
      pathname: 'index.html',
      slashes: true,
    });
    mainWindow.webContents.openDevTools();
    // splashWindow.webContents.openDevTools();
    Menu.setApplicationMenu(mainMenu);
  } else {
    // In production mode, load the bundled version of index.html inside the dist folder.
    indexPath = format({
      protocol: 'file:',
      pathname: join(__dirname, '../dist', 'index.html'),
      slashes: true,
    });
  }

  mainWindow.loadURL(indexPath);

  // Don't show until we are ready and loaded
  mainWindow.once('ready-to-show', () => {
    //ipcMain.send('open-splash', (event:any, {openSplash: boolean})=>{{openSplash: true}})
    mainWindow.show();
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// Invoke createWindow to create browser windows after
// Electron has been initialized.Some APIs can only be used
// after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
/************************************************************
 *********************** IPC CHANNELS ***********************
 ************************************************************/

// Listen for files upload

/* ---IMPORT DATABASE: CREATE AN INSTANCE OF DATABASE FROM A PRE-MADE .TAR OR .SQL FILE--- */
ipcMain.on('upload-file', (event, filePaths: string) => {
  console.log('file paths sent from renderer', filePaths);
  const isMac = process.platform === 'darwin';
  let db_name: string;
  if (isMac) {
    db_name = filePaths[0].slice(filePaths[0].lastIndexOf('/') + 1, filePaths[0].lastIndexOf('.'));
  } else {
    db_name = filePaths[0].slice(filePaths[0].lastIndexOf('\\') + 1, filePaths[0].lastIndexOf('.'));
  }

  // console.log('dbname', db_name);
  console.log('filePaths', filePaths);
  // command strings
  // const db_name: string = filePaths[0].slice(filePaths[0].lastIndexOf('\\') + 1, filePaths[0].lastIndexOf('.'));
  const createDB: string = `docker exec postgres-1 psql -h localhost -p 5432 -U postgres -c "CREATE DATABASE ${db_name}"`;
  const importFile: string = `docker cp ${filePaths} postgres-1:/data_dump`;
  const runSQL: string = `docker exec postgres-1 psql -U postgres -d ${db_name} -f /data_dump`;
  const runTAR: string = `docker exec postgres-1 pg_restore -U postgres -d ${db_name} /data_dump`;
  const extension: string = filePaths[0].slice(filePaths[0].lastIndexOf('.'));

  // CALLBACK FUNCTION : execute commands in the child process
  const addDB = (str: string, nextStep: any) => {
    exec(str, (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
      }
      // console.log(`stdout: ${stdout}`);
      console.log(`${stdout}`);
      if (nextStep) nextStep();
    });
  };

  // SEQUENCE OF EXECUTING COMMANDS
  // Steps are in reverse order because each step is a callback function that requires the following step to be defined.

  // Step 3 : Given the file path extension, run the appropriate command in postgres to build the db
  const step3 = () => {
    let runCmd: string = '';
    if (extension === '.sql') runCmd = runSQL;
    else if (extension === '.tar') runCmd = runTAR;
    addDB(runCmd, () => console.log(`Created Database: ${db_name}`));
    // Redirects modal towards new imported database
    db.changeDB(db_name);
    db.getConnectionString();
    console.log('getConnectionString');
    console.log(`Connected to database ${db_name}`);
  };

  // Step 2 : Import database file from file path into docker container
  const step2 = () => addDB(importFile, step3);

  // Step 1 : Create empty db
  if (extension === '.sql' || extension === '.tar') addDB(createDB, step2);
  else console.log('INVAILD FILE TYPE: Please use .tar or .sql extensions.');
});
/* ---END OF IMPORT DATABASE FUNCTION--- */

// Listen for user clicking skip button
ipcMain.on('skip-file-upload', (event) => {});

interface QueryType {
  queryCurrentSchema: string;
  queryString: string;
  queryLabel: string;
  queryData: string;
  queryStatistics: string;
}

// Listen for queries being sent from renderer
ipcMain.on('execute-query', (event, data: QueryType) => {
  // ---------Refactor-------------------
  console.log('query sent from frontend', data);
  // Checking to see if user wants to change db
  if (data.queryString[0] === '\\' && data.queryString[1] === 'c') {
    let dbName = data.queryString.slice(3);
    db.changeDB(dbName);
    console.log('getConnectionString');
    db.getConnectionString();
    event.sender.send('return-execute-query', `Connected to database ${dbName}`);
  } else {
    // destructure object from frontend
    const { queryString, queryCurrentSchema, queryLabel } = data;

    // initialize object to store all data to send to frontend
    let frontendData = {
      queryString,
      queryCurrentSchema,
      queryLabel,
      queryData: '',
      queryStatistics: '',
    };

    // Run select * from actors;
    db.query(queryString)
      .then((queryData) => {
        frontendData.queryData = queryData.rows;

        // Run EXPLAIN (FORMAT JSON, ANALYZE)
        db.query('EXPLAIN (FORMAT JSON, ANALYZE) ' + queryString).then((queryStats) => {
          // Getting data in row format for frontend
          frontendData.queryStatistics = queryStats.rows;

          // Send result back to renderer
          event.sender.send('return-execute-query', frontendData);
        });
      })
      .catch((error: string) => {
        console.log('THE CATCH: ', error);
      });
  }
});
interface SchemaType {
  schemaName: string;
  schemaFilePath: string;
  schemaEntry: string;
}

// Listen for schema edits sent from renderer
ipcMain.on('input-schema', (event, data: SchemaType) => {
  console.log('schema object from frontend', data);
  let db_name: string;
  db_name = data.schemaName;
  let filePath = data.schemaFilePath;
  // command strings
  const createDB: string = `docker exec postgres-1 psql -h localhost -p 5432 -U postgres -c "CREATE DATABASE ${db_name}"`;
  const importFile: string = `docker cp ${filePath} postgres-1:/data_dump`;
  const runSQL: string = `docker exec postgres-1 psql -U postgres -d ${db_name} -f /data_dump`;
  const runTAR: string = `docker exec postgres-1 pg_restore -U postgres -d ${db_name} /data_dump`;
  const extension: string = filePath.slice(filePath.lastIndexOf('.'));

  // CALLBACK FUNCTION : execute commands in the child process
  const addDB = (str: string, nextStep: any) => {
    exec(str, (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
      }
      // console.log(`stdout: ${stdout}`);
      console.log(`${stdout}`);
      if (nextStep) nextStep();
    });
  };

  // SEQUENCE OF EXECUTING COMMANDS
  // Steps are in reverse order because each step is a callback function that requires the following step to be defined.

  // Step 3 : Given the file path extension, run the appropriate command in postgres to build the db
  const step3 = () => {
    let runCmd: string = '';
    if (extension === '.sql') runCmd = runSQL;
    else if (extension === '.tar') runCmd = runTAR;
    addDB(runCmd, () => console.log(`Created Database: ${db_name}`));
    // Redirects modal towards new imported database
    db.changeDB(db_name);
    console.log(`Connected to database ${db_name}`);
  };

  // Step 2 : Import database file from file path into docker container
  const step2 = () => addDB(importFile, step3);

  // Step 1 : Create empty db
  if (extension === '.sql' || extension === '.tar') addDB(createDB, step2);
  else console.log('INVAILD FILE TYPE: Please use .tar or .sql extensions.');
});
