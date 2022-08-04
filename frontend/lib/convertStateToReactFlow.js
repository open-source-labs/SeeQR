import fs from 'fs';
import { remote } from 'electron';
import { MarkerType } from 'react-flow-renderer';
import { greenPrimary } from '../style-variables';
import * as types from '../constants/constants';

/**
 * This class creates a table instance which will get the data for
 * the individual table and convert it to the form that react-flow is expecting
 * for its nodes
 */
class Table {
  constructor(id, columns, name, tableCoordinates, otherTables, database) {
    this.id = id;
    this.columns = columns;
    this.name = name;
    this.tableCoordinates = tableCoordinates;
    this.otherTables = otherTables;
    this.database = database;
  }
  // the render method converts the data into the form of react flow
  render() {
    // This method gets the table table position from the stored file
    const getTablePosition = () => {
      const location = remote.app.getPath('temp').concat('/UserTableLayouts.json');
      try {
        const data = fs.readFileSync(location, 'utf8');
        const parsedData = JSON.parse(data);
        for (let i = 0; i < parsedData.length; i += 1) {
          const db = parsedData[i];
          if (db.db_name === this.database) {
            // eslint-disable-next-line consistent-return
            for (let j = 0; j < db.db_tables.length; j += 1) {
              const currTable = db.db_tables[j];
              if (currTable.table_name === this.name)
                return currTable.table_position;
            };
          };
        };
        
        return { x: this.tableCoordinates.x, y: this.tableCoordinates.y };
      } catch (error) {
        return { x: (this.id - 1) * 500, y: 0 };
      }
    };
    // create a nodes array for react flow, the first element will always be a
    // TABLE_HEADER type of node
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
    // iterate through the columns data for this data, create a node for each column
    // create an edge (the connection line) for each column that has a designated
    // foreign table and foreign column name
    this.columns.forEach((el, i) => {
      // create a table field node for each column for react-flow
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
        // create an edge for react flow
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
    const tableCoordinates = {
      x: 0,
      y: 0
    };

    // create a columnGap variable, which calculates the y coordinate for any table in that row. 
    // each time a column is added, increase column gap by 74. 
    // each time a column is added, increase the y coordinate by the column gap  
    // when a new row is reached, reset column gap to 0.

    let columnGap = 0;
    // iterate through the tableList
    for (let i = 0; i < schema.tableList.length; i += 1) {
    
      const column_names = [];
      // get all the column names from the table
      for (let j = 0; j < schema.tableList[i].columns.length; j += 1) {
        column_names.push(schema.tableList[i].columns[j].column_name);
      };
      tableList.push({
        table_name: schema.tableList[i].table_name,
        column_names,
      });  
    }

    for (let i = 0; i < schema.tableList.length; i += 1) {
      // make a deep copy so that modifying these values will not affect the data
      const copyString = JSON.stringify(schema.tableList[i]);
      const copy = JSON.parse(copyString);
      // filter the table that is the same from the tableList
      const otherTableList = tableList.filter(
        (el) => el.table_name !== schema.tableList[i].table_name
      );
      
      // check the current index of the table in tableList against the length of the list. 
      // on each loop.
      const tables = schema.tableList;
      const columns = tables[i].columns.length;
      const localColumnGap = columns * 74; 
      if (localColumnGap > columnGap) columnGap = localColumnGap;

      const rowLength = Math.floor(Math.sqrt(tables.length));
      // if index is divisible by length of list, start a new row of tables. 
      if (i % rowLength === 0) {
        // set x, y coordinates for new row to 0 and +250 respectively; 
        tableCoordinates.x = 0;
        tableCoordinates.y += 250 + columnGap;
        columnGap = 0;
      } else {
        // otherwise increment tables position horizontally in current row. 
        tableCoordinates.x += 500;
      };

      // else increment x coordinate by + 250  


      // position tables in dynamic grid formation. 
      // create a new instance of Table, push into table array
      const table = new Table(
        i + 1,
        copy.columns,
        schema.tableList[i].table_name,
        tableCoordinates,
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
