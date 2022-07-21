/**
 * This file contains common types that need to be used across the backend
 */
 import {
  UpdatesObjType
} from '../frontend/types';

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
}
export interface TableDetails {
  table_catalog: string;
  table_schema: string;
  table_name: string;
  is_insertable_into: string;
  columns?: ColumnObj[];
}
export interface DBList {
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
  MySQL = 'mysql'
}

