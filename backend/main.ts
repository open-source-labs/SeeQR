import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import { join } from 'path';
import { format } from 'url';

const { exec } = require('child_process');
const appMenu = require('./mainMenu'); // use appMenu to add options in top menu bar of app
const db = require('./modal'); // methods to communicate with postgres database
const path = require('path');
const fixPath = require('fix-path');

// Uncomment to package electron app. Ensures path is correct for MacOS within inherited shell.
// fixPath();

/************************************************************
 ****************** CREATE & CLOSE WINDOW ******************
 ************************************************************/
// Keep a global reference of the window objects. If not, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: any;

let mainMenu = Menu.buildFromTemplate(require('./mainMenu'));
// Toggle dev mode
let dev = false;
if (process.env.NODE_ENV !== undefined && process.env.NODE_ENV === 'development') {
  dev = true;
}

// Create browser window.
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1800,
    height: 1400,
    minWidth: 1500,
    minHeight: 1000,
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
    Menu.setApplicationMenu(mainMenu);
  } else {
    // In production mode, load the bundled version of index.html inside the dist folder.
    indexPath = format({
      protocol: 'file:',
      pathname: join(__dirname, '../../dist', 'index.html'),
      slashes: true,
    });
  }

  mainWindow.loadURL(indexPath);

  // Don't show until windows are ready and loaded
  mainWindow.once('ready-to-show', (event) => {
    mainWindow.show();
    const runDocker: string = `docker-compose up -d`;
    exec(runDocker, (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
      }
      console.log(`${stdout}`);
    })
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Stop and remove postgres-1 and busybox-1 Docker containers upon window exit.
    const pruneContainers: string = 'docker rm -f postgres-1 busybox-1';
    const executeQuery = (str) => {
      exec(str, (error, stdout, stderr) => {
        if (error) {
          console.log(`error: ${error.message}`);
          return;
        }
        if (stderr) {
          console.log(`stderr: ${stderr}`);
          return;
        }
        console.log(`${stdout}`);
      })
    };
    executeQuery(pruneContainers);
    mainWindow = null;
  });
}

// Invoke createWindow to create browser windows after Electron has been initialized.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// On macOS it's common to re-create a window in the app when the dock icon is clicked and there are no other windows open.
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

/************************************************************
 *********************** IPC CHANNELS ***********************
 ************************************************************/

// Global variable
let listObj;

ipcMain.on('return-db-list', (event, args) => {
  db.getLists().then(data => event.sender.send('db-lists', data));
});

// Listen for skip button on Splash page.
ipcMain.on('skip-file-upload', (event) => { });

// Listen for database changes sent from the renderer upon changing tabs.
ipcMain.on('change-db', (event, db_name) => {
  db.changeDB(db_name);
  event.sender.send('return-change-db', db_name);
});

interface QueryType {
  queryCurrentSchema: string;
  queryString: string;
  queryLabel: string;
  queryData: string;
  queryStatistics: string;
}

interface SchemaType {
  schemaName: string;
  schemaFilePath: string;
  schemaEntry: string;
}

/* ---IMPORT DATABASE: CREATE AN INSTANCE OF DATABASE FROM A PRE-MADE .TAR OR .SQL FILE--- */
// Listen for file upload.
ipcMain.on('upload-file', (event, filePaths: string) => {
  const isMac = process.platform === 'darwin';
  let db_name: string;
  if (isMac) {
    db_name = filePaths[0].slice(filePaths[0].lastIndexOf('/') + 1, filePaths[0].lastIndexOf('.'));
  } else {
    db_name = filePaths[0].slice(filePaths[0].lastIndexOf('\\') + 1, filePaths[0].lastIndexOf('.'));
  }

  // command strings to be executed in child process
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
      console.log(`${stdout}`);
      if (nextStep) nextStep();
    });

    // Send schema name back to frontend, so frontend can load tab name 
    event.sender.send('return-schema-name', db_name)
  };

  // SEQUENCE OF EXECUTING COMMANDS
  // Steps are in reverse order because each step is a callback function that requires the following step to be defined.

  // Step 3 : Given the file path extension, run the appropriate command in postgres to build the db
  const step3 = () => {
    let runCmd: string = '';
    if (extension === '.sql') runCmd = runSQL;
    else if (extension === '.tar') runCmd = runTAR;
    addDB(runCmd, redirectModal);
  };
  // Step 2 : Import database file from file path into docker container
  const step2 = () => addDB(importFile, step3);
  // Changes the pg URI to look to the newly created database and queries all the tables in that database and sends it to frontend.
  async function redirectModal() {
    listObj = await db.getLists();
    event.sender.send('db-lists', listObj);
  };
  // Step 1 : Create empty db
  if (extension === '.sql' || extension === '.tar') addDB(createDB, step2);
  else console.log('INVALID FILE TYPE: Please use .tar or .sql extensions.');
});

// Listen for new schema (from SchemaModal and SchemaInut) sent from renderer.
ipcMain.on('input-schema', (event, data: SchemaType) => {
  let db_name: string;
  db_name = data.schemaName;
  let filePath = data.schemaFilePath;
  // Using RegEx to remove line breaks to ensure data.schemaEntry is being run as one large string
  // so that schemaEntry string will work for Windows computers.
  let schemaEntry = data.schemaEntry.replace(/[\n\r]/g, "").trim();

  // command strings
  const createDB: string = `docker exec postgres-1 psql -h localhost -p 5432 -U postgres -c "CREATE DATABASE ${db_name}"`;
  const importFile: string = `docker cp ${filePath} postgres-1:/data_dump`;
  const runSQL: string = `docker exec postgres-1 psql -U postgres -d ${db_name} -f /data_dump`;
  const runScript: string = `docker exec postgres-1 psql -U postgres -d ${db_name} -c "${schemaEntry}"`;
  const runTAR: string = `docker exec postgres-1 pg_restore -U postgres -d ${db_name} /data_dump`;
  let extension: string = '';
  if (filePath.length > 0) {
    extension = filePath[0].slice(filePath[0].lastIndexOf('.'));
  }

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
  // ^refactor this so it's readable and module. move it to global scope or another file

  // Step 3 : Given the file path extension, run the appropriate command in postgres to build the db
  const step3 = () => {
    let runCmd: string = '';
    if (extension === '.sql') runCmd = runSQL;
    else if (extension === '.tar') runCmd = runTAR;
    else runCmd = runScript;
    addDB(runCmd, redirectModal);
  };

  // Step 2 : Import database file from file path into docker container
  const step2 = () => addDB(importFile, step3);

  // Changes the pg URI to look to the newly created database and queries all the tables in that database and sends it to frontend.
  async function redirectModal() {
    listObj = await db.getLists();
    event.sender.send('db-lists', listObj);
  };

  // Step 1 : Create empty db
  if (extension === '.sql' || extension === '.tar') {
    addDB(createDB, step2);
  }
  // if data is inputted as text
  else addDB(createDB, step3);
});

// Listen for queries being sent from renderer.
ipcMain.on('execute-query', (event, data: QueryType) => {
  // destructure object from frontend
  const { queryString, queryCurrentSchema, queryLabel } = data;

  // initialize object to store all data to send to frontend
  let frontendData = {
    queryString,
    queryCurrentSchema,
    queryLabel,
    queryData: '',
    queryStatistics: '',
    lists: {},
  };

  db.query(queryString)
    .then((queryData) => {
      frontendData.queryData = queryData.rows;

      db.query('EXPLAIN (FORMAT JSON, ANALYZE) ' + queryString).then((queryStats) => {
        frontendData.queryStatistics = queryStats.rows;

        async function getListAsync() {
          // let listObj;
          listObj = await db.getLists();
          frontendData.lists = listObj;
          event.sender.send('db-lists', listObj)
          event.sender.send('return-execute-query', frontendData);
        }
        getListAsync();
      });
    })
    .catch((error: string) => {
      console.log('ERROR in execute-query channel in main.ts', error);
    });
});