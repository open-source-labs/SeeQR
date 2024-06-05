/*
 * This file is building the menu options that are available.
 * For Macs, the file menu is available at the top (i.e. File, Edit, Window, Help etc)
 * Each menu option is a new object element within the array
 * Each menu object has a submenu which is also an array that holds objects
 * Each object represents a click action the user can take or something cosemetic like a separate line
 */

// import shell so a new browser window can open for external links
import { MenuItem, shell } from 'electron';

// darwin is the process platform for Macs
const isMac = process.platform === 'darwin';

const arr: MenuItem[] = [
  // App menu
  ...(isMac
    ? [
        new MenuItem({
          label: 'SeeQR',
          submenu: [
            { role: 'about' },
            { type: 'separator' },
            { role: 'services' },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideOthers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' },
          ],
        }),
      ]
    : []),
  // File menu
  new MenuItem({
    label: 'File',
    submenu: [isMac ? { role: 'close' } : { role: 'quit' }],
  }),
  // Edit menu
  new MenuItem({
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'delete' },
      { role: 'selectAll' },
      { type: 'separator' },
      isMac
        ? {
            label: 'Speech',
            submenu: [{ role: 'startSpeaking' }, { role: 'stopSpeaking' }],
          }
        : { label: 'Test' },
    ],
  }),
  // View menu
  new MenuItem({
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' },
    ],
  }),
  // Window Menu
  new MenuItem({
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      isMac ? { type: 'separator' } : { label: 'Test' },
      isMac ? { role: 'front' } : { label: 'Test' },
      isMac ? { type: 'separator' } : { label: 'Test' },
      isMac ? { role: 'window' } : { label: 'Test' },
      isMac ? { label: 'Test' } : { role: 'close' },
    ],
  }),
  // help menu
  new MenuItem({
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
  }),
];

export default arr;
