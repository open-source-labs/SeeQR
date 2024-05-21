import erdUpdatesToQuery from '../../../../backend/src/utils/erdTableFunctions';
import { ErdUpdatesType, DBType } from '../../../../shared/types/types';

describe('erdTableFunctions', () => {
  //   jest.mock(
  //     '../../../../backend/src/models/stateModel',
  //     () =>
  //       ({
  //         default: {
  //           currentERD: DBType.Postgres,
  //         },
  //       } as typeof import('../../../../backend/src/models/stateModel')),
  //   );

  it('should return a big string from case POSTGRES and RDSPOSTGRES', () => {
    const updatesArray: ErdUpdatesType = [
      {
        action: 'add',
        tableName: 'table1',
        tableSchema: 'public',
      },
      {
        action: 'drop',
        tableName: 'table2',
        tableSchema: 'public',
      },
    ];

    const currentERD: DBType = DBType.Postgres;

    expect(erdUpdatesToQuery(updatesArray, currentERD)).toEqual(
      'CREATE TABLE public.table1; DROP TABLE public.table2;',
    );
  });
});
