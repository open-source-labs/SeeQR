import { dbsInputted, DBType } from '../../../shared/types/dbTypes';
import { DocConfigFile } from '../../BE_types';
import { defaultFile } from './configModel';

type DBState = DocConfigFile & {
  dbsInputted: dbsInputted;
  currentERD: DBType;
  currentDb: string;
};

const dbState: DBState = {
  // NEEDS UPDATE TO PETERS NEW SYNTAX
  pg_options: defaultFile.pg_options,
  mysql_options: defaultFile.mysql_options,
  rds_mysql_options: defaultFile.rds_mysql_options,
  rds_pg_options: defaultFile.rds_pg_options,
  sqlite_options: defaultFile.sqlite_options,
  directPGURI_options: defaultFile.directPGURI_options,

  dbsInputted: {
    pg: false,
    msql: false,
    rds_pg: false,
    rds_msql: false,
    sqlite: false,
    directPGURI: false,
  },

  // current ERD Db type
  currentERD: DBType.Postgres,

  // current Database
  currentDb: '',
};

export default dbState;
