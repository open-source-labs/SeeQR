//this file maps table names from the schemaLayout object to individual sql files for DD generation

import { ipcRenderer } from "electron";
import { write } from "fs/promises";
// import { execute } from '../channels';
// import  channels  from '../channels';
import execute from '../channels';
const { exec } = require('child_process');

// 3. get schema layout 
//     const schemaLayout: any = {
//         // tableNames: ['Johnny Bravo', 'Teen Titans', ...]
//         tableNames: [],
//         tables: {
//             // tableName: [columnNames array]
//         }
//     };
// 4. iterate over tables in hollow schema (Options: 1. run sql query to get list of tables; 2. use 'getList' function defined in models.ts)
//     5. generate new .sql file
//     6. create dummyData object, e.g.:
//         const DD = {
//             // people
//             table_1: {
//                 // columnArray: ["_id", "name", "homeworld_id", ...]
//                 columnArray: [],
//                 // [[1,2,3,4,...],["luke", "leia", "jabaDaHut", ...], ...]
//                 tableMatrix: [[],[]]
//             }
//         }
// 7. for each table, make a column array, "columnArray" and save to dummyDataObject (Options: 1. run sql query to get column names)
// 8. generate table data and save as tableMatrix (transpose of table) to dummyDataObject (importing in dataObj from state, created in dummyData process)
//     iterate over "column array"
//         declare capture array
//         generate n entries for column where n is equal to the number of rows asked for in dataObj (using faker)
//         push these entries to capture array
//         push capture array to matrix

//         note: this ^ only works for single-column primary and foreign key constraints (no composite keys)
// 9. use helper function to write insert statements to a string (importing in dataObj from state, created in dummyData process), e.g.:
//     function generateInsertQueries (tableName, tableMatrix, columnArray) {
//         let dumpString = '';
//         let catchValuesForQuery = [];
//         let query = '';
//         iterate from j = 0 while j < tableMatrix[0].length
//             catchValuesForQuery = [];
//             iterate from i = 0 while i < tableMatrix.length (= columnArray.length)
//                 push tableMatrix[i][j] entry into catchValuesForQuery array
//             query = "INSERT INTO {tableName} ({...columnArray}) VALUES ({...catchValuesForQuery});"
//             dumpString += query;
//         return query;
//     }
// 10. write query string to the .sql file

//parameter passed in from channels
type schemaLayout = {
  tableNames: string[];
  tables: any;
}

//parameter passed in from channels
type dummyDataRequest = {
  schemaName: string;
  dummyData: {};
}

//created in function
// type dummyDataObject = {};

const generateDataByType = (dataType) => {
  //faker.js method to generate data by type
};



const writeSQLFile = () => {
  const tableMatrix: any = [[1,2],['casey','justin']];
  const tableName: string = 'testTable';
  const columnArray: string[] = ['id','name']

     //transpose tableMatrix
    //tableMatrix: [[1,2,3,4,...],["luke", "leia", "jabaDaHut", ...], ...]
    const table: any = [];
    let row: any  = [];
    for(let i = 0; i < tableMatrix[0].length; i++) {
      for(let j = 0; j < tableMatrix.length; j++) {
          row.push(tableMatrix[j][i]); 
      }
      //join each subarray (which correspond to rows in our table) with a comma
      const rowString = row.join(',');
      table.push[rowString]; //'1, luke, etc'
      row = [];
    }
    //join tableMatrix with a line break
    //save to string
    const tableDataString: string = table.join('\n');
    //`docker cp ${file} postgres-1:/data_dump`;
    const columnString: string = columnArray.join(',');

    const csvString: string = columnString + tableDataString;
    
    const writeString: string = `echo ${csvString} > postgres-1:/${tableName}.csv`

    // create table csv file to volume
    // write column names to csv file by calling execute
    execute(writeString, null);

    //run postgres COPY table_name FROM 'filepath/path/postgres-data.csv' (absolute path) DELIMTERE ',' CSV HEADER; (for each table)

    //delete .csv files from volume

};

//maps table names from schemaLayout to sql files
const generateDummyDataQueries = (schemaLayout, dummyDataRequest) => {
  // iterate over schemaLayout.tableNames array
  // return schemaLayout.tableNames.map(tableName => {
  //   const tableMatrix: any = [];
  //   //if matching key exists in dummyDataRequest.dummyData
  //   if (dummyDataRequest.dummyData[tableName]) {
  //     //generate sql file with table name
  //     //declare empty columnData array for tableMatrix
  //     let columnData: any = [];
  //     //iterate over columnArray (schemaLayout.tableLayout[tableName])
  //     for (let i = 0; i < schemaLayout.tables[tableName].length; i++) {
  //       //while i < reqeusted number of tables
  //       while (columnData.length < dummyDataRequest.dummyData[tableName]) {
  //         //generate an entry
  //         let entry = "test";
  //         //push into columnData
  //         columnData.push(entry);
  //       };
  //       //push columnData array into tableMatrix
  //       tableMatrix.push(columnData);
  //       //reset columnData array for next column
  //       columnData = [];
  //     };
  //   //write all entries in tableMatrix to sql file
  //     writeSQLFile();
  //   };
  //   return tableMatrix;
  // });
  writeSQLFile();
};

export default generateDummyDataQueries;