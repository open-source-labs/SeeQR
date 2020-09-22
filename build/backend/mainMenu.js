"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
// if process platform is darwin, operating on mac
var isMac = process.platform === 'darwin';
var _a = require('electron'), app = _a.app, shell = _a.shell;
module.exports = __spreadArrays((isMac
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
    : []), [
    // { role: 'fileMenu' }
    {
        label: 'File',
        submenu: [isMac ? { role: 'close' } : { role: 'quit' }],
    },
    // { database }
    {
        label: 'Database',
        submenu: [{ label: 'Load database' }],
    },
    // { role: 'editMenu' }
    {
        label: 'Edit',
        submenu: __spreadArrays([
            { role: 'undo' },
            { role: 'redo' },
            { type: 'separator' },
            { role: 'cut' },
            { role: 'copy' },
            { role: 'paste' }
        ], (isMac
            ? [
                { role: 'delete' },
                { role: 'selectAll' },
                { type: 'separator' },
                {
                    label: 'Speech',
                    submenu: [{ role: 'startspeaking' }, { role: 'stopspeaking' }],
                },
            ]
            : [{ role: 'delete' }, { type: 'separator' }, { role: 'selectAll' }])),
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
        submenu: __spreadArrays([
            { role: 'minimize' },
            { role: 'zoom' }
        ], (isMac
            ? [{ type: 'separator' }, { role: 'front' }, { type: 'separator' }, { role: 'window' }]
            : [{ role: 'close' }])),
    },
    {
        role: 'help',
        submenu: [
            {
                label: 'SeeQR Documentation',
                click: function () {
                    shell.openExternal('https://electronjs.org');
                },
            },
        ],
    },
]);
//# sourceMappingURL=mainMenu.js.map