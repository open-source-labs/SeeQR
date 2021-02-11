const { ipcMain } = require('electron'); // IPCMain: Communicate asynchronously from the main process to renderer processes
const db = require('./models');
const { generateDummyData, writeCSVFile } = require('./DummyD/dummyDataMain');

const {
  createDBFunc,
  dropDBFunc,
  runSQLFunc,
  runTARFunc,
  runFullCopyFunc,
  runHollowCopyFunc,
  execute,
} = require('./helperFunctions');

// *************************************************** IPC Event Listeners *************************************************** //
ipcMain.on('return-db-list', (event) => {
  // event.sender.send('async-started'); // send notice to the frontend that async process has begun
  db.getLists()
    .then((data) => {
      event.sender.send('db-lists', data);
      // event.sender.send('async-complete');
    })
    .catch((err) => {
      const feedback = {
        type: 'error',
        message: err,
      };
      event.sender.send('feedback', feedback);
    });
});

// Listen for database changes sent from the renderer upon changing tabs.
ipcMain.on('change-db', (event, dbName: string) => {
  // event.sender.send('async-started'); // send notice to the frontend that async process has begun
  db.changeDB(dbName);
  // event.sender.send('async-complete'); // send notice to the frontend that async process has completed
});

// Deletes the dbName that is passed from the front end and returns the DB List
ipcMain.on('drop-db', (event, dbName: string, currDB: Boolean) => {
  const feedback: { type?: string; message?: string } = {};
  event.sender.send('async-started');
  const dropDBScript = dropDBFunc(dbName);
  if (currDB) {
    db.closePool();
    db.changeDB();
  }
  db.query(dropDBScript)
    .catch((err) => {
      feedback.type = 'error';
      feedback.message = err;
    })
    .finally(() => {
      db.getLists().then((data) => {
        event.sender.send('db-lists', data);
        event.sender.send('feedback', feedback);
        event.sender.send('async-complete');
      });
    });
});

/**
 * This function allows users to import the DB using the + icon on the front end
 * Users can import a .tar or .sql file
 * Additionally, this function allows the user to copy an existing database and optionally copy the data in the db
 */
interface SchemaType {
  schemaName: string;
  schemaFilePath: string[];
  schemaEntry: string;
  dbCopyName: string;
  copy: boolean;
}
ipcMain.on('input-schema', (event, data: SchemaType) => {
  // send notice to the frontend that async process has begun
  event.sender.send('async-started');

  const {
    dbCopyName: dbNameUserSelectedToCopy,
    copy: copyAllDataFromUserSelectedDB,
  } = data;
  let {
    schemaName: dbNameEnteredByUser,
    schemaFilePath: importedSchemaFilePath,
  } = data;
  const extension: string = Array.isArray(importedSchemaFilePath)
    ? importedSchemaFilePath[0].slice(
        importedSchemaFilePath[0].lastIndexOf('.')
      )
    : '.sql';

  // conditional to get the correct schemaFilePath name from the Load Schema Modal
  if (!importedSchemaFilePath) {
    importedSchemaFilePath = [`${dbNameEnteredByUser}.sql`];
  }

  // defaults to the sql file name if DB name is not provided by user
  if (dbNameEnteredByUser === '') {
    dbNameEnteredByUser = `a${Math.floor(
      Math.random() * 1000000000000000
    ).toString()}`;
  }

  // Each function returns the Postgres command that will be executed on the command line by invoking the execute function
  const createDB: string = createDBFunc(dbNameEnteredByUser);
  const runSQL: string = runSQLFunc(
    dbNameEnteredByUser,
    importedSchemaFilePath
  );
  const runTAR: string = runTARFunc(
    dbNameEnteredByUser,
    importedSchemaFilePath
  );
  const runFullCopy: string = runFullCopyFunc(
    dbNameUserSelectedToCopy,
    importedSchemaFilePath
  );
  const runHollowCopy: string = runHollowCopyFunc(
    dbNameUserSelectedToCopy,
    importedSchemaFilePath
  );

  // Change the URI to new DB, send DB lists and tables in current DB
  async function sendLists() {
    const listObj: any = await db.getLists();
    event.sender.send('db-lists', listObj);
    event.sender.send('async-complete');
  }

  const changeCurrentDB = () => {
    db.changeDB(dbNameEnteredByUser);
    const runCmd: string = extension === '.sql' ? runSQL : runTAR;
    execute(runCmd, sendLists);
  };

  const importOrCopyExistingDB = () => {
    // User selected to copy from existing DB Schema
    if (dbNameUserSelectedToCopy) {
      // change DB instance to the DB the User wants to copy
      db.changeDB(dbNameUserSelectedToCopy);
      // If User wanted to copy data from Existing DB execute rullFullCopy
      if (copyAllDataFromUserSelectedDB) {
        execute(runFullCopy, changeCurrentDB);
      }
      // Else execute runHollowCopy
      else execute(runHollowCopy, changeCurrentDB);
    } else {
      changeCurrentDB();
    }
  };

  db.query(createDB).then(() => importOrCopyExistingDB());
  // Run createDB script on command line via Node.js and then execute CB
  // execute(createDB, importOrCopyExistingDB);
});

// Listen for queries being sent from renderer
interface QueryType {
  queryCurrentSchema: string;
  queryString: string;
  queryLabel: string;
  queryData: string;
  queryStatistics: string;
}
ipcMain.on('execute-query-tracked', (event, data: QueryType) => {
  // send notice to front end that query has been started
  event.sender.send('async-started');

  // destructure object from frontend
  const { queryCurrentSchema, queryLabel } = data;
  let { queryString } = data;

  // Removing semicolon if its added to the end of the query
  if (queryString[queryString.length - 1] === ';')
    queryString = queryString.slice(0, queryString.length - 1);

  // initialize object to store all data to send to frontend
  const frontendData = {
    queryString,
    queryCurrentSchema,
    queryLabel,
    queryData: '',
    queryStatistics: '',
  };

  // potential create table query
  // CREATE TABLE IF NOT EXISTS test4 (
  //   id SERIAL PRIMARY KEY,
  //   name VARCHAR NOT NULL,
  //   mass VARCHAR
  // )
  const feedback: { type?: string; message?: string } = {};
  db.query(`BEGIN; EXPLAIN (FORMAT JSON, ANALYZE) ${queryString}; ROLLBACK;`)
    .then((queryStats) => {
      frontendData.queryStatistics = queryStats[1].rows;
    })
    .catch((err) => {
      feedback.type = 'error';
      feedback.message = `Cannot run EXPLAIN. \n ${err}`;
    })
    .finally(() => {
      db.query(queryString)
        .then((queryData) => {
          frontendData.queryData = queryData.rows;
          if (!feedback.type) {
            feedback.type = 'success';
            feedback.message = 'Success!';
          }
        })
        .catch((err) => {
          feedback.type = 'error';
          feedback.message = err;
        })
        .finally(async () => {
          // (function getListAsync() {
          const listObj = await db.getLists();
          // frontendData.lists = listObj;
          event.sender.send('db-lists', listObj);
          event.sender.send('return-execute-query', frontendData);
          event.sender.send('feedback', feedback);
          event.sender.send('async-complete');
        });
    });
});

interface dummyDataRequestType {
  schemaName: string;
  dummyData: {};
}
ipcMain.on('generate-dummy-data', (event: any, data: dummyDataRequestType) => {
  // send notice to front end that DD generation has been started
  event.sender.send('async-started');
  let schemaLayout: any;
  const dummyDataRequest: dummyDataRequestType = data; // { schemaName: 'hello', dummyData: { people: 1 } }
  let tableMatricesArray: any;
  let keyObject: any = 'Unresolved';

  // Retrieves the Primary Keys and Foreign Keys for all the tables
  //   tableName: { primaryKeyColumns: { _id: true }, foreignKeyColumns: { key: value, key: value} },
  db.createKeyObject().then((result) => {
    keyObject = result;
    // Iterating over the passed in keyObject to remove the primaryKeyColumn and all foreignKeyColumns from table
    // db.dropKeyColumns(keyObject).then(() => {
    // db.addNewKeyColumns(keyObject).then(() => {
    db.getSchemaLayout().then((schemaLayoutResult) => {
      console.log('schemaLayout: ', schemaLayoutResult);
      console.log('films layout: ', schemaLayoutResult.tables.films[0]);
      console.log('films layout: ', schemaLayoutResult.tables.films[1]);
      schemaLayout = schemaLayoutResult;
      // generate the dummy data and save it into matrices associated with table names
      tableMatricesArray = generateDummyData(
        schemaLayout,
        dummyDataRequest,
        keyObject
      );
      // iterate through tableMatricesArray to write individual .csv files
      for (const tableObject of tableMatricesArray) {
        // write all entries in tableMatrix to csv file
        writeCSVFile(
          tableObject,
          schemaLayout,
          keyObject,
          dummyDataRequest,
          event
        );
      }
    });
  });
});

export default execute;
