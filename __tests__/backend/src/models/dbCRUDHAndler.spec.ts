import 'text-encoding';
import { BackendObjType } from '../../../../shared/types/dbTypes'; 
import { DBType } from '../../../../backend/BE_types';
import { erTableSchemaUpdate } from '../../../../backend/src/ipcHandlers/handlers/dbCRUDHandler';



jest.mock('../../../../backend/src/utils/ertable-functions.ts', () => ({
  backendObjToQuery: jest.fn(),
}));

describe('dbCRUDHandler tests', () => {

  describe('erTableSchemaUpdate tests', () => {
      test('it should receive an event, backendObj, dbtype, dbName as parameter', async () => {
       
        const event = { sender: { send: jest.fn() } };
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
                table_schema: 'puclic',
                addColumns: [],
                dropColumns: [],
                alterColumns: [],
              },
            ],
          },
        };
        const dbName = 'tester2';
        const dbType = DBType.Postgres; 
        await erTableSchemaUpdate(event, backendObj, dbName, dbType);
        expect(event.sender.send).toHaveBeenCalledWith('async-started');
      });
    });

    test('it should send backendObj to helper function to receive a queryString and a dbType back as query', () => {

    });

    test('it should use query.queryString and query.dbType to run queryModel.query', () => {

    });

  });
  
