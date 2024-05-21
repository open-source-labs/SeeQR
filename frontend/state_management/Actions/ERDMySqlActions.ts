// NEEDS UPDATE: EVERYTHING POSTGRES
import {
  TableOperationAction,
  PsqlOperationType,
  ColumnOperationAction,
  PSqlDataType,
} from '../../../shared/types/types';

type postgresTableAction = {
  type: TableOperationAction;
  payload: PsqlOperationType;
};

type posgresColumnAction = {
  type: ColumnOperationAction;
  payload: any;
};

export function addTable(name: string, schema: string): postgresTableAction {
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
): postgresTableAction {
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

export function dropTable(name: string, schema: string): postgresTableAction {
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
  tablename: string,
  columname: string,
): posgresColumnAction {
  return {
    type: ColumnOperationAction.add_column,
    payload: {
      tableName: tablename,
      columnName: columname,
    },
  };
}

export function dropColumnFromTable(
  tablename: string,
  columname: string,
): posgresColumnAction {
  return {
    type: ColumnOperationAction.drop_column,
    payload: {
      tableName: tablename,
      columnName: columname,
    },
  };
}

export function alterColumnTypeFromTable(
  tablename: string,
  columname: string,
  type: PSqlDataType,
): posgresColumnAction {
  return {
    type: ColumnOperationAction.add_column,
    payload: {
      tableName: tablename,
      columnName: columname,
      columnType: type,
    },
  };
}

export function renameColumnFromTable(
  tablename: string,
  columname: string,
  newcolumnname: string,
): posgresColumnAction {
  return {
    type: ColumnOperationAction.rename_column,
    payload: {
      tableName: tablename,
      columnName: columname,
      newColumnName: newcolumnname,
    },
  };
}

export function togglePrimaryFromTable(
  tablename: string,
  columname: string,
  primary: boolean,
): posgresColumnAction {
  return {
    type: ColumnOperationAction.toggle_primary,
    payload: {
      tableName: tablename,
      columnName: columname,
      isPrimary: primary,
    },
  };
}

export function turnOnForeignFromTable(
  tablename: string,
  columname: string,
  foreign_table: string,
  foreign_column: string,
  foreign_constraint: string,
): posgresColumnAction {
  return {
    type: ColumnOperationAction.toggle_foreign,
    payload: {
      tableName: tablename,
      columnName: columname,
      hasForeign: true,
      foreignTable: foreign_table,
      foreignColumn: foreign_column,
      foreignConstrinat: foreign_constraint,
    },
  };
}

export function turnOffForeignFromTable(
  tablename: string,
  columname: string,
  foreign_constraint: string,
): posgresColumnAction {
  return {
    type: ColumnOperationAction.toggle_foreign,
    payload: {
      tableName: tablename,
      columnName: columname,
      foreignConstraint: foreign_constraint,
      hasForeign: false,
    },
  };
}

export function toggleUniqueFromTable(
  tablename: string,
  columname: string,
  unique: boolean,
): posgresColumnAction {
  return {
    type: ColumnOperationAction.toggle_unique,
    payload: {
      tableName: tablename,
      columnName: columname,
      isUnique: unique,
    },
  };
}
