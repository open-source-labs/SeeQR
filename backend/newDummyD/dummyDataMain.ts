//this file maps table names from the schemaLayout object to individual sql files for DD generation

import faker from "faker";
import execute from '../channels';
import fs from 'fs';
import { table } from "console";
const path = require('path');
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

//this function generates unique values for a column
const generatePrimayKey = () => {

}

// this function generates non-unique data for a column
//   dataType should be an object
//   ex: {
//     'data_type': 'integer';
//     'character_maximum_length': null
//   }

const generateDataByType = (columnObj) => {
  //faker.js method to generate data by type
  switch (columnObj.dataInfo.data_type) {
    case 'smallint':
      return faker.random.number({min: -32768, max: 32767});
    case 'integer':
      return faker.random.number({min: -2147483648, max: 2147483647});
    case 'bigint':
      return faker.random.number({min: -9223372036854775808, max: 9223372036854775807});
    case 'character varying':
      if (columnObj.dataInfo.character_maximum_length) {
        return faker.lorem.character(Math.floor(Math.random() * columnObj.dataInfo.character_maximum_length));
      }
      else return faker.lorem.word();
    case 'date':
      let result: string = '';
      let year: string = getRandomInt(1500, 2020).toString();
      let month: string = getRandomInt(1, 13).toString();
      if (month.length === 1) month = '0' + month;
      let day: string = getRandomInt(1, 29).toString();
      if (day.length === 1) day = '0' + day;
      result += year + '-' + month + '-' + day;
      return result;
    default:
      console.log('error')
  }
};

//helper function to generate random numbers that will ultimately represent a random date
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

module.exports = {

  writeCSVFile: (tableMatrix, tableName, columnArray) => {
    const table: any = [];
    let row: any  = [];
    for(let i = 0; i < tableMatrix[0].length; i++) {
      for(let j = 0; j < tableMatrix.length; j++) {
          row.push(tableMatrix[j][i]); 
      }
      //join each subarray (which correspond to rows in our table) with a comma
      const rowString = row.join(',');
      table.push(rowString); //'1, luke, etc'
      row = [];
    }
    //join tableMatrix with a line break
    const tableDataString: string = table.join('\n');

    const columnString: string = columnArray.join(',');

    const csvString: string = columnString.concat('\n').concat(tableDataString);
    // build file path

    const compiledPath = path.join(__dirname, `../${tableName}.csv`);

    
    //write csv file
    return new Promise((resolve, reject) => {
      execute(`docker exec postgres-1 touch /database-data/${tableName}`, console.log('touch command'));
      execute(`docker exec postgres-1 echo "${csvString}" >> /database-data/${tableName}`, console.log('wrote to file'));
      resolve(console.log('CSV created in container'));
      // fs.writeFile(compiledPath, csvString, (err: any) => {
      //   if (err) throw err;
      //   resolve(console.log('FILE SAVED'));
      //   // reject(console.log('Error Saving File'))
      // });
    })
  },

  //maps table names from schemaLayout to sql files
  generateDummyData: (schemaLayout, dummyDataRequest) => {
    const returnArray: any = [];
    //iterate over schemaLayout.tableNames array
    for (const tableName of schemaLayout.tableNames) {
      const tableMatrix: any = [];
      //if matching key exists in dummyDataRequest.dummyData
      if (dummyDataRequest.dummyData[tableName]) {
        //declare empty columnData array for tableMatrix
        let columnData: any = [];
        //iterate over columnArray (schemaLayout.tableLayout[tableName])
        for (let i = 0; i < schemaLayout.tables[tableName].length; i++) {
          //while i < reqeusted number of tables
          while (columnData.length < dummyDataRequest.dummyData[tableName]) {
            //generate an entry
            let entry = generateDataByType(schemaLayout.tables[tableName][i]);
            //push into columnData
            columnData.push(entry);
          };
          //push columnData array into tableMatrix
          tableMatrix.push(columnData);
          //reset columnData array for next column
          columnData = [];
        };
        // only push something to the array if data was asked for for the specific table
        returnArray.push({tableName, data: tableMatrix});
      };
    };
    // then return the returnArray
    return returnArray;
  }
}

// export default generateDummyDataQueries

  // //iterate through tables for which data was requested to copy data to tables
  // for(let i = 0; i < arrayOfTableMatrices.length; i++) {
  //   // pulling tableName out of schemaLayout
  //   let tableName = schemaLayout.tableNames[i];
  //   // if data was requested for that table, then copy the csv file data to the table
  //   if (dummyDataRequest.dummyData[tableName]){
  //     await copyCSVToTable (tableName);
  //   }
  // }

// //this function copies data to a table from an epynomous .csv file
// const copyCSVToTable = (tableName) => {
//   const compiledPath = path.join(__dirname, `../${tableName}.csv`);
//   execute(`docker exec postgres-1 COPY ${tableName} FROM ${compiledPath} DELIMITER ',' CSV HEADER;`, null);
// }