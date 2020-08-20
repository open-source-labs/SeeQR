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
    width: 1600,
    height: 1200,
    minWidth: 800,
    minHeight: 600,
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
ipcMain.on('upload-file', (event, filePaths: string) => {
  console.log('file paths sent from renderer', filePaths);
  // Process
  // Send result back to renderer
});

// Listen for user clicking skip button
ipcMain.on('skip-file-upload', (event) => {});

interface QueryType {
    queryCurrentSchema: string,
    queryString: string,
}

// Listen for queries being sent from renderer
ipcMain.on('execute-query', (event, data: QueryType) => {
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
        console.log(`stdout: ${stdout}`);
        stdout = stdout.slice(stdout.indexOf("["), stdout.lastIndexOf("]") + 1).split("+").join("");
        event.sender.send('return-execute-query', stdout);
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
