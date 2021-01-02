const db = require('../models');

const dbController = {
  returnDbList: (req, res, next) => {
    const { dbName } = req.body;
    let dbSize = '';

    // get database size
    db.query(`SELECT pg_size_pretty(pg_database_size('${dbName}'));`).then(
      (queryStats) => {
        res.locals.dbSize = queryStats.rows[0].pg_size_pretty;
      }
    );

    // get list of databases
    db.getLists()
      .then((data) => {
        res.locals.event = 'db-lists';
        res.locals.data = data;
        res.locals.dbSize = dbSize;
      })
      .then(next)
      .catch(() => {
        next({
          log: `dbController.getLists: ERROR: Error getting the list of databases.`,
          message: {
            err:
              'Error occurred in dbController.returnedDbList. Check server logs for more details.',
          },
        });
      });
  },

  changeDb: (req, res, next) => {
    const { dbName } = req.body;
    db.changeDB(dbName);
  },
};

export default dbController;
