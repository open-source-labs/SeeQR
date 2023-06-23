/* eslint-disable no-throw-literal */
/* eslint-disable no-shadow */
/* eslint-disable object-shorthand */
// import path from 'path';
import fs from 'fs';
import os from 'os';
import { DBType, DocConfigFile, LogType } from './BE_types';
import logger from './Logging/masterlog';

/*
junaid
file writes the original config (login) file to users hardware
*/

const home = `${os.homedir()}/Documents/SeeQR`;
const configFile = `config.json`;
const configPath = `${home}/${configFile}`;
const defaultFile: DocConfigFile = {
  mysql: { user: '', password: '', port: 3306 },
  pg: { user: '', password: '', port: 5432 },
  rds_mysql: { user: '', password: '', port: 3306, host: '' },
  rds_pg: { user: '', password: '', port: 5432, host: '' },
  sqlite: { path: '' },
  directPGURI: { uri: '' }
};
function writeConfigDefault(): DocConfigFile {
  logger('Could not find config file. Creating default', LogType.WARNING);
  fs.writeFileSync(configPath, JSON.stringify(defaultFile));
  return defaultFile;
};

// Check if config.json object has the correct database properties (mysql, pg, etc.), tries to replace only the properties that are missing and return either the original or new object. Doesn't care about additional properties in the object besides those in const defaultFile.
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
    logger(
      `Error caught checking config file. Resetting config to default.`,
      LogType.WARNING
    );
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

/**
 * Reads config file data and sends it into checkConfigFile, then returns the result
 * If an error occurs during read, the config file will be set back to default 
 * @returns config file contents (login info for each database type)
 */
function readConfigFile(): DocConfigFile {
  try {
    const config = JSON.parse(
      fs.readFileSync(configPath, 'utf-8')
    ) as DocConfigFile;
    return checkConfigFile(config);
  } catch (err: any) {
    console.log(err);
    logger(
      `Error caught checking config file. Resetting config to default.`,
      LogType.WARNING
    );
    return writeConfigDefault();
  }
};

interface DocConfig {
  getConfigFolder: () => string;
  getCredentials: (dbType: DBType) => {
    URI?: string //added uri and ? to each key
    user?: string;
    password?: string;
    host?: string;
    port: number | string;
    uri?: string;
    path?: string;
  };
  getFullConfig: () => Object;
  saveConfig: (config: Object) => void;
}

const docConfig: DocConfig = {
  /**
   * Checks if config file directory exists. If not, creates one
   * @returns config file directory
   */
  getConfigFolder: function getConfigFolder() {
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

  /**
   * Grabs login info from config file
   * @param dbType: desired database type for login info
   * @returns login info for the desired database type
   */
  getCredentials: function getCredentials(dbType: DBType) {
    this.getConfigFolder(); // ensure directory exists 
    let configFile: DocConfigFile;
    try {
      configFile = readConfigFile(); // all login info now in configFile
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
    // // asdf check sqlite and directpguri and format for return in case of error
    // if (dbType === DBType.SQLite) {
    //   return { ...configFile.sqlite };
    // }
    // if (dbType === DBType.directPGURI) {
    //   return { ...configFile.directPGURI };
    // }

    logger('Could not get credentials of DBType: ', LogType.ERROR, dbType);
    return { user: '', password: '', port: 1 };
  },

  /**
   * 
   * @returns all login info from config file
   */
  getFullConfig: function getFullConfig() {
    this.getConfigFolder();
    let configFile: DocConfigFile;
    try {
      configFile = readConfigFile();
      return configFile;
    } catch (err: any) {
      logger(err.message, LogType.WARNING);
      return 'Failed to retrieve data.';
    }
  },

  /**
   * Takes config data object sent from frontend, stringifies it and saves in config file
   * @param config 
   */
  saveConfig: function saveConfig(config: Object) {
    try {
      fs.writeFileSync(configPath, JSON.stringify(config));
      logger('Saved new config: ', LogType.NORMAL, config);
    } catch (err: any) {
      logger(err.message, LogType.WARNING);
    }
  },
};

module.exports = docConfig;
