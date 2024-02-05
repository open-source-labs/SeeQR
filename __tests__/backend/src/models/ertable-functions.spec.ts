import   backendObjToQuery   from "../../../../backend/src/utils/ertable-functions";
import { BackendObjType, DBType } from '../../../../shared/types/dbTypes';

describe('ertable-functions tests', () => {

  // mock backendObj
  const backendObj: BackendObjType  = {
    database: 'tester2',
    updates: {
      addTables: [
        {
          is_insertable_into: 'yes',
          table_name: 'NewTable8',
          table_schema: 'public',
          table_catalog: 'tester2',
          columns: [],
        },
      ],

      dropTables: [
        {
          table_name: 'newtable5',
          table_schema: 'public',
        },
      ],

      alterTables: [
        {
          is_insertable_into: null,
          table_catalog: 'tester2',
          table_name: 'newtable7',
          new_table_name: null,
          table_schema: 'public',
          addColumns: [],
          dropColumns: [],
          alterColumns: [],
        },
        {
          is_insertable_into: null,
          table_catalog: 'tester2',
          table_name: 'newtable7',
          new_table_name: null,
          table_schema: 'public',
          addColumns: [],
          dropColumns: [],
          alterColumns: [],
        },
      ],
    },
  };
  describe('backendObjToQuery tests', () => {
    test('it should create a query string for Postgres database', () => {
      const dbType = DBType.Postgres;
      const result = backendObjToQuery(backendObj, dbType);
      expect(typeof result).toBe('string');

    });

    test('it should create a query string for MySQL database', ()=>{
      const dbType = DBType.MySQL;
      const result = backendObjToQuery(backendObj, dbType);
      expect(typeof result).toBe('string');
   
    })

    //cannot access the functions scoped inside alterTable and renameTablesColumns therefore cannot be tested


  });
});