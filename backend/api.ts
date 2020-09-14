// Import parts of electron to use
import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import { join } from 'path';
import { format } from 'url';

const { exec } = require('child_process');
const path = require('path');

const api = {
  sayHello: function () { },
}

api.sayHello = () => {
  return "hello ";
};







module.exports = api;

