/*
junaid
this file is just to set the initial variables for all the pools, so that we
can shorten the models file down by extracting functions to other pages.
this page allows us to use these variables throughout the backend and have
them retain thier value. just remember we need to access them and manipulate
them using dot notation, so they get passed by reference to this same variable.
if we save them to another variable they will get passed by value but the
reference is different so it wont match up throughout different files.
*/
import { Pool as PGPool } from 'pg';
import { Pool as MSQLPool } from 'mysql2/promise';
import { Database } from 'sqlite3';

let pg_pool: PGPool | undefined;
let msql_pool: MSQLPool | undefined;
let rds_pg_pool: PGPool | undefined;
let rds_msql_pool: MSQLPool | undefined;
let sqlite_db: Database | undefined;
let directPGURI_pool: PGPool | undefined;

export default {
  pg_pool,
  msql_pool,
  rds_pg_pool,
  rds_msql_pool,
  sqlite_db,
  directPGURI_pool,
};
