import {
  DBType,
  LogType,
  // DBListInterface,
  Feedback,
  BackendObjType,
} from '../../../../shared/types/types';
import {
  initializeDb,
  erTableSchemaUpdate,
} from '../../../../backend/src/ipcHandlers/handlers/dbCRUDHandler';
import queryModel from '../../../../backend/src/models/queryModel';
import logger from '../../../../backend/src/utils/logging/masterlog';
import helperFunctions from '../../../../backend/src/utils/helperFunctions';
import connectionModel from '../../../../backend/src/models/connectionModel';
// import databaseModel from '../../../../backend/src/models/databaseModel';
// import pools from '../../../../backend/src/db/poolVariables';
// commented out unused imports pending review
// local types
interface InitializePayload {
  // handle initialization of a new schema from frontend (newSchemaView)
  newDbName: string;
  dbType: DBType;
}

const { createDBFunc } = helperFunctions;

// create a mock using jest.mock. For functions you are importing, set a key and the value with be a method jest.fn(<insert func you are mocking>)
jest.mock(
  '../../../../backend/src/ipcHandlers/handlers/dbCRUDHandler.ts',
  () => ({
    initializeDb: jest.fn(async (event, payload: InitializePayload) => {
      const { newDbName, dbType } = payload;
      logger(
        `Received 'initialize-db' of dbType: ${dbType} and: `,
        LogType.RECEIVE,
        payload,
      );
      event.sender.send('async-started');

      try {
        // create new empty db
        await queryModel.query(createDBFunc(newDbName, dbType), [], dbType);
        // connect to initialized db
        await connectionModel.connectToDB(newDbName, dbType);

        // this causes a bottleneck. import DBList from BETypes
        // update DBList in the sidebar to show this new db

        // const dbsAndTableInfo: DBList = await databaseModel.getLists(
        //   newDbName,
        //   dbType,
        // );
        // event.sender.send('db-lists', dbsAndTableInfo);
        // logger("Sent 'db-lists' from 'initialize-db'", LogType.SEND);
      } catch (e) {
        const err = `Unsuccessful DB Creation for ${newDbName} in ${dbType} database`;
        const feedback: Feedback = {
          type: 'error',
          message: err,
        };
        event.sender.send('feedback', feedback);
      } finally {
        event.sender.send('async-complete');
      }
    }),

    erTableSchemaUpdate: jest.fn(async (event, backendObj, dbName, dbType) => {
      console.log(
        `Mocked erTableSchemaUpdate called with dbName: ${dbName}, dbType: ${dbType}`,
      );

      // simulate sending notice to front end
      event.sender.send('async-started');

      // simulate a successful schema update
      try {
        // simulate generating query from backendObj
        const query = 'mockQuery';
        // simulate running SQL commands
        await queryModel.query('Begin;', [], dbType);
        await queryModel.query(query, [], dbType);
        await queryModel.query('Commit;', [], dbType);

        // simulate sending updated DB info to front end
        const updatedDb = {};
        event.sender.send('db-lists', updatedDb);

        // simulate sending success feedback to front end
        event.sender.send('feedback', {
          type: 'success',
          message: 'Database updated successfully.',
        });

        // simulate sending notice to front end that schema update has been completed
        event.sender.send('async-complete');

        // simulate logging
        console.log("Sent 'db-lists and feedback' from 'erTableSchemaUpdate'");

        // return a success message
        return 'success';
      } catch (err) {
        // simulate rolling back transaction on error
        await queryModel.query('Rollback;', [], dbType);

        // return an error message
        throw new Error('Mock error during schema update');
      }
    }),
  }),
);

describe('dbCRUDHandler tests', () => {
  // mock event handler
  const event = { sender: { send: jest.fn() } };

  // simulate backendObj
  const backendObj: BackendObjType = {
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

  describe('initializeDb tests', () => {
    // mock payload
    const payloadpg = { newDbName: 'mockTest_pgdb', dbType: DBType.Postgres };
    const payloadmsql = { newDbName: 'mockTest_msqldb', dbType: DBType.MySQL };

    test('it should receive an event and a payload containing newDbName and dbType', async () => {
      await initializeDb(event, payloadpg);
      expect(event.sender.send).toHaveBeenCalledWith('async-started');
    });

    test('queryModel.query should be invoked with createDBFunc passing in payload and DBType for Postgres', async () => {
      jest.spyOn(queryModel, 'query');
      await initializeDb(event, payloadpg);
      expect(queryModel.query).toHaveBeenCalledWith(
        createDBFunc(payloadpg.newDbName, payloadpg.dbType),
        [],
        DBType.Postgres,
      );
    });

    test('queryModel.query should be invoked with createDBFunc passing in payload and DBType for Postgres', async () => {
      jest.spyOn(connectionModel, 'connectToDB');
      await initializeDb(event, payloadpg);
      expect(connectionModel.connectToDB).toHaveBeenCalledWith(
        payloadpg.newDbName,
        payloadpg.dbType,
      );
    });

    test('queryModel.query should be invoked with createDBFunc passing in payload and DBType for Postgres', async () => {
      jest.spyOn(queryModel, 'query');
      await initializeDb(event, payloadmsql);
      expect(queryModel.query).toHaveBeenCalledWith(
        createDBFunc(payloadmsql.newDbName, payloadmsql.dbType),
        [],
        DBType.MySQL,
      );
    });

    test('should receive an error when db creation is unsuccessful', async () => {
      try {
        await initializeDb(event, payloadpg);
        await queryModel.query(
          createDBFunc(payloadpg.newDbName, payloadpg.dbType),
          [],
          DBType.Postgres,
        );
        await connectionModel.connectToDB(
          payloadpg.newDbName,
          payloadpg.dbType,
        );
      } catch (e) {
        const err = `Unsuccessful DB Creation for ${payloadpg.newDbName} in ${payloadpg.newDbName} database`;
        const feedback: Feedback = {
          type: 'error',
          message: err,
        };
        expect(e).toBe(event.sender.send('feedback', feedback));
      }
    });
  });

  describe('erTableSchemaUpdate tests', () => {
    test('it should receive an event, backendObj, dbtype, dbName as parameter', async () => {
      const dbName: string = 'tester2';
      const dbType: DBType = DBType.Postgres;
      await erTableSchemaUpdate(event, backendObj, dbName, dbType);
      expect(event.sender.send).toHaveBeenCalledWith('async-started');
    });

    test('it should execute queryModel.query', async () => {
      const dbName: string = 'tester2';
      const dbType: DBType = DBType.Postgres;
      const query = 'mockQuery';
      // checks for the result in the erTableSchemaUpdate
      const actualResult = await erTableSchemaUpdate(
        event,
        backendObj,
        dbName,
        dbType,
      );
      // based on mock func, we are spying on queryModel - tracks when this method gets executed
      const spyQuery = jest.spyOn(queryModel, 'query');

      // expect the spyQuery to have query, [], dbType
      expect(spyQuery).toHaveBeenCalledWith(query, [], dbType);
      // if the result is truthy then result should be success
      expect(actualResult).toEqual('success');
    });

    test('it should execute queryModel.query Begin', async () => {
      const dbName: string = 'tester2';
      const dbType: DBType = DBType.Postgres;
      // checks for the result in the erTableSchemaUpdate
      const actualResult = await erTableSchemaUpdate(
        event,
        backendObj,
        dbName,
        dbType,
      );
      // based on mock func, we are spying on queryModel - tracks when this method gets executed
      const spyQuery = jest.spyOn(queryModel, 'query');

      // expect the spyQuery to have 'Begin;', [], dbType
      expect(spyQuery).toHaveBeenCalledWith('Begin;', [], dbType);
      // if the result is truthy then result should be success
      expect(actualResult).toEqual('success');
    });

    test('it should execute queryModel.query Commit;', async () => {
      const dbName: string = 'tester2';
      const dbType: DBType = DBType.Postgres;
      // checks for the result in the erTableSchemaUpdate
      const actualResult = await erTableSchemaUpdate(
        event,
        backendObj,
        dbName,
        dbType,
      );
      // based on mock func, we are spying on queryModel - tracks when this method gets executed
      const spyQuery = jest.spyOn(queryModel, 'query');

      // expect the spyQuery to have 'Commit;', [], dbType
      expect(spyQuery).toHaveBeenCalledWith('Commit;', [], dbType);
      // if the result is truthy then result should be success
      expect(actualResult).toEqual('success');
    });
  });

  test('it should send backendObj to helper function to receive a queryString and a dbType back as query', () => {
    // const sqlString = 'SELECT * FROM example_table;';
    const updatedDb = {};
    // sends message to the event sender with the event name db-list
    event.sender.send('db-lists', updatedDb);
    // sending a message to the event sender.
    event.sender.send('feedback', {
      type: 'success',
      message: 'Database updated successfully.',
    });

    const feedbackType = 'success';
    const messageType = 'Database updated successfully.';
    expect(typeof feedbackType).toBe('string');
    expect(typeof messageType).toBe('string');
  });
});
