/* eslint-disable no-throw-literal */
/* eslint-disable no-shadow */
/* eslint-disable object-shorthand */
import path from 'path';
import fs from 'fs';
import os from 'os';
import { DBType, DocConfigFile, LogType } from './BE_types';
import logger from './Logging/masterlog';

const home = `${os.homedir()}/Documents/SeeQR`;
const configFile = `config.json`;
const configPath = `${home}/${configFile}`;

const writeConfigDefault = function (): DocConfigFile {
  logger('Could not find config file. Creating default', LogType.WARNING);

  const defaultFile: DocConfigFile = {
    mysql_user: 'mysql',
    mysql_pass: 'mysql',
    pg_user: 'postgres',
    pg_pass: 'postgres',
  };

  fs.writeFileSync(configPath, JSON.stringify(defaultFile));

  return defaultFile;
};

const readConfigFile = function (): DocConfigFile {
  if (fs.existsSync(configPath)) {
    try {
      const text = fs.readFileSync(configPath, 'utf-8');
      return JSON.parse(text) as DocConfigFile;
    } catch (err: any) {
      throw `Error parsing config file: ${err.message}`;
    }
  } else {
    return writeConfigDefault();
  }
};

interface DocConfig {
  getConfigFolder: () => string;
  getCredentials: (dbType: DBType) => { user: string; pass: string };
}

const docConfig: DocConfig = {
  getConfigFolder: function () {
    if (fs.existsSync(home)) {
      logger(`Found documents directory: ${home}`, LogType.SUCCESS);
    } else {
      logger(
        `Could not find documents directory. Creating at: ${home}`,
        LogType.WARNING
      );
      fs.mkdirSync(home);
    }
    return home;
  },

  getCredentials: function (dbType: DBType) {
    this.getConfigFolder();

    let configFile: DocConfigFile;
    try {
      configFile = readConfigFile();
      logger('Got config file: ', LogType.SUCCESS, configFile);
    } catch (err: any) {
      logger(err.message, LogType.WARNING);
      return { user: 'none', pass: 'none' };
    }

    if (dbType === DBType.Postgres) {
      return { user: configFile.pg_user, pass: configFile.pg_pass };
    }
    if (dbType === DBType.MySQL) {
      return { user: configFile.mysql_user, pass: configFile.mysql_pass };
    }
    logger('Could not get credentials of DBType: ', LogType.ERROR, dbType);
    return { user: 'none', pass: 'none' };
  },
};

module.exports = docConfig;
