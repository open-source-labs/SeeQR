// Import parts of electron to use
import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import { appendFile } from 'fs/promises';
import { join } from 'path';
import { format } from 'url';
//import './channels' // all channels live here
import execute from './channels';

const { exec } = require('child_process');
const appMenu = require('./mainMenu'); // use appMenu to add options in top menu bar of app
const path = require('path');

/************************************************************
 *********** PACKAGE ELECTRON APP FOR DEPLOYMENT ***********
 ************************************************************/

// Uncomment to package electron app. Ensures path is correct for MacOS within inherited shell.
// const fixPath = require('fix-path');
// fixPath();

/************************************************************
 ****************** CREATE & CLOSE WINDOW ******************
 ************************************************************/
// Keep a global reference of the window objects, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: any;

//global variable to determine whether or not containers are still running
let pruned: boolean = false;

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

//     // uncomment code below before running production build and packaging
//     // const yamlPath = join(__dirname, '../../docker-compose.yml')
//     // const runDocker: string = `docker-compose -f '${yamlPath}' up -d`;
//     const runDocker: string = `docker-compose up -d`;
//     exec(runDocker, (error, stdout, stderr) => {
//       if (error) {
//         console.log(`error: ${error.message}`);
//         return;
//       }
//       if (stderr) {
//         console.log(`stderr: ${stderr}`);
//         return;
//       }
//       console.log(`${stdout}`);
//     })
//   });

})

// app.on('before-quit', (event: any) => {
//   // check if containers have already been pruned--else, continue with default behavior to terminate application
//   if (!pruned) {
//     event.preventDefault();
//     // Stop and remove postgres-1 and busybox-1 Docker containers upon window exit.
//     const stopContainers: string = 'docker stop postgres-1 busybox-1';
//     const pruneContainers: string = 'docker rm -f postgres-1 busybox-1';
//     // this command removes the volume which stores the session data for the postgres instance
//     // comment this out for dev
//     const pruneVolumes: string = 'docker volume rm -f seeqr_database-data';

//     // use this string for production build
//     // const pruneVolumes: string = 'docker volume rm -f app_database-data'

//     const step4 = () => {
//       pruned = true;
//       app.quit()
//     };
//     const step3 = () => execute(pruneVolumes, step4);
//     const step2 = () => execute(pruneContainers, step3);

//     execute(stopContainers, step2);
//   }
// })

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

export default mainWindow;