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
  databaseConnected: [boolean, boolean];
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
  mysql_user: string;
  mysql_pass: string;
  mysql_port: number | string;
  pg_user: string;
  pg_pass: string;
  pg_port: number | string;
  rds_mysql_host: string;
  rds_mysql_user: string;
  rds_mysql_pass: string;
  rds_mysql_port: number | string;
  rds_pg_host: string;
  rds_pg_user: string;
  rds_pg_pass: string;
  rds_pg_port: number | string;
}
