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
      })
      .then(next())
      .catch((error: string) => {
        // event.sender.send('query-error', 'Error executing query.');
      });
  },

  executeQueryTracked: (req, res, next) => {
    // create data object to send back to client
    // const frontendData = {
    //   queryData: null,
    //   queryStats: null,
    // };
    // // extract query string from client request
    // const { queryString } = req.body;
    // // match the connection pool based on cookies
    // const pool = users[req.cookies['session_id']];
    // // retrieve query results and attach to frontend data object
    // const rows = await pool.query(queryString);
    // frontendData.queryData = rows;
    // // Run EXPLAIN (FORMAT JSON, ANALYZE)
    // if (!queryString.match(/create/i)) {
    //   const queryStats = await pool.query(
    //     'EXPLAIN (FORMAT JSON, ANALYZE) ' + queryString
    //   );
    //   frontendData.queryStats = queryStats;
    // }
    // // send back to client
    // return res.status(200).json(frontendData);

    /*
      event.sender.send('async-started');
    
      // destructure object from frontend
      const { queryString, queryCurrentSchema, queryLabel } = data;
    
      // initialize object to store all data to send to frontend
      let frontendData = {
        queryString,
        queryCurrentSchema,
        queryLabel,
        queryData: '',
        queryStatistics: '',
        lists: {},
      };
    
      // Run select * from actors;
      db.query(queryString)
        .then((queryData) => {
          frontendData.queryData = queryData.rows;
          if (!queryString.match(/create/i)) {
            // Run EXPLAIN (FORMAT JSON, ANALYZE)
            db.query('EXPLAIN (FORMAT JSON, ANALYZE) ' + queryString).then(
              (queryStats) => {
                frontendData.queryStatistics = queryStats.rows;
    
                (async function getListAsync() {
                  listObj = await db.getLists();
                  frontendData.lists = listObj;
                  event.sender.send('db-lists', listObj);
                  event.sender.send('return-execute-query', frontendData);
                  event.sender.send('async-complete');
                })();
              }
            );
          } else {
            // Handling for tracking a create table query, can't run explain/analyze on create statements
            (async function getListAsync() {
              listObj = await db.getLists();
              frontendData.lists = listObj;
              event.sender.send('db-lists', listObj);
              event.sender.send('async-complete');
            })();
          }
        })
        .catch((error: string) => {
          console.log('ERROR in execute-query-tracked channel in main.ts', error);
        });
        */

    next();
  },
  generateDummyData: (req, res, next) => {
    next();
  },
};

export default queryController;
