/* eslint-disable no-throw-literal */
/* eslint-disable no-shadow */
/* eslint-disable object-shorthand */
// import path from 'path';
import fs from 'fs';
import os from 'os';
import { DBType, DocConfigFile, LogType } from './BE_types';
import logger from './Logging/masterlog';

const home = `${os.homedir()}/Documents/SeeQR`;
const configFile = `config.json`;
const configPath = `${home}/${configFile}`;
const defaultFile: DocConfigFile = {
  mysql: { user: '', password: '', port: 3306 },
  pg: { user: '', password: '', port: 5432 },
  rds_mysql: { user: '', password: '', port: 3306, host: '' },
  rds_pg: { user: '', password: '', port: 5432, host: '' },
};
const writeConfigDefault = function (): DocConfigFile {
  logger('Could not find config file. Creating default', LogType.WARNING);
  fs.writeFileSync(configPath, JSON.stringify(defaultFile));
  return defaultFile;
};

// Check if config.json has the relevant database properties, tries to replace only the properties that are missing and return either the original or new object. Doesn't care about additional properties
const checkConfigFile = function (currConfig: DocConfigFile): DocConfigFile {
  const invalidKeys: string[] = [];
  try {
    Object.keys(defaultFile).forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(currConfig, key)) {
        invalidKeys.push(key);
      } else {
        Object.keys(defaultFile[key]).forEach((field) => {
          if (!Object.prototype.hasOwnProperty.call(currConfig[key], field)) {
            invalidKeys.push(key);
          }
        });
      }
    });
  } catch (err) {
    console.log(err);
    return writeConfigDefault();
  }
  if (invalidKeys.length) {
    const newConfig = { ...currConfig };
    invalidKeys.forEach((key) => {
      newConfig[key] = defaultFile[key];
    });
    fs.writeFileSync(configPath, JSON.stringify(newConfig));
    return newConfig;
  }
  return currConfig;
};

const readConfigFile = function (): DocConfigFile {
  try {
    const config = JSON.parse(
      fs.readFileSync(configPath, 'utf-8')
    ) as DocConfigFile;
    return checkConfigFile(config);
  } catch (err: any) {
    console.log(err);
    return writeConfigDefault();
  }
};
interface DocConfig {
  getConfigFolder: () => string;
  getCredentials: (dbType: DBType) => {
    user: string;
    password: string;
    host?: string;
    port: number | string;
  };
  getFullConfig: () => Object;
  saveConfig: (config: Object) => void;
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
    } catch (err: any) {
      logger(err.message, LogType.WARNING);
      return { user: '', password: '', port: 1 };
    }

    if (dbType === DBType.Postgres) {
      return { ...configFile.pg };
    }
    if (dbType === DBType.MySQL) {
      return { ...configFile.mysql };
    }
    if (dbType === DBType.RDSMySQL) {
      return { ...configFile.rds_mysql };
    }
    if (dbType === DBType.RDSPostgres) {
      return { ...configFile.rds_pg };
    }

    logger('Could not get credentials of DBType: ', LogType.ERROR, dbType);
    return { user: '', password: '', port: 1 };
  },

  getFullConfig: function () {
    this.getConfigFolder();
    let configFile: DocConfigFile;
    try {
      configFile = readConfigFile();
      return configFile;
    } catch (err: any) {
      logger(err.message, LogType.WARNING);
      console.log('Error in getFullConfig ', err);
      return 'Failed to retrieve data.';
    }
  },

  saveConfig: function (config: Object) {
    try {
      fs.writeFileSync(configPath, JSON.stringify(config));
      logger('Saved new config: ', LogType.NORMAL, config);
    } catch (err: any) {
      logger(err.message, LogType.WARNING);
    }
  },
};

module.exports = docConfig;
