import {
  TableOperationAction,
  PsqlOperationType,
  ColumnOperationAction,
  PSqlDataType,
} from '../../../shared/types/types';

export type posgresAction = {
  type: ColumnOperationAction | TableOperationAction;
  payload: any | PsqlOperationType; // too many action types do it later
};

export function addTable(name: string, schema: string): posgresAction {
  return {
    type: TableOperationAction.add,
    payload: {
      action: TableOperationAction.add, // repeated because I defined this in my backend
      tableName: name,
      tableSchema: schema,
    },
  };
}

export function alterTableName(
  name: string,
  schema: string,
  newName: string,
): posgresAction {
  return {
    type: TableOperationAction.alter,
    payload: {
      action: TableOperationAction.alter, // repeated because I defined this in my backend
      tableName: name,
      tableSchema: schema,
      newTableName: newName,
    },
  };
}

export function dropTable(name: string, schema: string): posgresAction {
  return {
    type: TableOperationAction.drop,
    payload: {
      action: TableOperationAction.drop, // repeated because I defined this in my backend
      tableName: name,
      tableSchema: schema,
    },
  };
}

// COLUMN ACTIONS seperate concerns, and single response principle (but we need a function to transform this to acceptable object that the backend is accepting )

export function addColumnToTable(
  name: string,
  schema: string,
  columnname: string,
): posgresAction {
  return {
    type: ColumnOperationAction.add_column,
    payload: {
      tableName: name,
      tableSchema: schema,
      columnName: columnname,
    },
  };
}

export function dropColumnFromTable(
  tablename: string,
  schema: string,
  columname: string,
): posgresAction {
  return {
    type: ColumnOperationAction.drop_column,
    payload: {
      tableName: tablename,
      tableSchema: schema,
      columnName: columname,
    },
  };
}

export function alterColumnTypeFromTable(
  tablename: string,
  schema: string,
  columname: string,
  type: PSqlDataType,
): posgresAction {
  return {
    type: ColumnOperationAction.alter_type,
    payload: {
      tableName: tablename,
      tableSchema: schema,
      columnName: columname,
      columnType: type,
    },
  };
}

export function renameColumnFromTable(
  tablename: string,
  schema: string,
  columname: string,
  newcolumnname: string,
): posgresAction {
  return {
    type: ColumnOperationAction.rename_column,
    payload: {
      tableName: tablename,
      tableSchema: schema,
      columnName: columname,
      newColumnName: newcolumnname,
    },
  };
}

export function togglePrimaryFromTable(
  tablename: string,
  schema: string,
  columname: string,
  primary: boolean,
): posgresAction {
  return {
    type: ColumnOperationAction.toggle_primary,
    payload: {
      tableName: tablename,
      tableSchema: schema,
      columnName: columname,
      isPrimary: primary,
    },
  };
}

export function turnOnForeignFromTable(
  tablename: string,
  schema: string,
  columname: string,
  foreign_table: string,
  foreign_column: string,
  foreign_constraint: string,
): posgresAction {
  return {
    type: ColumnOperationAction.toggle_foreign,
    payload: {
      tableName: tablename,
      tableSchema: schema,
      columnName: columname,
      hasForeign: true,
      foreignTable: foreign_table,
      foreignColumn: foreign_column,
      foreignConstraint: foreign_constraint,
    },
  };
}

export function turnOffForeignFromTable(
  tablename: string,
  schema: string,
  columname: string,
  foreign_constraint: string,
): posgresAction {
  return {
    type: ColumnOperationAction.toggle_foreign,
    payload: {
      tableName: tablename,
      tableSchema: schema,
      columnName: columname,
      foreignConstraint: foreign_constraint,
      hasForeign: false,
    },
  };
}

export function toggleUniqueFromTable(
  tablename: string,
  schema: string,
  columname: string,
  unique: boolean,
): posgresAction {
  return {
    type: ColumnOperationAction.toggle_unique,
    payload: {
      tableName: tablename,
      tableSchema: schema,
      columnName: columname,
      isUnique: unique,
    },
  };
}
