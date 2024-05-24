import mysql from 'mysql2/promise';
import databaseConnections from '../../../../backend/src/db/databaseConnections';
const { PG_DBConnect, PG_DBDisconnect, MSQL_DBConnect, MSQL_DBQuery, RDS_PG_DBConnect, RDS_MSQL_DBConnect, RDS_MSQL_DBQuery, SQLite_DBConnect } = databaseConnections
import { PoolConfig } from 'pg';




describe('Database Connection Tests', () => {
    it('should fail to connect with invalid credentials', async () => {
      try {
        await PG_DBConnect('postgres://invalid:credentials@localhost/dbname', 'dbname');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('MySQL', () => {
    const MYSQL_CREDS = {
      host: 'localhost',
      user: 'username',
      password: 'password',
      database: 'dbname',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      multipleStatements: true,
    };

    it('should connect and perform a query successfully', async () => {
      await MSQL_DBConnect(MYSQL_CREDS);
      await MSQL_DBQuery('dbname');
    });

    it('should fail to connect with invalid credentials', async () => {
      const invalidCreds = {...MYSQL_CREDS, user: 'invalid', password: 'credentials' };
      try {
        await MSQL_DBConnect(invalidCreds);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('SQLite', () => {
    it('should connect successfully', () => {
      SQLite_DBConnect(':memory:');
    });
  });
