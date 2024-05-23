// eslint-disable-next-line import/no-extraneous-dependencies
// entry point for electron
import { app, BrowserWindow, Menu } from 'electron'; // added session here for DevTool if needed
import fixPath from 'fix-path'; 
import * as path from 'path';
import * as url from 'url';
// import os from 'node:os'; // only for DevTool
import MainMenu from './mainMenu';

const dev: boolean = process.env.NODE_ENV === 'development';

// requiring channels file to initialize event listeners

// require('./_DEPRECATED_channels');
import('./src/ipcHandlers/index');
fixPath();
// Keep a global reference of the window objects, if you don't,
// the window will be closed automatically when the JavaScript object is garbage collected.
let mainWindow: BrowserWindow | null;

// for react dev tools to work with electron
// download react devtools and save them on desktop in folder named ReactDevTools
// devtools: https://github.com/facebook/react/issues/25843
// https://github.com/mondaychen/react/raw/017f120369d80a21c0e122106bd7ca1faa48b8ee/packages/react-devtools-extensions/ReactDevTools.zip
// ******************** Comment out when done ******************** //
//const reactDevToolsPath = path.join(os.homedir(), '/Desktop/ReactDevTools');
// app.whenReady().then(async () => {
//   await session.defaultSession.loadExtension(reactDevToolsPath);
// });
// ******************** Comment out when done ******************** //

// Add an event listener for uncaught exceptions
// The major purpose is to hide the pop out warning or error message from electron/react
// That is, put everything undertable
process.on('uncaughtException', (error) => {
  // Hiding the error on the terminal as well
  console.error('Uncaught Exception:', error);
});

// this creates the new browserWindow. Had to delete remoteprocess from webPrefences since it was deprecated.
// It allowed direct access to remote objects and APIs in this main process, so instead we implement ipcRenderer.invoke.
// WebPreferences nodeintegration and contextisolation are set respectively to ensure api's can be used throughout the entire program without contextbridging
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1800,
    height: 1400,
    minWidth: 900,
    minHeight: 720,
    title: 'SeeQR',
    show: false,
    webPreferences: { nodeIntegration: true, contextIsolation: false },
    icon: path.join(__dirname, '../../assets/logo/seeqr_dock.png'),
  });

  // This platform is checking to see if the OS is Mac, and setting the icon
  if (process.platform === 'darwin') {
    app.dock.setIcon(path.join(__dirname, '../../assets/logo/seeqr_dock.png'));
  }

  // indexPath is used to determine which type environment we are in and how to load the window
  let indexPath: string;
  if (dev) {
    indexPath = url.format({
      protocol: 'http:',
      host: 'localhost:8080',
      pathname: 'index.html',
      slashes: true,
    });

    Menu.setApplicationMenu(Menu.buildFromTemplate(MainMenu));
  } else {
    // In production mode, load the bundled version of index.html inside the dist folder.
    indexPath = url.format({
      protocol: 'file:',
      pathname: path.join(__dirname, '../../dist', 'index.html'),
      slashes: true,
    });
  }

  mainWindow
    .loadURL(indexPath)
    .catch((err) => console.error('Uncaught Exception:', err));

  // Window will display once it is ready and loaded
  mainWindow.once('ready-to-show', () => {
    if (mainWindow) mainWindow.show();
  });
}

// Invoke createWindow to create browser windows after Electron has been initialized.
// app.on('ready', () => {
// createWindow();
// });
// testing tutorial code
app
  .whenReady()
  .then(() => {
    createWindow();
  })
  .catch((err) => console.error('Uncaught Exception:', err));

// Quit when all windows are closed for Windows and Linux
app.on('window-all-closed', () => {
  // On macOS it is common for applications to stay active on their menu bar
  // when the use closes the window
  if (process.platform !== 'darwin') {
    app.quit();
  } else {
    mainWindow = null;
  }
});

// 5.16.24 Tutorial has activate in whenReady .then statement. Not sure if I need to move this there
app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the dock
  // icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
