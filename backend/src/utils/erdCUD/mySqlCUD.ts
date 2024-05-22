import {
  ErdUpdatesType,
  OperationType,
  PsqlColumnOperations,
} from '../../../../shared/types/types';

/**
 * POSTGRESQL COLUMN HELPER
 * @param columnOperations
 * @returns string
 */

export function generateMySqlColumnQuery(
  tableName: string,
  columnOperations: PsqlColumnOperations,
): string {
  const { columnAction, columnName } = columnOperations;

  let effect: string = columnName;
  let action: string;

  switch (columnAction) {
    case 'addColumn': {
      action = 'ADD';
      if (columnOperations.type !== undefined) {
        // if there is a type
        effect += ` TYPE ${columnOperations.type}`;
      }
      break;
    }

    case 'dropColumn':
      action = 'DROP';
      break;

    // alters
    case 'alterColumnType':
      action = 'ALTER';
      effect += ` TYPE ${columnOperations.type}`;
      break;

    case 'renameColumn':
      action = 'RENAME';
      effect += ` TO ${columnOperations.newColumnName}`;
      break;

    // contraints
    case 'togglePrimary': {
      if (!columnOperations.isPrimary) {
        // usually default to user_pkey. need further investigation
        return `DROP CONSTRAINT users_pkey`;
      }
      return `ADD PRIMARY KEY (${effect})`;
    }

    case 'toggleForeign': {
      const { hasForeign, foreignConstraint } = columnOperations;
      if (!hasForeign) {
        return `DROP CONSTRAINT ${foreignConstraint}`;
      }
      return `ADD CONSTRAINT ${foreignConstraint} FOREIGN KEY (${columnName}) REFERENCES ${columnOperations.foreignTable} (${columnOperations.foreignColumn})`;
    }

    // we are assuminmg postgress will generate a new unique key for us if it is not taken here. risky.
    case 'toggleUnique': {
      const { isUnique } = columnOperations;
      if (!isUnique) {
        return `DROP CONSTRAINT ${tableName}_${columnName}_key`;
      }
      return `ADD UNIQUE (${columnName})`;
    }

    default:
      throw new Error(`Invalid tableAction: ${columnAction as string}`);
  }

  return `${action} COLUMN ${effect}`;
}

/**
 * POSTGRESQL OPERATIONS
 * @param updatesArray
 * @returns Array of strings
 */

export function queryMySql(updatesArray: ErdUpdatesType): string[] {
  const psqlArray: string[] = [];
  updatesArray.forEach((operation: OperationType) => {
    const { action, tableName, tableSchema } = operation;
    switch (action) {
      // this is adding tables for psql
      case 'add':
        psqlArray.push(`CREATE TABLE ${tableSchema}.${tableName};`);
        break;

      // this is dropping tables for psql
      case 'drop':
        psqlArray.push(`DROP TABLE ${tableSchema}.${tableName};`);
        break;

      // this is altering table name for psql
      case 'alter': {
        const { newTableName } = operation;
        psqlArray.push(
          `ALTER TABLE ${tableSchema}.${tableName} RENAME TO ${newTableName};`,
        );
        break;
      }

      // this is altering columns name for psql
      case 'column': {
        const { columnOperations } = operation;
        const alterQuery: string = generateMySqlColumnQuery(
          tableName,
          columnOperations as PsqlColumnOperations,
        );
        psqlArray.push(
          `ALTER TABLE ${tableSchema}.${tableName} ${alterQuery};`,
        );
        break;
      }

      default:
        throw new Error(`Invalid action: ${action as string}`);
    }
  });
  return psqlArray;
}
