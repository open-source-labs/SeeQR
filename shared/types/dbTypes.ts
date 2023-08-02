export interface dbDetails {
  db_name: string;
  db_size: string;
  db_type: DBType;
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

export enum DBType {
  Postgres = 'pg',
  MySQL = 'mysql',
  RDSPostgres = 'rds-pg',
  RDSMySQL = 'rds-mysql',
  CloudDB = 'cloud-database', // added for cloud dbs
  SQLite = 'sqlite',
  directPGURI = 'directPGURI',
}
