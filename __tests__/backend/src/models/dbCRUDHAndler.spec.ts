describe('dbCRUDHandler tests', () => {
  // setBaseConnections
  describe('erTableSchemaUpdate tests', () => {
    test('it should only receive backendObj as parameter', () => {});
    test('it should send async started back to frontend', () => {});
    test(
      'it should send backendObj to helper function to receive a queryString and a dbType back as query',
    );
    test(
      'it should use query.queryString and query.dbType to run queryModel.query',
    );
  });
});

describe('ertable-functions tests', () => {
  describe('erdObjToQuery tests', () => {
    test('it should only receive backendObj as parameter', () => {});
    test('it should create an empty array', () => {});
    test('it should identity the erdDbType from dbState', () => {});
    test('it should use erdDbType to pick an appropriate query function for backendObj to act on and receive a query bacj', () => {});
    test('it should return a query string');
  });
});

/*
const backendObj = {
    database: 'tester2',
    updates: {
     addTables: [
      {
       is_insertable_into: 'yes',
       table_name: 'NewTable8',
       table_schema: 'puclic',
       table_catalog: 'tester2',
       columns: []
      }
     ],
     
     dropTables: [{
      table_name: 'newtable5',
      table_schema: 'puclic'
      }
     ],

     alterTables: [
      {
        is_insertable_into: null,
        table_catalog: 'tester2',
        table_name: 'newtable7',
        new_table_name: null,
        table_schema: 'puclic',
        addColumns: [Array],
        dropColumns: [],
        alterColumns: []
      },
      {
        is_insertable_into: null,
        table_catalog: 'tester2',
        table_name: 'newtable7',
        new_table_name: null,
        table_schema: 'puclic',
        addColumns: [Array],
        dropColumns: [],
        alterColumns: []
      }]
    }
}
*/
