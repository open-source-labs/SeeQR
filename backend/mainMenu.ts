/*
 * This file is building the menu options that are available.
 * For Macs, the file menu is available at the top (i.e. File, Edit, Window, Help etc)
 * Each menu option is a new object element within the array
 * Each menu object has a submenu which is also an array that holds objects
 * Each object represents a click action the user can take or something cosemetic like a separate line
 */


// import shell so a new browser window can open for external links
 const { shell } = require('electron');

// darwin is the process platform for Macs
const isMac = process.platform === 'darwin';

const arr = [
  // App menu
  ...(isMac
    ? [
        {
          label: 'Electron',
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
  // File menu
  {
    label: 'File',
    submenu: [isMac ? { role: 'close' } : { role: 'quit' }],
  },
  // Edit menu
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
  // View menu
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
  // Window Menu
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
  // help menu
  {
    role: 'Help',
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

module.exports = arr;
