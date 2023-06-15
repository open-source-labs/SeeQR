/**
 * This file contains common types that need to be used across the backend
 */
import { UpdatesObjType } from '../frontend/types';

export interface ColumnObj {
  column_name: string;
  data_type: string;
  character_maximum_length: number | null;
  is_nullable: string;
  constraint_type: string;
  foreign_table: string;
  foreign_column: string;
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
  databaseConnected: [boolean, boolean, boolean, boolean];
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
  CloudDB = 'cloud-database', //added for cloud dbs
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
  mysql: { user: string; password: string; port: number };
  pg: { user: string; password: string; port: number };
  rds_mysql: { user: string; password: string; port: number; host: string };
  rds_pg: { user: string; password: string; port: number; host: string };
  cloud_db: { URI: '' };
}

type dbsInputted = {
  pg: boolean;
  msql: boolean;
  rds_pg: boolean;
  rds_msql: boolean;
};

export interface DBFunctions {
  pg_uri: string;
  curPG_DB: string;
  curMSQL_DB: string;
  curRDS_MSQL_DB: any;
  curRDS_PG_DB: {
    user: string;
    password: string;
    host: string;
  };
  dbsInputted: dbsInputted;

  setBaseConnections: () => Promise<dbsInputted>;
  query: (text: string, params: (string | number)[], dbType: DBType) => void;
  connectToDB: (db: string, dbType?: DBType) => Promise<void>;
  getLists: (dbName: string, dbType?: DBType) => Promise<DBList>;
  getTableInfo: (tableName: string, dbType: DBType) => Promise<ColumnObj[]>;
  getDBNames: (dbType: DBType) => Promise<dbDetails[]>;
  getColumnObjects: (tableName: string, dbType: DBType) => Promise<ColumnObj[]>;
  getDBLists: (dbType: DBType, dbName: string) => Promise<TableDetails[]>;
}
