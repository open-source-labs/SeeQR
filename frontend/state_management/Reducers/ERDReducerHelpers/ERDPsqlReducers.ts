import {
  ErdUpdatesType,
  initialStateType,
  OperationType,
  TableOperationAction,
  ColumnOperationAction,
} from '../../../../shared/types/types';
import { posgresAction } from '../../Actions/ERDPsqlActions';

function ERDPsqlReducers(state: initialStateType, action: posgresAction) {
  switch (action.type) {
    case TableOperationAction.add: {
      // add new table
      const newUpdatesArray = [...state.updatesArray, action.payload];

      // will need to look into guiTable and reactflow
      const newGuiTable = [...state.guiTableArray]; // different for add
      //                   former schemaTable
      return {
        ...state,
        guiTable: newGuiTable,
        updatesArray: newUpdatesArray,
      };
    }

    case TableOperationAction.drop: {
      const newUpdatesArray = [...state.updatesArray, action.payload];

      const newGuiTable = [...state.guiTableArray]; // different for add

      return {
        ...state,
        guiTable: newGuiTable,
        updatesArray: newUpdatesArray,
      };
    }

    case TableOperationAction.alter: {
      const newUpdatesArray = [...state.updatesArray, action.payload];

      const newGuiTable = [...state.guiTableArray]; // different for add

      return {
        ...state,
        guiTable: newGuiTable,
        updatesArray: newUpdatesArray,
      };
    }

    // these need special helper function to transform action payload to desired payload: conformColumnPLtoErdPL(action.type, action.payload);
    case ColumnOperationAction.add_column: {
      // payload destructured
      const newOperation: OperationType = {
        action: 'column',
        tableName: action.payload.tableName,
        tableSchema: action.payload.tableSchema, // not sure about this one
        columnOperations: {
          columnName: action.payload.columnName,
          columnAction: ColumnOperationAction.add_column,
        },
      };

      const newUpdatesArray: ErdUpdatesType = [
        ...state.updatesArray,
        newOperation,
      ];

      const newGuiTable = [...state.guiTableArray]; // different for alter

      return {
        ...state,
        guiTable: newGuiTable,
        updatesArray: newUpdatesArray,
      };
    }

    case ColumnOperationAction.drop_column: {
      // payload destructured
      const newOperation: OperationType = {
        action: 'column',
        tableName: action.payload.tableName,
        tableSchema: action.payload.tableSchema, // not sure about this one
        columnOperations: {
          columnName: action.payload.columnName,
          columnAction: ColumnOperationAction.drop_column,
        },
      };

      const newUpdatesArray: ErdUpdatesType = [
        ...state.updatesArray,
        newOperation,
      ];

      const newGuiTable = [...state.guiTableArray]; // different for alter

      return {
        ...state,
        guiTable: newGuiTable,
        updatesArray: newUpdatesArray,
      };
    }

    case ColumnOperationAction.alter_type: {
      // payload destructured
      const newOperation: OperationType = {
        action: 'column',
        tableName: action.payload.tableName,
        tableSchema: action.payload.tableSchema, // not sure about this one
        columnOperations: {
          columnName: action.payload.columnName,
          columnAction: ColumnOperationAction.alter_type,
          type: action.payload.columnType,
        },
      };

      const newUpdatesArray: ErdUpdatesType = [
        ...state.updatesArray,
        newOperation,
      ];

      const newGuiTable = [...state.guiTableArray]; // different for alter

      return {
        ...state,
        guiTable: newGuiTable,
        updatesArray: newUpdatesArray,
      };
    }

    case ColumnOperationAction.rename_column: {
      // payload destructured
      const newOperation: OperationType = {
        action: 'column',
        tableName: action.payload.tableName,
        tableSchema: action.payload.tableSchema, // not sure about this one
        columnOperations: {
          columnName: action.payload.columnName,
          columnAction: ColumnOperationAction.rename_column,
          newColumnName: action.payload.newColumnName,
        },
      };

      const newUpdatesArray: ErdUpdatesType = [
        ...state.updatesArray,
        newOperation,
      ];

      const newGuiTable = [...state.guiTableArray]; // different for alter

      return {
        ...state,
        guiTable: newGuiTable,
        updatesArray: newUpdatesArray,
      };
    }

    case ColumnOperationAction.toggle_primary: {
      // payload destructured
      const newOperation: OperationType = {
        action: 'column',
        tableName: action.payload.tableName,
        tableSchema: action.payload.tableSchema, // not sure about this one
        columnOperations: {
          columnName: action.payload.columnName,
          columnAction: ColumnOperationAction.toggle_primary,
          isPrimary: action.payload.isPrimary,
        },
      };

      const newUpdatesArray: ErdUpdatesType = [
        ...state.updatesArray,
        newOperation,
      ];

      const newGuiTable = [...state.guiTableArray]; // different for alter

      return {
        ...state,
        guiTable: newGuiTable,
        updatesArray: newUpdatesArray,
      };
    }

    case ColumnOperationAction.toggle_foreign: {
      // since there might be 2 foreigns coming in, we need to differentiate
      // payload destructured
      let newOperation: OperationType = {
        action: 'column',
        tableName: action.payload.tableName,
        tableSchema: action.payload.tableSchema, // not sure about this one
        columnOperations: {},
      };

      if (action.payload.hasForeign) {
        newOperation.columnOperations = {
          columnAction: ColumnOperationAction.toggle_primary,
          columnName: action.payload.columnName,
          hasForeign: action.payload.hasForeign,
          foreignTable: action.payload.foreign_table,
          foreignColumn: action.payload.foreignColumn,
          foreignConstraint: action.payload.foreignConstraint,
        };
      } else {
        newOperation.columnOperations = {
          columnAction: ColumnOperationAction.toggle_primary,
          columnName: action.payload.columnName,
          foreignConstraint: action.payload.foreignConstraint,
          hasForeign: action.payload.hasForeign,
        };
      }

      const newUpdatesArray: ErdUpdatesType = [
        ...state.updatesArray,
        newOperation,
      ];

      const newGuiTable = [...state.guiTableArray]; // different for alter

      return {
        ...state,
        guiTable: newGuiTable,
        updatesArray: newUpdatesArray,
      };
    }

    case ColumnOperationAction.toggle_unique: {
      // payload destructured
      const newOperation: OperationType = {
        action: 'column',
        tableName: action.payload.tableName,
        tableSchema: action.payload.tableSchema, // not sure about this one
        columnOperations: {
          columnName: action.payload.columnName,
          columnAction: ColumnOperationAction.toggle_unique,
          isUnique: action.payload.isUnique,
        },
      };

      const newUpdatesArray: ErdUpdatesType = [
        ...state.updatesArray,
        newOperation,
      ];

      const newGuiTable = [...state.guiTableArray]; // different for alter

      return {
        ...state,
        guiTable: newGuiTable,
        updatesArray: newUpdatesArray,
      };
    }

    default:
      return state;
  }
}

export default ERDPsqlReducers;
