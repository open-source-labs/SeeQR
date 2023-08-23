import fs from 'fs';

// Types
import { DBList, DBType, LogType, QueryPayload } from '../../../BE_types';

// Helpers
import logger from '../../utils/logging/masterlog';
import helperFunctions from '../../utils/helperFunctions';

// Models used
import connectionModel from '../../models/connectionModel';
import queryModel from '../../models/queryModel';
import databaseModel from '../../models/databaseModel';
// import db from '../../../models';

const { explainQuery } = helperFunctions;

/**
 * EVENT: 'run-query'
 *
 * DEFINITION: QUERY MODE (CRUD): Handle run-query events passed from the front-end, and send back an updated DB List for the query view. also show statistics
 *
 * Process involes the following steps:
 * 1. instantiates information like total sampletime, min, max, avg.
 * 2. creates a parseExplainExplanation for transcribing query results back to english
 * 3. connect to desired DB if query is not on current DB
 * 4. attempts to extract EXPLAIN on each db. explain is an execution plan
 * 5. run Query with queryModel.query() and return a big object of all the desired results
 * 6. will connect back to inital database if query was on a different table
 * 7. databaseModel.getLists since list is now updated (this is for every query doe, which is repetitive since not all queries affect the original databse )
 * 8. returns getLists object back
 *
 * ISSUES:
 * 1. currently there are functionalities in this handler. lets break them away.
 * 2. personally not a fan of global queries. why aren't queries local? and if you do want global queries, you should not be able to go back to your current db view (aka silo the query page to a different entity)
 * CRUD is not distringuished
 */

export async function runQuery(
  event,
  { targetDb, sqlString, selectedDb, runQueryNumber }: QueryPayload,
  dbType: DBType,
) {
  logger(
    "Received 'run-query'",
    LogType.RECEIVE,
    `selectedDb: ${selectedDb} and dbType: ${dbType} and runQueryNumber: ${runQueryNumber}`,
  );
  event.sender.send('async-started');
  const arr: any[] = []; // array of sample
  const numberOfSample: number = runQueryNumber;
  let totalSampleTime: number = 0;
  let minimumSampleTime: number = 0;
  let maximumSampleTime: number = 0;
  let averageSampleTime: number = 0;

  function parseExplainExplanation(explain: string) {
    const regex = /actual time=(\d+\.\d+)\.\.(\d+\.\d+) rows=\d+ loops=(\d+)/g;
    const matches: string[][] = Array.from(explain.matchAll(regex));
    let result: number = 0;
    for (let i = 0; i < matches.length; i += 1) {
      result +=
        (parseFloat(matches[i][2]) - parseFloat(matches[i][1])) *
        parseFloat(matches[i][3]);
    }
    return result;
  }

  try {
    let error: string | undefined;
    // connect to db to run query

    if (selectedDb !== targetDb)
      await connectionModel.connectToDB(targetDb, dbType);

    // Run Explain
    let explainResults;
    try {
      // console.log('start of try');
      for (let i = 0; i < numberOfSample; i++) {
        // console.log('start of for loopo');
        if (dbType === DBType.Postgres) {
          const results = await queryModel.query(
            explainQuery(sqlString, dbType),
            [],
            dbType,
          );

          // console.log('query results', results);
          // console.log('explain query results', results[1].rows);
          // console.log('query plan including sample time data', results[1].rows[0]["QUERY PLAN"][0]);

          explainResults = results[1].rows;
          const eachSampleTime: any =
            results[1].rows[0]['QUERY PLAN'][0]['Planning Time'] +
            results[1].rows[0]['QUERY PLAN'][0]['Execution Time'];
          arr.push(eachSampleTime);
          totalSampleTime += eachSampleTime;
        } else if (dbType === DBType.MySQL) {
          const results = await queryModel.query(
            explainQuery(sqlString, dbType),
            [],
            dbType,
          );
          const eachSampleTime: any = parseExplainExplanation(
            results[0][0].EXPLAIN,
          );
          arr.push(eachSampleTime);
          totalSampleTime += eachSampleTime;

          // hard coded explainResults just to get it working for now
          explainResults = {
            Plan: {
              'Node Type': 'Seq Scan',
              'Parallel Aware': false,
              'Async Capable': false,
              'Relation Name': 'newtable1',
              Schema: 'public',
              Alias: 'newtable1',
              'Startup Cost': 0,
              'Total Cost': 7,
              'Plan Rows': 200,
              'Plan Width': 132,
              'Actual Startup Time': 0.015,
              'Actual Total Time': 0.113,
              'Actual Rows': 200,
              'Actual Loops': 1,
              Output: ['newcolumn1'],
              'Shared Hit Blocks': 5,
              'Shared Read Blocks': 0,
              'Shared Dirtied Blocks': 0,
              'Shared Written Blocks': 0,
              'Local Hit Blocks': 0,
              'Local Read Blocks': 0,
              'Local Dirtied Blocks': 0,
              'Local Written Blocks': 0,
              'Temp Read Blocks': 0,
              'Temp Written Blocks': 0,
            },
            Planning: {
              'Shared Hit Blocks': 64,
              'Shared Read Blocks': 0,
              'Shared Dirtied Blocks': 0,
              'Shared Written Blocks': 0,
              'Local Hit Blocks': 0,
              'Local Read Blocks': 0,
              'Local Dirtied Blocks': 0,
              'Local Written Blocks': 0,
              'Temp Read Blocks': 0,
              'Temp Written Blocks': 0,
            },
            'Planning Time': 9999,
            Triggers: [],
            'Execution Time': 9999,
          };
        } else if (dbType === DBType.SQLite) {
          const sampleTime = await queryModel.sampler(sqlString);
          arr.push(sampleTime);
          totalSampleTime += sampleTime;

          // hard coded explainResults just to get it working for now
          explainResults = {
            Plan: {
              'Node Type': 'Seq Scan',
              'Parallel Aware': false,
              'Async Capable': false,
              'Relation Name': 'newtable1',
              Schema: 'public',
              Alias: 'newtable1',
              'Startup Cost': 0,
              'Total Cost': 7,
              'Plan Rows': 200,
              'Plan Width': 132,
              'Actual Startup Time': 0.015,
              'Actual Total Time': 0.113,
              'Actual Rows': 200,
              'Actual Loops': 1,
              Output: ['newcolumn1'],
              'Shared Hit Blocks': 5,
              'Shared Read Blocks': 0,
              'Shared Dirtied Blocks': 0,
              'Shared Written Blocks': 0,
              'Local Hit Blocks': 0,
              'Local Read Blocks': 0,
              'Local Dirtied Blocks': 0,
              'Local Written Blocks': 0,
              'Temp Read Blocks': 0,
              'Temp Written Blocks': 0,
            },
            Planning: {
              'Shared Hit Blocks': 64,
              'Shared Read Blocks': 0,
              'Shared Dirtied Blocks': 0,
              'Shared Written Blocks': 0,
              'Local Hit Blocks': 0,
              'Local Read Blocks': 0,
              'Local Dirtied Blocks': 0,
              'Local Written Blocks': 0,
              'Temp Read Blocks': 0,
              'Temp Written Blocks': 0,
            },
            'Planning Time': 9999,
            Triggers: [],
            'Execution Time': 9999,
          };
        }
      }
      // get 5 decimal points for sample time
      minimumSampleTime = Math.round(Math.min(...arr) * 10 ** 5) / 10 ** 5;
      maximumSampleTime = Math.round(Math.max(...arr) * 10 ** 5) / 10 ** 5;
      averageSampleTime =
        Math.round((totalSampleTime / numberOfSample) * 10 ** 5) / 10 ** 5;
      totalSampleTime = Math.round(totalSampleTime * 10 ** 5) / 10 ** 5;
    } catch (e) {
      error =
        'Failed to get Execution Plan. EXPLAIN might not support this query.';
    }

    // Run Query
    let returnedRows;
    try {
      const results = await queryModel.query(sqlString, [], dbType);
      if (dbType === DBType.MySQL) {
        // console.log('mySQL results', results);
        returnedRows = results[0];
        // console.log('returnedRows in channels for MySQL', returnedRows);
      }
      if (dbType === DBType.Postgres) {
        // console.log('results in channels for Postgres', results);
        returnedRows = results?.rows;
        // console.log('returnedRows in channels for Postgres', returnedRows);
      }
      if (dbType === DBType.SQLite) {
        returnedRows = results;
        // console.log('returnedRows in channels for SQLite', returnedRows)
      }
    } catch (e: any) {
      error = e.toString();
    }

    return {
      db: targetDb,
      sqlString,
      returnedRows,
      explainResults,
      error,
      numberOfSample,
      totalSampleTime,
      minimumSampleTime,
      maximumSampleTime,
      averageSampleTime,
    };
  } finally {
    // connect back to initialDb

    if (selectedDb !== targetDb)
      await connectionModel.connectToDB(selectedDb, dbType);

    // send updated db info in case query affected table or database information
    // must be run after we connect back to the originally selected so tables information is accurate
    const dbsAndTables: DBList = await databaseModel.getLists('', dbType);
    event.sender.send('db-lists', dbsAndTables);
    logger(
      "Sent 'db-lists' from 'run-query'",
      LogType.SEND,
      `selectedDb: ${selectedDb} -- targetDb: ${targetDb} -- dbType: ${dbType}`,
    );
    event.sender.send('async-complete');
  }
}

// Reads the query JSON file and send it to the front end
export function readQuery(event, filepath) {
  try {
    const data = fs.readFileSync(filepath, 'utf8');

    return data;
  } catch (err) {
    console.log('this is error in read-query', err);
  }
}
