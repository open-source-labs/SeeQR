import {
  generatePostgresColumnQuery,
  queryPostgres,
} from '../../../../../backend/src/utils/erdCUD/pSqlCUD';
import {
  PsqlColumnOperations,
  ErdUpdatesType,
  PSqlDataType,
} from '../../../../../shared/types/erTypes';

describe('pSqlCUD', () => {
  describe('generatePostgresAlterQuery', () => {
    const tableName = 'test';

    describe('addColumn', () => {
      it('should return correct string without Type defined', () => {
        const addWithoutType: PsqlColumnOperations = {
          columnAction: 'addColumn',
          columnName: 'hello',
        };
        expect(generatePostgresColumnQuery(tableName, addWithoutType)).toEqual(
          'ADD COLUMN hello',
        );
      });

      it('should return correct string with Type defined', () => {
        const addWithType: PsqlColumnOperations = {
          columnAction: 'addColumn',
          columnName: 'hello2',
          type: 'CHAR',
        };
        expect(generatePostgresColumnQuery(tableName, addWithType)).toEqual(
          'ADD COLUMN hello2 TYPE CHAR',
        );
      });
    });

    describe('dropColumn', () => {
      it('should return drop column string', () => {
        const drop: PsqlColumnOperations = {
          columnAction: 'dropColumn',
          columnName: 'drop',
        };
        expect(generatePostgresColumnQuery(tableName, drop)).toEqual(
          'DROP COLUMN drop',
        );
      });
    });

    describe('alterColumnType', () => {
      it('should return string with desired alter type', () => {
        const alterColumnType: PsqlColumnOperations = {
          columnAction: 'alterColumnType',
          columnName: 'alterColumnType',
          type: 'INTEGER',
        };
        expect(generatePostgresColumnQuery(tableName, alterColumnType)).toEqual(
          'ALTER COLUMN alterColumnType TYPE INTEGER',
        );
      });
    });

    describe('renameColumn', () => {
      it('should return string with renamed column', () => {
        const renameColumn: PsqlColumnOperations = {
          columnAction: 'renameColumn',
          columnName: 'before',
          newColumnName: 'after',
        };
        expect(generatePostgresColumnQuery(tableName, renameColumn)).toEqual(
          'RENAME COLUMN before TO after',
        );
      });
    });

    describe('togglePrimary', () => {
      it('should return string for primary set to TRUE', () => {
        const primaryTrue: PsqlColumnOperations = {
          columnAction: 'togglePrimary',
          columnName: 'true',
          isPrimary: true,
        };
        expect(generatePostgresColumnQuery(tableName, primaryTrue)).toEqual(
          'ADD PRIMARY KEY (true)',
        );
      });
      it('should return string for primary set to FALSE', () => {
        const primaryTrue: PsqlColumnOperations = {
          columnAction: 'togglePrimary',
          columnName: 'false',
          isPrimary: false,
        };
        expect(generatePostgresColumnQuery(tableName, primaryTrue)).toEqual(
          'DROP CONSTRAINT users_pkey',
        );
      });
    });

    describe('toggleForeign', () => {
      it('should return string for making foreign TRUE', () => {
        const foreignTrue: PsqlColumnOperations = {
          columnAction: 'toggleForeign',
          columnName: 'true',
          hasForeign: true,
          foreignTable: 'foreignTable',
          foreignColumn: 'foreignColumn',
          foreignConstraint: 'foreignConstraint',
        };
        expect(generatePostgresColumnQuery(tableName, foreignTrue)).toEqual(
          'ADD CONSTRAINT foreignConstraint FOREIGN KEY (true) REFERENCES foreignTable (foreignColumn)',
        );
      });
      it('should return string for making foreign FALSE', () => {
        const foreignTrue: PsqlColumnOperations = {
          columnAction: 'toggleForeign',
          columnName: 'false',
          hasForeign: false,
          foreignConstraint: 'foreignConstraint',
        };
        expect(generatePostgresColumnQuery(tableName, foreignTrue)).toEqual(
          'DROP CONSTRAINT foreignConstraint',
        );
      });
    });

    describe('toggleUnique', () => {
      it('should return string for making unique TRUE', () => {
        const uniqueTrue: PsqlColumnOperations = {
          columnAction: 'toggleUnique',
          columnName: 'true',
          isUnique: true,
        };
        expect(generatePostgresColumnQuery(tableName, uniqueTrue)).toEqual(
          'ADD UNIQUE (true)',
        );
      });
      it('should return string for making unique FALSE', () => {
        const uniqueTrue: PsqlColumnOperations = {
          columnAction: 'toggleUnique',
          columnName: 'false',
          isUnique: false,
        };
        expect(generatePostgresColumnQuery(tableName, uniqueTrue)).toEqual(
          'DROP CONSTRAINT test_false_key',
        );
      });
    });
  });

  describe('queryPostgres', () => {
    describe('all case test', () => {
      it('should return array of strings with add, drop, alter, and column', () => {
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
          {
            action: 'alter',
            tableName: 'table3',
            tableSchema: 'public',
            newTableName: 'alteredTable3',
          },
          {
            action: 'column',
            tableName: 'table4',
            tableSchema: 'public',
            columnOperations: {
              columnAction: 'dropColumn',
              columnName: 'table4column',
            },
          },
        ];
        expect(queryPostgres(updatesArray)).toStrictEqual([
          'CREATE TABLE public.table1;',
          'DROP TABLE public.table2;',
          'ALTER TABLE public.table3 RENAME TO alteredTable3;',
          'ALTER TABLE public.table4 DROP COLUMN table4column;',
        ]);
      });
    });
  });
});
