import { ErdUpdatesType } from '../../../shared/types/erTypes';
import queryPostgres from './erdAlters/psqlAlter';
import { DBType } from '../../../shared/types/dbTypes';

export function erdUpdatesToQuery(updatesArray: ErdUpdatesType): string {
  let returnArray: string[];

  // check current dbType of active ERD table and pick a query method
  const activeErdSQL = 'item from dbState'; // replace this later with dbState

  switch (activeErdSQL) {
    case DBType.Postgres:
    case DBType.RDSPostgres:
      returnArray = queryPostgres(updatesArray);
      break;

    // case DBType.MySQL:
    // case DBType.RDSMySQL:
    //   returnArray = queryMySql(updatesArray);
    //   break;

    // case DBType.SQLite:
    //   returnArray = querySQLite(returnArray);
    //   break;
  }

  return returnArray.join('');
}
