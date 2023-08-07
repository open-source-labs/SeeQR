import { dbsInputted } from '../../../shared/types/dbTypes';
import docConfig, { defaultFile } from './configModel';

// type declaration
type dbStateType = {
  pg_uri: string;
  curPG_DB: string;
  curMSQL_DB: string;
  curRDS_MSQL_DB: any;
  curRDS_PG_DB: {
    user?: string;
    password?: string;
    host?: string;
  };
  curSQLite_DB: {
    path: string;
  };
  curdirectPGURI_DB: string;
  dbsInputted: dbsInputted;
};

// dbState holds info about current databse accessed. Functionalities from other models are assigned to it

const dbState: dbStateType = {
  // NEEDS UPDATE TO PETERS NEW SYNTAX
  pg_uri: '',
  pg_options: defaultFile.pg_options,
  mysql_options: defaultFile.mysql_options,
  rds_mysql_options: defaultFile.rds_mysql_options,
  rds_pg_options: defaultFile.rds_pg_options,
  sqlite_options: defaultFile.sqlite_options,
  directPGURI_options: defaultFile.directPGURI_options,
  // pg_uri: '',
  // curPG_DB: '',
  // curMSQL_DB: '',
  // curRDS_MSQL_DB: {
  //   user: '',
  //   password: '',
  //   host: '',
  // },
  // curRDS_PG_DB: {
  //   user: '',
  //   password: '',
  //   host: '',
  // },
  // curSQLite_DB: { path: '' },
  // curdirectPGURI_DB: '',
  dbsInputted: {
    pg: false,
    msql: false,
    rds_pg: false,
    rds_msql: false,
    sqlite: false,
    directPGURI: false,
  },
};

export default dbState;
