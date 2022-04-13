import * as types from '../constants/constants';
import { MarkerType } from 'react-flow-renderer';
import { greenPrimary } from '../style-variables';

class Table {
  constructor(id, columns, name, otherTables) {
    this.id = id;
    this.columns = columns;
    this.name = name;
    this.otherTables = otherTables;
  }
  render() {
    const nodes = [
      {
        id: `table-${this.name}`,
        type: types.TABLE_HEADER,
        position: { x: (this.id - 1) * 500, y: 0 },
        tableName: this.name,
        data: {
          table_name: this.name,
        },
      },
    ];
    const edges = [];
    this.columns.forEach((el, i) => {
      // create a node for react-flow
      nodes.push({
        id: `table-${this.name}_column-${el.column_name}`,
        type: types.TABLE_FIELD,
        parentNode: `table-${this.name}`,
        draggable: false,
        position: { x: 0, y: (i + 1) * 78 },
        data: {
          tableName: this.name,
          columnData: el,
          otherTables: this.otherTables,
        },
      });
      // if the element has a foregin_column and foreign_table create an edge
      if (el.foreign_column && el.foreign_table) {
        edges.push({
          source: `table-${this.name}_column-${el.column_name}`,
          target: `table-${el.foreign_table}_column-${el.foreign_column}`,
          id: `table-${this.name}_column${el.column_name}__table-${el.foreign_table}_column-${el.foreign_column}`,
          markerEnd: {
            type: MarkerType.Arrow,
            color: greenPrimary,
          },
          animated: true,
          style: { strokeWidth: 7, stroke: greenPrimary },
        });
      }
    });
    // return an object with nodes and edges
    return {
      nodes,
      edges,
    };
  }
}

const convertStateToReactFlow = {
  convert: (schema) => {
    // declare
    const nodes = [];
    const edges = [];
    const tableList = [];
    // iterate through the tableList
    for (let i = 0; i < schema.length; i++) {
      const column_names = [];
      // get all the column names from the table
      for (let j = 0; j < schema[i].columns.length; j++) {
        column_names.push(schema[i].columns[j].column_name);
      }
      // push tablelsit an object with the table name and
      tableList.push({
        table_name: schema[i].table_name,
        column_names,
      });
    }
    for (let i = 0; i < schema.length; i++) {
      // make a deep copy so that modifying these values will not affect the data
      const copyString = JSON.stringify(schema[i]);
      const copy = JSON.parse(copyString);
      // filter the table that is the same from the tableList
      const otherTableList = tableList.filter(
        (el) => el.table_name !== schema[i].table_name
      );
      // create a new instance of Table, push into table array
      const table = new Table(
        i + 1,
        copy.columns,
        schema[i].table_name,
        otherTableList
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