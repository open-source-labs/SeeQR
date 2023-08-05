import fs from 'fs';
import { app } from 'electron';
import { Edge, MarkerType, Node } from 'reactflow';
import 'reactflow/dist/style.css';
import * as types from '../constants/constants';
import { greenPrimary } from '../style-variables';
import { ERTableColumnData, ERTableData, SchemaStateObjType } from '../types';
import {
  DatabaseLayoutObjType,
  isDatabaseLayoutObjTypeArr,
} from '../components/views/ERTables/NodeTypes';

// Need interface for table props
// Need interface for convertStateToReactFlow obect (methods)
// rename Table render method because wtf this makes it look like a react comp

interface TableConstructor {
  new (
    id: number,
    columns: ERTableColumnData[],
    name: string,
    tableCoordinates: { x: number; y: number },
    otherTables: {
      table_name: string;
      column_names: string[];
    }[],
    database: string,
  ): TableInterface;
}

interface TableInterface {
  render: () => { nodes: Node[]; edges: Edge[] };
}

/**
 * This class creates a table instance which will get the data for
 * the individual table and convert it to the form that react-flow is expecting
 * for its nodes
 */
const Table: TableConstructor = class Table implements TableInterface {
  private id: number;
  private columns: ERTableColumnData[];
  private name: string;
  private tableCoordinates: { x: number; y: number };
  private otherTables: {
    table_name: string;
    column_names: string[];
  }[];

  private database: string;
  constructor(
    id: number,
    columns: ERTableColumnData[],
    name: string,
    tableCoordinates: { x: number; y: number },
    otherTables: {
      table_name: string;
      column_names: string[];
    }[],
    database: string,
  ) {
    this.id = id;
    this.columns = columns;
    this.name = name;
    this.tableCoordinates = tableCoordinates;
    this.otherTables = otherTables;
    this.database = database;
  }

  // the render method converts the data into the form of react flow
  render() {
    // This method gets the table position from the stored file
    const getTablePosition = (): { x: number; y: number } => {
      try {
        const location = app.getPath('temp').concat('/UserTableLayouts.json');
        // refactored code. parse json file, look for current db in saved file, look for current table inside db. return undefined if db or table doesn't exist
        const parsedData: unknown = JSON.parse(
          fs.readFileSync(location, 'utf8'),
        );
        const foundCurrentDB = isDatabaseLayoutObjTypeArr(parsedData)
          ? parsedData.find(
              (db: DatabaseLayoutObjType) => db?.db_name === this.database,
            )
          : undefined;
        const foundCurrentTable = foundCurrentDB?.db_tables.find(
          (table) => table.table_name === this.name,
        );
        // return current table's saved position coordinates else return passed in coordinates if could not find saved coordinates in json
        return foundCurrentTable
          ? foundCurrentTable.table_position
          : { x: this.tableCoordinates.x, y: this.tableCoordinates.y };
      } catch (error) {
        return { x: (this.id - 1) * 500, y: 0 };
      }
    };
    // create a nodes array for react flow, the first element will always be a
    // TABLE_HEADER type of node
    const nodes: Node[] = [
      {
        id: `table-${this.name}`,
        type: types.TABLE_HEADER,
        position: getTablePosition(),
        data: {
          table_name: this.name,
        },
      },
    ];
    const edges: Edge[] = [];
    let num = -1;

    // iterate through the columns data for this data, create a node for each column
    // create an edge (the connection line) for each column that has a designated
    // foreign table and foreign column name
    this.columns.forEach((column) => {
      // check if column exists in the nodes array so duplicate nodes arent created in case there are duplicate columns. nums variable on line 63 starts at 0 and upon first incrementation on line 72 increases nnuber to 0 for the first node positioning on line 79
      const found = nodes.find(
        (colEl) =>
          colEl.id === `table-${this.name}_column-${column.column_name}`,
      );
      if (!found) {
        num += 1;
        // create a table field node for each column for react-flow
        nodes.push({
          id: `table-${this.name}_column-${column.column_name}`,
          type: types.TABLE_FIELD,
          parentNode: `table-${this.name}`,
          draggable: false,
          position: { x: 0, y: (num + 1) * 78 },
          data: {
            tableName: this.name,
            columnData: column,
            otherTables: this.otherTables,
          },
        });
      }
      // if the element has a foregin_column and foreign_table create an edge
      if (column.foreign_column && column.foreign_table) {
        // create an edge for react flow
        edges.push({
          source: `table-${this.name}_column-${column.column_name}`,
          target: `table-${column.foreign_table}_column-${column.foreign_column}`,
          id: `table-${this.name}_column${column.column_name}__table-${column.foreign_table}_column-${column.foreign_column}`,
          markerEnd: {
            type: MarkerType.Arrow,
            color: greenPrimary,
          },
          style: { strokeWidth: 6, stroke: greenPrimary },
        });
      }
    });
    // return an object with nodes and edges
    return {
      nodes,
      edges,
    };
  }
};

const convertStateToReactFlow = {
  // generates nodes and edges to position tables in a dynamic grid formation based on total number of tables and columns
  convert: (schema: SchemaStateObjType) => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const localTableList: { table_name: string; column_names: string[] }[] = [];
    const tables = schema.tableList;
    const tableCoordinates = {
      x: 0,
      y: 0,
    };
    let columnGap = 0;
    // create a columnGap variable, which calculates the y coordinate for any table in that row.
    // each time a column is added, increase column gap by 74.
    // each time a column is added, increase the y coordinate by the column gap
    // when a new row is reached, reset column gap to 0.

    // populate localTableList array that is a simplified list of tables and columns
    // in a separate loop so we can pass each new table instance a list of every other table
    tables.forEach((table) => {
      localTableList.push({
        table_name: table.table_name,
        column_names: table.columns.map((column) => column.column_name),
      });
    });

    for (let i = 0; i < tables.length; i += 1) {
      // make a deep copy so that modifying these values will not affect the data
      const copyOfTable = JSON.parse(JSON.stringify(tables[i])) as ERTableData;
      // create a list of other tables to pass into the Table constructor
      const otherTableList = localTableList.filter(
        (localTable) => localTable.table_name !== tables[i].table_name,
      );
      // if current table has more columns than any other in its row, set columnGap to new max number of columns * 74(px)
      // filter for duplicate column names -- one imported test db was creating a new column for each constraint and this is a bandaid fix
      const columnsGapSet = new Set();
      tables[i].columns.forEach((column) =>
        columnsGapSet.add(column.column_name),
      );
      columnGap = Math.max(columnsGapSet.size * 74, columnGap);
      // calculate a default rowLength based on sqrt of number of tables
      const rowLength = Math.floor(Math.sqrt(tables.length));
      // if table should be the beginning of a new row...
      if (i % rowLength === 0) {
        // set x, y coordinates for new row to 0 and +250 respectively;
        tableCoordinates.x = 0;
        tableCoordinates.y += 250 + columnGap;
        columnGap = 0;
      } else {
        // ...otherwise increment tables position horizontally in current row.
        tableCoordinates.x += 500;
      }
      // create a new instance of Table, push into table array
      const table = new Table(
        i + 1,
        copyOfTable.columns,
        schema.tableList[i].table_name,
        tableCoordinates,
        otherTableList,
        schema.database,
      );
      // assign the evaluated result of rendering the table into tablesNodesEdges
      const tableNodesAndEdges = table.render();
      // each table will return an array of its nodes/edges
      // spread the individual table nodes/edges and push to its corresponding array
      nodes.push(...tableNodesAndEdges.nodes);
      edges.push(...tableNodesAndEdges.edges);
    }
    return {
      nodes,
      edges,
    };
  },
};

export default convertStateToReactFlow;
