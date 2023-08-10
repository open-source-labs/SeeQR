import {
  ErdUpdatesType,
  OperationType,
  PsqlAlterOperations,
} from '../../../../shared/types/erTypes';

/**
 * POSTGRESQL ALTER HELPER
 * @param alterOperations
 * @returns string
 */

function generatePostgresAlterQuery(
  alterOperations: PsqlAlterOperations,
): string {
  const { tableAction } = alterOperations;

  if (tableAction === 'rename') {
    return `RENAME TO ${alterOperations.rename}`;
  }

  if (alterOperations.columnName) {
    let effect: string = alterOperations.columnName;
    let action: string;

    switch (tableAction) {
      case 'addColumn': {
        action = 'ADD';
        if (alterOperations.type) {
          // if there is a type
          effect += ` TYPE ${alterOperations.type}`;
        }
        break;
      }

      case 'dropColumn':
        action = 'DELETE';
        break;

      // alters
      case 'alterColumnType':
        action = 'ALTER';
        effect += ` TYPE ${alterOperations.type}`;
        break;

      case 'renameColumn':
        action = 'RENAME';
        effect += ` TO ${alterOperations.type}`;
        break;

      // contraints
      case 'togglePrimary': {
        if (alterOperations.hasPrimary) {
          // usually default to user_pkey. need further investigation
          return `DROP CONSTRAINT users_pkey`;
        }
        return `ADD PRIMARY KEY ${effect}`;
      }

      case 'toggleForeign': {
        const { hasForeign, foreignTable, foreignColumn, foreignConstraint } =
          alterOperations;
        if (hasForeign) {
          return `DROP CONSTRAINT ${foreignConstraint}`;
        }
        return `ADD CONSTRAINT ${foreignConstraint} FOREIGN KEY (${alterOperations.columnName}) REFERECES ${foreignTable}(${foreignColumn})`;
      }

      case 'toggleUnique': {
        const { hasUnique, uniqueConstraint } = alterOperations;
        if (hasUnique) {
          return `DROP CONSTRAINT ${uniqueConstraint}`;
        }
        return `ADD CONSTRAINT ${uniqueConstraint} UNIQUE (${alterOperations.columnName})`;
      }

      default:
        throw new Error(`Invalid tableAction: ${tableAction}`);
    }

    return `${action} COLUMN ${effect}`;
  }
  throw new Error('Invalid operation or missing parameters.'); // not sure about this one
}

/**
 * POSTGRESQL OPERATION
 * @param updatesArray
 * @returns Array of strings
 */

export default function queryPostgres(updatesArray: ErdUpdatesType): string[] {
  const psqlArray: string[] = [];
  updatesArray.forEach((operation: OperationType) => {
    const { action, tableName, tableSchema } = operation;
    switch (action) {
      case 'add':
        psqlArray.push(`CREATE TABLE ${tableSchema}.${tableName}(); `);
        break;

      case 'drop':
        psqlArray.push(`DROP TABLE ${tableSchema}.${tableName}; `);
        break;

      case 'alter': {
        const { alterOperations } = operation;
        const alterQuery: string = generatePostgresAlterQuery(
          alterOperations as PsqlAlterOperations,
        );
        psqlArray.push(
          `ALTER TABLE ${tableSchema}.${tableName} ${alterQuery}; `,
        );
        break;
      }

      default:
        throw new Error(`Invalid action: ${action}`);
    }
  });
  return psqlArray;
}
