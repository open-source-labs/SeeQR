/**
 * The purpose of this file is to program how electron manages the window it loads on the OS
 */

const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const url = require('url');
const MainMenu = require('./mainMenu');
const {
  default: installExtension,
  REACT_DEVELOPER_TOOLS,
} = require('electron-devtools-installer');
require('./channels');
/**
 * Explore the comment below on channels and see if its valid

    all channels live here - this format signals that we want to import the code
    even if we're not calling any of the functions. If we were to import an
    object from channels and not call any of the functions in this file, webpack
    thinks we're not using it and skips the import.
    
    Previous line of code
    import './channels';
 */

// Keep a global reference of the window objects, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: any;

/**
 * Need to understand dev and dev if statements
 * Also, do we want to chance the name mainWindow, it refers to all the window objects does this include modals that can
 * pop-up? or is it referring to the main window object
 */
const mainMenuBuiltFromTemplate = Menu.buildFromTemplate(MainMenu);
// Keep a reference for dev mode
const dev: boolean = process.env.NODE_ENV === 'development';
// let dev = false;
// if (
//   process.env.NODE_ENV !== undefined &&
//   process.env.NODE_ENV === 'development'
// )
//   dev = true;

function createWindow() {
  // Create browser window by adding specifications
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

  /**
   * This platform is checking to see if the OS is Mac, and setting the icon
   *
   * Do we need this? we will need something similar to windows?
   *
   * Adding icon to the menu bar on mac (bar at the bottom)
   *
   * */
  if (process.platform === 'darwin') {
    app.dock.setIcon(
      path.join(__dirname, '../../frontend/assets/images/seeqr_dock.png')
    );
  }

  /**
   * indexPath is used to determine which type environment we are in and how to load the window
   * For dev, we are using localhost:8080
   * For Prod, we are referring to the index.html file that is build after running webpack
   * Need to understand how the index.html file is being created when the Dev environment spins up
   * -- should be a webpack thing
   */
  // Load index.html of the app
  let indexPath;
  if (dev && process.argv.indexOf('--noDevServer') === -1) {
    indexPath = url.format({
      protocol: 'http:',
      host: 'localhost:8080',
      pathname: 'index.html',
      slashes: true,
    });

    // Open the Dev Tools when in Dev Environment
    // mainWindow.webContents.openDevTools();
    Menu.setApplicationMenu(mainMenuBuiltFromTemplate);
  } else {
    // In production mode, load the bundled version of index.html inside the dist folder.
    indexPath = url.format({
      protocol: 'file:',
      pathname: path.join(__dirname, '../../dist', 'index.html'),
      slashes: true,
    });
  }

  mainWindow.loadURL(indexPath);

  /**
   * Additional code added, is this necessary?
   */
  // Don't show until we are ready and loaded
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
}

/**
 * General Comment - the app.on functionality is specific to Mac... need to reconfigure so it also works on windows...
 */

// future iterations should add functionality to delete .sql and .csv files from a user's computer before quitting the app
/**
 * Need to explore app.on this can be used to delete the .sql file...
 */
app.on('before-quit', () => {});

/**
 * Install React Extension for electron devtools
 */
if (dev)
  app.on('ready', () => {
    installExtension(REACT_DEVELOPER_TOOLS);
  });

// Invoke createWindow to create browser windows after Electron has been initialized.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed for Windows and Linux
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  /**
   * Note they never turn MainWindow to null; need to see how this is working
   */

  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

/**
 * **********************************************************
 *********** PACKAGE ELECTRON APP FOR DEPLOYMENT ***********
 ***********************************************************
 */

// Uncomment to package electron app. Ensures path is correct for MacOS within inherited shell.
// const fixPath = require('fix-path');
// fixPath();

/**
 * main.ts is the start file for electron, why are we exporting it?????
 */
export default mainWindow;
