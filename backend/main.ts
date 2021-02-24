// eslint-disable-next-line import/no-extraneous-dependencies
import { app, BrowserWindow, Menu } from 'electron';

const path = require('path');
const url = require('url');
const {
  default: installExtension,
  REACT_DEVELOPER_TOOLS,
} = require('electron-devtools-installer');
const fixPath = require('fix-path');
const MainMenu = require('./mainMenu');

// requiring channels file to initialize event listeners
require('./channels');

fixPath();
// Keep a global reference of the window objects, if you don't, the window will be closed automatically when the JavaScript object is garbage collected.
let mainWindow: BrowserWindow | null;
const dev: boolean = process.env.NODE_ENV === 'development';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1800,
    height: 1400,
    minWidth: 900,
    minHeight: 720,
    title: 'SeeQR',
    show: false,
    webPreferences: { nodeIntegration: true, enableRemoteModule: true },
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

  mainWindow.loadURL(indexPath);

  // Window will display once it is ready and loaded
  mainWindow.once('ready-to-show', () => {
    if (mainWindow) mainWindow.show();
  });
}

// Install React Dev Tools Extension
if (dev)
  app.on('ready', () => {
    installExtension(REACT_DEVELOPER_TOOLS);
  });

// Invoke createWindow to create browser windows after Electron has been initialized.
app.on('ready', createWindow);

// Quit when all windows are closed for Windows and Linux
app.on('window-all-closed', () => {
  // On macOS it is common for applications to stay active on their menu bar when the use closes the window
  if (process.platform !== 'darwin') {
    app.quit();
  } else {
    mainWindow = null;
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
