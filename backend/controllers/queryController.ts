const db = require('../models');

const queryController = {
  executeQueryUntracked: (req, res, next) => {
  // event.sender.send('async-started');

  // destructure object from frontend
  const { queryString } = req.body;
  // run query on db
  db.query(queryString)
    .then(() => {
      (async function getListAsync() {
        let listObj = await db.getLists();
        // event.sender.send('db-lists', listObj);
        // event.sender.send('async-complete');
      })();
    }).then(next())
    .catch((error: string) => {
      // event.sender.send('query-error', 'Error executing query.');
    });
    
  },

  executeQueryTracked: (req, res, next) => {
    
  //   console.log('hello world')
  // // send notice to front end that query has been started
  // // event.sender.send('async-started');

  // // destructure object from frontend
  // const { queryString, queryCurrentSchema, queryLabel } = req.body;
  // console.log('query string: ', queryString);
  // console.log('request body ', req.body);

  // // initialize object to store all data to send to frontend
  // let frontendData = {
  //   queryString,
  //   queryCurrentSchema,
  //   queryLabel,
  //   queryData: '',
  //   queryStatistics: '',
  //   lists: {},
  // };

  // // Run select * from actors;
  // db.query(queryString)
  //   .then((queryData) => {
  //     frontendData.queryData = queryData.rows;
  //     if (!queryString.match(/create/i)) {
  //       // Run EXPLAIN (FORMAT JSON, ANALYZE)
  //       db.query('EXPLAIN (FORMAT JSON, ANALYZE) ' + queryString).then(
  //         (queryStats) => {
  //           frontendData.queryStatistics = queryStats.rows;

  //           (async function getListAsync() {
  //             let listObj = await db.getLists();
  //             frontendData.lists = listObj;
  //             // event.sender.send('db-lists', listObj);
  //             // event.sender.send('return-execute-query', frontendData);
  //             // event.sender.send('async-complete');
  //           })();
  //         }
  //       );
  //     } else {
  //       // Handling for tracking a create table query, can't run explain/analyze on create statements
  //       (async function getListAsync() {
  //         let listObj = await db.getLists();
  //         frontendData.lists = listObj;
  //         // event.sender.send('db-lists', listObj);
  //         // event.sender.send('async-complete');
  //       })();
  //     }
  //   }).then(next())
  //   .catch((error: string) => {
  //     console.log('ERROR in execute-query-tracked channel in main.ts', error);
  //   });
    next();
  },
  generateDummyData: (req, res, next) => {
    next();
  },
};

export default queryController;
