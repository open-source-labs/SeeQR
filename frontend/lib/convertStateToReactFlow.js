import fs from 'fs';
import { remote } from 'electron';

import { MarkerType } from 'react-flow-renderer';
import { greenPrimary } from '../style-variables';

import * as types from '../constants/constants';

class Table {
  constructor(id, columns, name, otherTables, database) {
    this.id = id;
    this.columns = columns;
    this.name = name;
    this.otherTables = otherTables;
    this.database = database;
  }

  render() {
    const getTablePosition = () => {
      const location = remote.app.getAppPath().concat('/UserTableLayouts.json');
      try {
        const data = fs.readFileSync(location, 'utf8');
        const parsedData = JSON.parse(data);
        for (let i = 0; i < parsedData.length; i++) {
          const db = parsedData[i];
          if (db.db_name === this.database) {
            // eslint-disable-next-line consistent-return
            for (let j = 0; j < db.db_tables.length; j++) {
              const currTable = db.db_tables[j];
              if (currTable.table_name === this.name) {
                // console.log(
                //   'tablename',
                //   currTable.table_name,
                //   '\nposition',
                //   currTable.table_position
                // );
                return currTable.table_position;
              }
            }
          }
        }
        return { x: (this.id - 1) * 500, y: 0 };
      } catch (error) {
        return { x: (this.id - 1) * 500, y: 0 };
      }
    };

    const nodes = [
      {
        id: `table-${this.name}`,
        type: types.TABLE_HEADER,
        position: getTablePosition(this.name, this.id),
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
}

const convertStateToReactFlow = {
  convert: (schema) => {
    // declare
    const nodes = [];
    const edges = [];
    const tableList = [];
    // iterate through the tableList
    for (let i = 0; i < schema.tableList.length; i++) {
      const column_names = [];
      // get all the column names from the table
      for (let j = 0; j < schema.tableList[i].columns.length; j++) {
        column_names.push(schema.tableList[i].columns[j].column_name);
      }
      // push tablelsit an object with the table name and
      tableList.push({
        table_name: schema.tableList[i].table_name,
        column_names,
      });
    }
    for (let i = 0; i < schema.tableList.length; i++) {
      // make a deep copy so that modifying these values will not affect the data
      const copyString = JSON.stringify(schema.tableList[i]);
      const copy = JSON.parse(copyString);
      // filter the table that is the same from the tableList
      const otherTableList = tableList.filter(
        (el) => el.table_name !== schema.tableList[i].table_name
      );
      // create a new instance of Table, push into table array
      const table = new Table(
        i + 1,
        copy.columns,
        schema.tableList[i].table_name,
        otherTableList,
        schema.database
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
