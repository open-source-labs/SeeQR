export interface DocConfigFile {
  mysql: { user: string; password: string; port: number };
  pg: { user: string; password: string; port: number };
  rds_mysql: { user: string; password: string; port: number; host: string };
  rds_pg: { user: string; password: string; port: number; host: string };
  sqlite: { path: '' };
  directPGURI: { uri: '' };
}
