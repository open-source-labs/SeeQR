// Import parts of electron to use
import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import { join } from 'path';
import { format } from 'url';
import { createBrotliDecompress } from 'zlib';

const { exec } = require('child_process');
const appMenu = require('./mainMenu'); // use appMenu to add options in top menu bar of app
const db = require('./commands'); // methods to communicate with postgres database
const path = require('path');
const fixPath = require('fix-path');

/************************************************************
 *********** PACKAGE ELECTRON APP FOR DEPLOYMENT ***********
 ************************************************************/

// Uncomment to package electron app. Ensures path is correct for MacOS within inherited shell.
// fixPath();

/************************************************************
 ****************** CREATE & CLOSE WINDOW ******************
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

  // Don't show until we are ready and loaded
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
// Some APIs can only be used after this event occurs.
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

// Global variable to store list of databases and tables to provide to frontend upon refreshing view.
let listObj;

ipcMain.on('return-db-list', (event, args) => {
  db.getLists().then(data => event.sender.send('db-lists', data));
});

// Listen for skip button on Splash page.
ipcMain.on('skip-file-upload', (event) => { });

// Listen for database changes sent from the renderer upon changing tabs.
ipcMain.on('change-db', (event, dbName) => {
  db.changeDB(dbName);
  event.sender.send('return-change-db', dbName);
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

// Generate CLI commands to be executed in child process.
const createDBFunc = (name) => {
  return `docker exec postgres-1 psql -h localhost -p 5432 -U postgres -c "CREATE DATABASE ${name}"`
}

const importFileFunc = (file) => {
  return `docker cp ${file} postgres-1:/data_dump`;
}

const runSQLFunc = (file) => {
  return `docker exec postgres-1 psql -U postgres -d ${file} -f /data_dump`;
}

const runTARFunc = (file) => {
  return `docker exec postgres-1 pg_restore -U postgres -d ${file} /data_dump`;
}

// Function to execute commands in the child process.
const execute = (str: string, nextStep: any) => {
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
};

// // Function to execute commands in the child process.
// const execute = (str: string) => {
//   exec(str, (error, stdout, stderr) => {
//     if (error) {
//       console.log(`error: ${error.message}`);
//       return;
//     }
//     if (stderr) {
//       console.log(`stderr: ${stderr}`);
//       return;
//     }
//     console.log(`${stdout}`);
//   });
// };

/* ---IMPORT DATABASE: CREATE AN INSTANCE OF DATABASE FROM A PRE-MADE .TAR OR .SQL FILE--- */
// Listen for file upload
ipcMain.on('upload-file', (event, filePaths: string) => {
  let dbName: string;
  if (process.platform === 'darwin') {
    dbName = filePaths[0].slice(filePaths[0].lastIndexOf('/') + 1, filePaths[0].lastIndexOf('.'));
  } else {
    dbName = filePaths[0].slice(filePaths[0].lastIndexOf('\\') + 1, filePaths[0].lastIndexOf('.'));
  }

  const createDB: string = createDBFunc(dbName);
  const importFile: string = importFileFunc(filePaths);
  const runSQL: string = runSQLFunc(dbName);
  const runTAR: string = runTARFunc(dbName);

  const extension: string = filePaths[0].slice(filePaths[0].lastIndexOf('.'));

  // SEQUENCE OF EXECUTING COMMANDS
  // Steps are in reverse order because each step is a callback function that requires the following step to be defined.

  // Changes the pg URI the newly created database, queries new database, then sends list of tables and list of databases to frontend.
  async function sendLists() {
    listObj = await db.getLists();
    event.sender.send('db-lists', listObj);
    // Send schema name back to frontend, so frontend can load tab name.
    event.sender.send('return-schema-name', dbName)
  };

  // Step 3 : Given the file path extension, run the appropriate command in postgres to populate db.
  const step3 = () => {
    let runCmd: string = '';
    if (extension === '.sql') runCmd = runSQL;
    else if (extension === '.tar') runCmd = runTAR;
    execute(runCmd, sendLists);
  };

  // Step 2 : Import database file from file path into docker container
  const step2 = () => execute(importFile, step3);

  // Step 1 : Create empty db
  if (extension === '.sql' || extension === '.tar') execute(createDB, step2);
  else console.log('INVALID FILE TYPE: Please use .tar or .sql extensions.');
});

// Listen for schema edits sent from renderer
ipcMain.on('input-schema', (event, data: SchemaType) => {
  const { schemaName: dbName, schemaFilePath: filePath, schemaEntry } = data;

  // Using RegEx to remove line breaks to ensure data.schemaEntry is being run as one large string
  // so that schemaEntry string will work for Windows computers.
  let trimSchemaEntry = schemaEntry.replace(/[\n\r]/g, "").trim();

  const createDB: string = createDBFunc(dbName);
  const importFile: string = importFileFunc(filePath);
  const runSQL: string = runSQLFunc(dbName);
  const runTAR: string = runTARFunc(dbName);

  const runScript: string = `docker exec postgres-1 psql -U postgres -d ${dbName} -c "${trimSchemaEntry}"`;
  let extension: string = '';
  if (filePath.length > 0) {
    extension = filePath[0].slice(filePath[0].lastIndexOf('.'));
  }


  // SEQUENCE OF EXECUTING COMMANDS
  // Steps are in reverse order because each step is a callback function that requires the following step to be defined.
  // ^refactor this so it's readable and module. move it to global scope or another file

  // Changes the pg URI to look to the newly created database and queries all the tables in that database and sends it to frontend.
  async function getLists() {
    listObj = await db.getLists();
    event.sender.send('db-lists', listObj);
  };

  // Step 3 : Given the file path extension, run the appropriate command in postgres to build the db
  const step3 = () => {
    let runCmd: string = '';
    if (extension === '.sql') runCmd = runSQL;
    else if (extension === '.tar') runCmd = runTAR;
    else runCmd = runScript;
    execute(runCmd, getLists);
  };

  // Step 2 : Import database file from file path into docker container
  const step2 = () => execute(importFile, step3);

  // Step 1 : Create empty db
  if (extension === '.sql' || extension === '.tar') execute(createDB, step2);
  // if data is inputted as text
  else execute(createDB, step3);
});

// Listen for queries being sent from renderer
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


  // Run select * from actors;
  db.query(queryString)
    .then((queryData) => {
      frontendData.queryData = queryData.rows;

      // Run EXPLAIN (FORMAT JSON, ANALYZE)
      db.query('EXPLAIN (FORMAT JSON, ANALYZE) ' + queryString).then((queryStats) => {
        // Getting data in row format for frontend
        frontendData.queryStatistics = queryStats.rows;

        async function getListAsync() {
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