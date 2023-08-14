import { dbsInputted } from '../../../shared/types/dbTypes';
import { DocConfigFile } from '../../BE_types';
import { defaultFile } from './configModel';

// export const defaultFile: DocConfigFile = {
//   mysql_options: { user: '', password: '', port: 3306 },
//   pg_options: { user: '', password: '', port: 5432 },
//   rds_mysql_options: {
//     user: '',
//     password: '',
//     port: 3306,
//     host: '',
//   },
//   rds_pg_options: {
//     user: '',
//     password: '',
//     port: 5432,
//     host: '',
//   },
//   sqlite_options: { filename: '' },
//   directPGURI_options: { connectionString: '' },
// };

type DBState = DocConfigFile & { dbsInputted: dbsInputted };

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
};

export default dbState;
