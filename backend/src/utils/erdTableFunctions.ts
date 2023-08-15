import { ErdUpdatesType } from '../../../shared/types/erTypes';
import { queryPostgres } from './erdCUD/pSqlCUD';
import { queryMySql } from './erdCUD/mySqlCUD';
import { querySqLite } from './erdCUD/SqLiteCUD';
import { DBType } from '../../../shared/types/dbTypes';

function erdUpdatesToQuery(
  updatesArray: ErdUpdatesType,
  currentERD: DBType,
): string {
  let returnArray: string[] = [];

  // check current dbType of active ERD table and pick a query method
  // const currentERD = 'pg'; // replace this later with dbState below

  switch (currentERD) {
    case DBType.Postgres:
    case DBType.RDSPostgres:
      returnArray = queryPostgres(updatesArray);
      break;

    // TODO: queryMySql has not been written.
    case DBType.MySQL:
    case DBType.RDSMySQL:
      returnArray = queryMySql(updatesArray);
      break;

    // TODO: querySqLite has not been written. it is just a copy of queryPostgres
    case DBType.SQLite:
      returnArray = querySqLite(updatesArray);
      break;

    default:
      returnArray = [];
      console.error(`Unknown DBType: ${currentERD}`); // errors for switch question is where does this go to?
      break;
  }

  // return array will need to join with space between each query

  return returnArray.join(' ');
}

export default erdUpdatesToQuery;
