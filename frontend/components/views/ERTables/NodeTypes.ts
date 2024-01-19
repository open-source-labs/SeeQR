import tableHeader from './TableHeaderNode';
import tableField from './TableFieldNode';
import tableFooter from './TableFooterNode';
/**
 * This file is required for React-flow
 * React-flow states:
 *  " You can add a new node type to React Flow by adding it to the nodeTypes prop.
 *  It's important that the nodeTypes are memoized or defined outside of the component.
 *  Otherwise React creates a new object on every render which leads to performance issues and bugs."
 *
 *  https://reactflow.dev/docs/guides/custom-nodes/
 *
 */
type NodeTypes = {
  tableHeader: any;
  tableField: any;
  tableFooter: any;
};
const nodeTypes: NodeTypes = {
  tableHeader,
  tableField,
  tableFooter,
};
export type TablePosObjType = {
  table_name: string;
  table_position: {
    x: number;
    y: number;
  };
};
export type DatabaseLayoutObjType = {
  db_name: string;
  db_tables: TablePosObjType[];
};

export function isTablePosObjType(object: unknown): object is TablePosObjType {
  return (
    typeof object === 'object' &&
    object !== null &&
    'table_name' in object &&
    'table_position' in object &&
    typeof object.table_position === 'object' &&
    object.table_position !== null &&
    'x' in object.table_position &&
    typeof object.table_position.x === 'number' &&
    'y' in object.table_position &&
    typeof object.table_position.y === 'number'
  );
}

export function isDatabaseLayoutObjType(
  object: unknown,
): object is DatabaseLayoutObjType {
  return (
    typeof object === 'object' &&
    object !== null &&
    'db_name' in object &&
    'db_tables' in object &&
    typeof object.db_name === 'string' &&
    Array.isArray(object.db_tables) &&
    object.db_tables.every((el) => isTablePosObjType(el))
  );
}

export function isDatabaseLayoutObjTypeArr(
  object: unknown,
): object is DatabaseLayoutObjType[] {
  return (
    Array.isArray(object) && object.every((el) => isDatabaseLayoutObjType(el))
  );
}

export default nodeTypes;
