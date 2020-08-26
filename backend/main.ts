// main.js is the entry point to the main process (the node process)

// Import parts of electron to use
import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { format } from 'url';
import { Children } from 'react';
const { exec } = require("child_process");

/************************************************************
 ********* CREATE & CLOSE WINDOW UPON INITIALIZATION *********
 ************************************************************/

// Keep a global reference of the window objects, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: any;
let splashWindow: any;

// Keep a reference for dev mode
let dev = false;
if (process.env.NODE_ENV !== undefined && process.env.NODE_ENV === 'development') {
  dev = true;
}

// Create browser window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1500,
    height: 1200,
    minWidth: 900,
    minHeight: 720,
    title: 'SeeQR',
    show: false,
    webPreferences: { nodeIntegration: true, enableRemoteModule: true },
  });
  // Create splash window
  // splashWindow = new BrowserWindow({
  //   width: 1600,
  //   height: 1200,
  //   webPreferences: { nodeIntegration: true, enableRemoteModule: true },
  //   parent: mainWindow,
  // });

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
  } else {
    // In production mode, load the bundled version of index.html inside the dist folder.
    indexPath = format({
      protocol: 'file:',
      pathname: join(__dirname, '../dist', 'index.html'),
      slashes: true,
    });
  }

  mainWindow.loadURL(indexPath);
  // splashWindow.loadURL(indexPath);

  // Don't show until we are ready and loaded
  // Once the main window is ready, it will remain hidden when splash is focused
  mainWindow.once('ready-to-show', () => {
    //ipcMain.send('open-splash', (event:any, {openSplash: boolean})=>{{openSplash: true}})
    mainWindow.show();
    // if (splashWindow != null && splashWindow.isVisible()) {
    //   mainWindow.hide();
    //   // splashWindow.focus();
    // }
  });
  // When splash window is open and visible, it sits on top
  // Main window is hidden

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // De-reference the window object. Usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
  // when splash window is closed, main window is shown
  // splashWindow.on('closed', () => {
  //   splashWindow = null;
  //   mainWindow.show();
  // });
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

  // command strings 
  const db_name: string = 'test';
  const createDB : string = `docker exec postgres-1 psql -h localhost -p 5432 -U postgres -c "CREATE DATABASE ${db_name}"`;
  const importFile : string = `docker cp ${filePaths} postgres-1:/data_dump`;
  const runSQL : string = `docker exec postgres-1 psql -U postgres -d ${db_name} -f /data_dump`;
  const runTAR : string = `docker exec postgres-1 pg_restore -U postgres -d ${db_name} /data_dump`;
  const extension: string = filePaths[0].slice(filePaths[0].lastIndexOf('.'));

  // CALLBACK FUNCTION : execute commands in the child process
  const addDB = (str : string, nextStep : any) => {
    exec(str,
    (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      if (nextStep) nextStep();
    });
  }

  // SEQUENCE OF EXECUTING COMMANDS
  // Steps are in reverse order because each step is a callback function that requires the following step to be defined.

  // Step 3 : Given the file path extension, run the appropriate command in postgres to build the db
  const step3 = () => {
    let runCmd : string = '';
    if (extension === '.sql') runCmd = runSQL;
    else if (extension === '.tar') runCmd = runTAR;;
    addDB(runCmd, () => console.log(`Created Database: ${db_name}`));
  }

  // Step 2 : Import database file from file path into docker container
  const step2 = () => addDB(importFile, step3);

  // Step 1 : Create empty db
  if (extension === '.sql' || extension === '.tar') addDB(createDB, step2);
  else console.log("INVAILD FILE TYPE: Please use .tar or .sql extensions.")
});
/* ---END OF IMPORT DATABASE FUNCTION--- */


// Listen for user clicking skip button
ipcMain.on('skip-file-upload', (event) => {});

interface QueryType {
    queryCurrentSchema: string,
    queryString: string,
    queryLabel: string
}

// Listen for queries being sent from renderer
ipcMain.on('execute-query', (event, data: QueryType) => {

  const responseObj: any = {};
    exec(`docker exec postgres-1 psql -h localhost -p 5432 -U postgres -d test -c "EXPLAIN (FORMAT JSON, ANALYZE) ${data.queryString}"`,
    (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout-analyze: ${stdout}`);
        stdout = stdout.slice(stdout.indexOf("["), stdout.lastIndexOf("]") + 1).split("+").join("");
        responseObj.analyze = stdout;
        responseObj.queryLabel = data.queryLabel;
        // event.sender.send('return-execute-query', stdout);
        exec(`docker exec postgres-1 psql -h localhost -p 5432 -U postgres -d test -c "${data.queryString}"`,
        (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
            responseObj.data = stdout;
            console.log(`stdout-data: ${typeof stdout}`);
            // stdout = stdout.slice(stdout.indexOf("["), stdout.lastIndexOf("]") + 1).split("+").join("");
            event.sender.send('return-execute-query', responseObj);
        });
    });
});

interface SchemaType {
    currentSchema: string,
    schemaString: string,
}

// Listen for schema edits sent from renderer
ipcMain.on('edit-schema', (event, data: SchemaType) => {
  console.log('schema string sent from frontend', data);
  exec(`docker exec postgres-1 psql -h localhost -p 5432 -U postgres -d ${data.currentSchema} -c "${data.schemaString}"`, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });
  // Send result back to renderer
});
