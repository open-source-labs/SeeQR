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

  // if you delete a table, it should decrement x and y coordinates by 250;
class Table {
  constructor(id, columns, name, otherTables, database) {
    this.id = id;
    this.columns = columns;
    this.name = name;
    this.otherTables = otherTables;
    this.database = database;
    this.coordinates = {
      x: 0,
      y: 0
    };
    this.rowCounter = 0;
    this.rowNumber = 0;
    // this.genCoords = setCoords();
  }

  setCoords () {
      const tablesArea = Math.floor(Math.sqrt(9))
      // console.log(tablesArea)
      if (this.rowLength <= tablesArea) {
        this.coordinates.x = this.rowLength * 250;
        this.coordinates.y = this.rowNumber * 250;
        console.log(this.rowLength)
        this.rowLength++;
      }
      else {
        this.rowLength = 0;
        this.coordinates.x = this.rowLength;
        console.log(this.rowNumber)
        this.rowNumber++;
      }
    }
  

  
  // the render method converts the data into the form of react flow
  render() {
    
    // This method gets the table positions from the stored file
    const getTablePosition = () => {
      // remote lets you access main-process-only objects as if they were available in the renderer process.
      const location = remote.app.getPath('temp').concat('/UserTableLayouts.json');
      console.log(location);
      try {
        const data = fs.readFileSync(location, 'utf8');
        // console.log(data);
        const parsedData = JSON.parse(data);
        for (let i = 0; i < parsedData.length; i += 1) {
          const db = parsedData[i];
          if (db.db_name === this.database) {
            // eslint-disable-next-line consistent-return
            for (let j = 0; j < db.db_tables.length; j += 1) {
              const currTable = db.db_tables[j];
              // if (currTable.table_name === this.name)
                return currTable.table_position;
            }
          }
        }
        console.log(this.coordinates.x)
        console.log(this.coordinates.y)
        
        
        return { x: (this.id - 1) * 500, y: 0 };
      } 
      catch (error) {
        return { x: (this.id - 1) * 500, y: 0 };
      }
    };
    // create a nodes array for react flow, the first node will always be automatically created. 
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

      // if the element has a foreign_column which matches a foreign_table create an edge
      if (el.foreign_column && el.foreign_table) {
        // push edge object into edges array.   
        edges.push({
          // source: the current element, which possessses the foreign column named table-(name)_column-(column_name)
          source: `table-${this.name}_column-${el.column_name}`,
          // target: the foreign table which matches the name of the source table element.    
          target: `table-${el.foreign_table}_column-${el.foreign_column}`,
          // the unique id of the edge object, composed of the names of the source and target properties. 
          id: `table-${this.name}_column${el.column_name}__table-${el.foreign_table}_column-${el.foreign_column}`,
          // the visual marker which attaches to a table node from the edge object. 
          markerEnd: {
            type: MarkerType.Arrow,
            color: greenPrimary,
          },
          style: { strokeWidth: 6, stroke: greenPrimary },
        });
      }
    });

    // return an object containing the array of nodes and edges to be rendered. 
    return {
      nodes,
      edges,
    };
   // => END OF RENDER FUNCTION.
  }
  // => END OF TABLE CLASS.
}

// =============
// CONVERT STATE
// =============

const convertStateToReactFlow = {
  // convert property, because this is an object for some godforsaken reason. 
  convert: (schema) => {
    
    // probably hold nodes that are converted to reactflow syntax
    const nodes = [];
    const edges = [];
    const tableList = [];
    // iterate through the tableList in the current schema(database?);
    for (let i = 0; i < schema.tableList.length; i += 1) {
      const column_names = [];
      // get all the column names from the table and collect them in column_names
      for (let j = 0; j < schema.tableList[i].columns.length; j += 1) {
        column_names.push(schema.tableList[i].columns[j].column_name);
      }
      // push a table object containing the current table_name and the column_names for that table into the tableList array.
      tableList.push({
        table_name: schema.tableList[i].table_name,
        column_names,
      });
    }
    // iterate through the tableList array of table objects.
    for (let i = 0; i < schema.tableList.length; i += 1) {
      // make a deep copy of each table object so that modifying these values will not affect the data.
      const copyString = JSON.stringify(schema.tableList[i]);
      const copy = JSON.parse(copyString);

      // declare OtherTableList, assign it to result of tablelist filter op. 
      // Used to pass into table instance below. 
      const otherTableList = tableList.filter(
        // filter out every table in table_list which doesn't match the current table being iterated over via line 171.  
        (el) => el.table_name !== schema.tableList[i].table_name
      );

      // create a new instance of Table
      const table = new Table(
        // id
        i + 1,
        // columns
        copy.columns,
        // name
        schema.tableList[i].table_name,
        // otherTables
        otherTableList,
        // database
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
