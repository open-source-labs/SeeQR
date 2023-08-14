// nothing yet
// erdObj = [{},{},{},{},{}]
// {
//   action: string; ‘add’ | ‘drop’ | ‘alter’ | ' column
//   tableName: string;
//   tableSchema: string;  ????
//   newTableName?: string; // only with ‘alter’
//   columnOperations?: {PsqlColumnOperations};  only with ‘column’
// }
// PsqlColumnOperations object will have nique operations for changes in COLUMNS
// columnActions currently are: addColumn, dropColumn, alterColumnType( i need to add the text limit for Char later ), renameColumn, togglePrimary, toggleForeign(one for true, one for false), and toggle unique
// // MASTER TYPE FOR ERD OBJECT
// export type ErdUpdatesType = OperationType[];
// // SQL UNION
// export type OperationType =
//   | PsqlOperationType
//   | MySqlOperationType
//   | SqLiteOperationType;
// // @generic
// interface BaseOperation<Action extends string, colOperation = any> {
//   action: Action;
//   tableName: string;
//   tableSchema: string;
//   newTableName?: string;
//   columnOperations?: colOperation;
// }
// // PSQL
// type PsqlOperationType =
//   | BaseOperation<‘add’>
//   | BaseOperation<‘drop’>
//   | BaseOperation<‘alter’>
//   | BaseOperation<‘column’, PsqlColumnOperations>;
// export type PsqlColumnOperations = (
//   | { columnAction: ‘addColumn’; type?: string }
//   | { columnAction: ‘dropColumn’ }
//   | { columnAction: ‘alterColumnType’; type?: string }
//   | { columnAction: ‘renameColumn’; newColumnName: string }
//   | { columnAction: ‘togglePrimary’; hasPrimary: boolean }
//   | {
//       columnAction: ‘toggleForeign’;
//       hasForeign: true;
//       foreignTable: string;
//       foreignColumn: string;
//       foreignConstraint: string;
//     }
//   | {
//       columnAction: ‘toggleForeign’;
//       hasForeign: false;
//       foreignConstraint: string;
//     }
//   | { columnAction: ‘toggleUnique’; hasUnique: boolean }
// ) & { columnName: string };
// // MYSQL
// type MySqlOperationType =
//   | BaseOperation<‘add’>
//   | BaseOperation<‘drop’>
//   | BaseOperation<‘alter’>
//   | BaseOperation<‘column’, MySqlColumnOperations>;
// interface MySqlColumnOperations {
//   // specific things for alter like primary key etc
//   columnAction:
//     | ‘addColumn’
//     | ‘dropColumn’
//     | ‘alterColumnType’
//     | ‘renameColumn’
//     | ‘togglePrimary’ // paired with default
//     | ‘toggleForeign’
//     | ‘toggleUnique’;
//   columnName: string;
//   newColumnName?: string; // this is for addColumn only
//   type?: string; // could be for addColumn or alterColumm
//   hasPrimary?: boolean;
//   // foreign stuff
//   hasForeign?: boolean;
//   foreignConstraint?: string;
//   foreignTable?: string;
//   foreignColumn?: string;
//   // unique:
//   hasUnique?: boolean;
//   uniqueConstraint?: string;
// }
// // SQLITE
// type SqLiteOperationType =
//   | BaseOperation<‘add’>
//   | BaseOperation<‘drop’>
//   | BaseOperation<‘alter’>
//   | BaseOperation<‘column’, SqLiteColumnOperations>;
// interface SqLiteColumnOperations {
//   table_name: string;
//   // more
// }
