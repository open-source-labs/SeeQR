/**
 * This file is building the menu opens that are available..
 * For Macs, its the file menu available at the top (i.e. File, Edit, Window, Help etc)
 * Each menu option is a new object element within the array.
 * Each menu object has a submenu which is also an array that holds objects
 * Each object represents a click action the user can take or something cosemetic like a separate line
 */

/**
 * Only defined for Macs
 * Not sure how the roles are executing
 * In Video, they used label and adding click functionality, in the example below, they are using roles
 *
 * SubMenu: [
 * {
 *    label: "Exit",
 *    click() {
 *        app.quit()
 *    }
 * }
 * ]
 *
 * Shell is being imported, so a new browser window can open for external links
 * Considering referring our GitHub page
 */

export {};
// if process platform is darwin, operating on mac
const isMac = process.platform === 'darwin';

// const { app, shell } = require('electron');

const { app, shell } = require('electron');

module.exports = [
  // { role: 'appMenu' }
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            { role: 'about' },
            { type: 'separator' },
            { role: 'services' },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideothers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' },
          ],
        },
      ]
    : []),
  // { role: 'fileMenu' }
  {
    label: 'File',
    submenu: [isMac ? { role: 'close' } : { role: 'quit' }],
  },
  // { role: 'editMenu' }
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      ...(isMac
        ? [
            { role: 'delete' },
            { role: 'selectAll' },
            { type: 'separator' },
            {
              label: 'Speech',
              submenu: [{ role: 'startspeaking' }, { role: 'stopspeaking' }],
            },
          ]
        : [{ role: 'delete' }, { type: 'separator' }, { role: 'selectAll' }]),
    ],
  },
  // { role: 'viewMenu' }
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forcereload' },
      { role: 'toggledevtools' },
      { type: 'separator' },
      { role: 'resetzoom' },
      { role: 'zoomin' },
      { role: 'zoomout' },
      { type: 'separator' },
      { role: 'togglefullscreen' },
    ],
  },
  // { role: 'windowMenu' }
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      ...(isMac
        ? [
            { type: 'separator' },
            { role: 'front' },
            { type: 'separator' },
            { role: 'window' },
          ]
        : [{ role: 'close' }]),
    ],
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Electron Documentation',
        click: () => {
          shell.openExternal('https://electronjs.org');
        },
      },
      {
        label: 'SeeQR GitHub Documentation',
        click: () => {
          shell.openExternal('https://github.com/oslabs-beta/SeeQR');
        },
      },
    ],
  },
];
