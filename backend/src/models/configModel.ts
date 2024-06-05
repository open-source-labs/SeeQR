// import path from 'path';
import fs from 'fs';
import os from 'os';
import { DBType, LogType, DocConfigFile } from '../../../shared/types/types';
import logger from '../utils/logging/masterlog';

// HELPER FUNCTIONS

const home = `${os.homedir()}/Documents/SeeQR`;
const configFile = 'config.json';
const configPath = `${home}/${configFile}`;

// ideally, we want to keep this config in a separate file as well
export const defaultFile: DocConfigFile = {
  mysql_options: { user: 'root', password: '', port: 3306 },
  pg_options: { user: 'postgres', password: '', port: 5432 },
  rds_mysql_options: {
    user: '',
    password: '',
    port: 3306,
    host: '',
  },
  rds_pg_options: {
    user: '',
    password: '',
    port: 5432,
    host: '',
  },
  sqlite_options: { filename: '' },
  directPGURI_options: { connectionString: '' },
};

/**
 * Create and return default config file of database/login info
 * @returns object of default database configurations
 */
function writeConfigDefault(): DocConfigFile {
  logger('Could not find config file. Creating default', LogType.WARNING);
  fs.writeFileSync(configPath, JSON.stringify(defaultFile, null, 2));
  return defaultFile;
}

/**
 * Check if config.json object has the correct database properties (mysql, pg, etc.), tries to replace only the properties that are missing and return either the original or new object. Doesn't care about additional properties in the object besides those in const defaultFile.
 * @param currConfig current configuration
 * @returns configuration with only valid key value properties
 */
const checkConfigFile = (currConfig: DocConfigFile): DocConfigFile => {
  const invalidKeys: string[] = [];
  try {
    // pushes extra data from configFile to invalidKeys array
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
      'Error caught checking config file. Resetting config to default.',
      LogType.WARNING,
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
      fs.readFileSync(configPath, 'utf-8'),
    ) as DocConfigFile;
    return checkConfigFile(config);
  } catch (err) {
    console.log(err);
    logger(
      'Error caught checking config file. Resetting config to default.',
      LogType.WARNING,
    );
    return writeConfigDefault();
  }
}

interface GetCredentialsReturnType {
  [DBType.MySQL]: DocConfigFile['mysql_options'];
  [DBType.RDSMySQL]: DocConfigFile['rds_mysql_options'];
  [DBType.Postgres]: DocConfigFile['pg_options'];
  [DBType.RDSPostgres]: DocConfigFile['rds_pg_options'];
  [DBType.directPGURI]: DocConfigFile['directPGURI_options'];
  [DBType.CloudDB]: undefined;
  [DBType.SQLite]: DocConfigFile['sqlite_options'];
}

// ------------------------------
// MAIN FUNCTIONALITY
//

const docConfig = {
  /**
   * Checks if config file directory exists. If not, creates one
   * @returns config file directory
   */
  getConfigFolder(): string {
    if (fs.existsSync(home)) {
      logger(`Found documents directory: ${home}`, LogType.SUCCESS);
    } else {
      logger(
        `Could not find documents directory. Creating at: ${home}`,
        LogType.WARNING,
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
  getCredentials<K extends DBType>(dbType: K): GetCredentialsReturnType[K] {
    this.getConfigFolder(); // ensure directory exists
    const config = readConfigFile(); // all login info now in configFile

    return {
      [DBType.MySQL]: { ...config.mysql_options },
      [DBType.RDSMySQL]: { ...config.rds_mysql_options },
      [DBType.Postgres]: { ...config.pg_options },
      [DBType.RDSPostgres]: { ...config.rds_pg_options },
      [DBType.directPGURI]: { connectionString: '' },
      [DBType.CloudDB]: undefined,
      [DBType.SQLite]: { ...config.sqlite_options },
    }[dbType];
  },

  /**
   * Reads config file contents and returns it all.
   * @returns all login info from config file
   */
  getFullConfig() {
    this.getConfigFolder();
    let config: DocConfigFile;
    try {
      config = readConfigFile();
      return config;
    } catch (err) {
      logger(
        typeof err === 'object' &&
          err !== null &&
          'message' in err &&
          typeof err.message === 'string'
          ? err.message
          : `Error occurred in getFullConfig : ${err}`,
        LogType.WARNING,
      );
      return undefined;
    }
  },

  /**
   * Takes config data object sent from frontend, stringifies it and saves in config file
   * @param config
   */
  saveConfig(config: DocConfigFile) {
    try {
      fs.writeFileSync(configPath, JSON.stringify(config));
      logger('Saved new config: ', LogType.NORMAL, config);
    } catch (err: any) {
      logger(err.message, LogType.WARNING);
    }
  },
};

export default docConfig;


