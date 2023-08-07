/**
 * This file contains common types that need to be used across the backend
 */
import { PoolOptions } from 'mysql2';
import { PoolConfig } from 'pg';
import { UpdatesObjType } from '../../frontend/types';

export interface ColumnObj {
  column_name: string;
  data_type: string;
  character_maximum_length: number | null;
  is_nullable: string;
  constraint_type: string | null;
  foreign_table: string | null;
  foreign_column: string | null;
}
export interface dbDetails {
  db_name: string;
  db_size: string;
  db_type: DBType;
}
export interface TableDetails {
  table_catalog: string;
  table_schema: string;
  table_name: string;
  is_insertable_into: string;
  columns?: ColumnObj[];
}
export interface DBList {
  databaseConnected: {
    PG: boolean;
    MySQL: boolean;
    RDSPG: boolean;
    RDSMySQL: boolean;
    SQLite: boolean;
    directPGURI: boolean;
  };
  databaseList: dbDetails[];
  tableList: TableDetails[];
}

export type DummyRecords = [string[], ...Array<(string | number)[]>];

export type BackendObjType = {
  database: string;
  updates: UpdatesObjType;
};

export enum DBType {
  Postgres = 'pg',
  MySQL = 'mysql',
  RDSPostgres = 'rds-pg',
  RDSMySQL = 'rds-mysql',
  CloudDB = 'cloud-database', // added for cloud dbs
  SQLite = 'sqlite',
  directPGURI = 'directPGURI',
}

export enum LogType {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  NORMAL = 'NORMAL',
  SEND = 'SEND',
  RECEIVE = 'RECEIVE',
}

export interface DocConfigFile {
  mysql_options: { user: string; password: string; port: number } & PoolOptions;
  pg_options: { user: string; password: string; port: number } & PoolConfig;
  rds_mysql_options: {
    user: string;
    password: string;
    port: number;
    host: string;
  } & PoolOptions;
  rds_pg_options: {
    user: string;
    password: string;
    port: number;
    host: string;
  } & PoolConfig;
  sqlite_options: { filename: string };
  directPGURI_options: { connectionString: string } & PoolConfig;
}

type dbsInputted = {
  pg: boolean;
  msql: boolean;
  rds_pg: boolean;
  rds_msql: boolean;
  sqlite: boolean;
  directPGURI: boolean;
};

type configExists = {
  pg: boolean;
  msql: boolean;
  rds_pg: boolean;
  rds_msql: boolean;
  sqlite: boolean;
  directPGURI: boolean;
};

type combined = {
  dbsInputted: dbsInputted;
  configExists: configExists;
};

export interface MysqlQueryResolve {}

export interface DBFunctions extends DocConfigFile {
  pg_uri: string;
  dbsInputted: dbsInputted;

  // setBaseConnections: () => Promise<combined>;
  // query: (text: string, params: (string | number)[], dbType: DBType) => any;
  // connectToDB: (db: string, dbType?: DBType) => Promise<void>;
  // disconnectToDrop: (dbType: DBType) => Promise<void>;
  // getLists: (dbName?: string, dbType?: DBType) => Promise<DBList>;
  // getTableInfo: (tableName: string, dbType: DBType) => Promise<ColumnObj[]>;
  // getDBNames: (dbType: DBType) => Promise<dbDetails[]>;
  // getColumnObjects: (tableName: string, dbType: DBType) => Promise<ColumnObj[]>;
  // getDBLists: (dbType: DBType, dbName: string) => Promise<TableDetails[]>;
  // sampler: (queryString: string) => Promise<number>;
}

export interface QueryPayload {
  targetDb: string;
  sqlString: string;
  selectedDb: string;
  runQueryNumber: number;
}

// definition: for connection Models
export interface connectionModelType {
  setBaseConnections: () => Promise<combined>;
  connectToDB: (db: string, dbType?: DBType) => Promise<void>;
  disconnectToDrop: (dbType: DBType) => Promise<void>;
}

// definition: for query Models
export interface queryModelType {
  query: (text: string, params: (string | number)[], dbType: DBType) => any;
  sampler: (queryString: string) => Promise<number>;
}

// definition: for database Models
export interface databaseModelType {
  getLists: (dbName?: string, dbType?: DBType) => Promise<DBList>;
  getTableInfo: (tableName: string, dbType: DBType) => Promise<ColumnObj[]>;
  getDBNames: (dbType: DBType) => Promise<dbDetails[]>;
  getColumnObjects: (tableName: string, dbType: DBType) => Promise<ColumnObj[]>;
  getDBLists: (dbType: DBType, dbName: string) => Promise<TableDetails[]>;
}
