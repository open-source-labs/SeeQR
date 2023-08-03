// handles connections from models.ts

//setBaseConnections()

// connectToDB(db, dbType)

/*
  async connectToDB(db, dbType) {
    // change current Db
    if (dbType === DBType.Postgres) {
      this.curPG_DB = db;
      await connectionFunctions.PG_DBConnect(this.pg_uri, db);
    } else if (dbType === DBType.MySQL) {
      this.curMSQL_DB = db;
      await connectionFunctions.MSQL_DBQuery(db);
    } else if (dbType === DBType.RDSMySQL) {
      this.curRDS_MSQL_DB = db;
      await connectionFunctions.RDS_MSQL_DBQuery(db);
    } else if (dbType === DBType.RDSPostgres) {
      await connectionFunctions.RDS_PG_DBConnect(this.curRDS_PG_DB);
    } else if (dbType === DBType.SQLite) {
      await connectionFunctions.SQLite_DBConnect(this.curSQLite_DB.path);
    }
  },
*/

//disconnectToDrop(dbType)

/*
  async disconnectToDrop(dbType) {
    if (dbType === DBType.Postgres) {
      // ending pool
      await connectionFunctions.PG_DBDisconnect();
    }
    if (dbType === DBType.SQLite) {
      try {
        // disconnect from and delete sqlite .db file
        pools.sqlite_db.close();
        fs.unlinkSync(this.curSQLite_DB.path);
        this.curSQLite_DB.path = '';
      } catch (e) {
        logger('FAILED TO DELETE SQLITE DB FILE', LogType.ERROR);
      }
    }
  },
*/
