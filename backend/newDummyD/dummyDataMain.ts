//this file maps table names from the schemaLayout object to individual sql files for DD generation

import faker from "faker";

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

const generateDataByType = (dataType) => {
  //faker.js method to generate data by type
  switch (dataType.data_type) {
    case 'smallint':
      return faker.random.number({min: -(2**15), max: (2**15 - 1)});
    case 'integer':
      return faker.random.number({min: -(2**31), max: (2**31 - 1)});
    case 'bigint':
      return faker.random.number({min: -(2**63), max: (2**63 - 1)});
    case 'character varying':
      if (dataType.character_maximum_length) {
        return faker.lorem.character(Math.floor(Math.random() * dataType.character_maximum_length));
      }
      else return faker.lorem.word();
    default:
      console.log('error')
  }
};

const writeSQLFile = () => {
  //iterates over each 
    //generates string INSERT INTO statement
    //writes to SQL file
};

//maps table names from schemaLayout to sql files
const generateDummyDataQueries = (schemaLayout, dummyDataRequest) => {
  //iterate over schemaLayout.tableNames array
  return schemaLayout.tableNames.map(tableName => {
    const tableMatrix: any = [];
    //if matching key exists in dummyDataRequest.dummyData
    if (dummyDataRequest.dummyData[tableName]) {
      //generate sql file with table name
      //declare empty columnData array for tableMatrix
      let columnData: any = [];
      //iterate over columnArray (schemaLayout.tableLayout[tableName])
      for (let i = 0; i < schemaLayout.tables[tableName].length; i++) {
        //while i < reqeusted number of tables
        while (columnData.length < dummyDataRequest.dummyData[tableName]) {
          //generate an entry
          let entry = generateDataByType({'data_type':'character varying'});
          //push into columnData
          columnData.push(entry);
        };
        //push columnData array into tableMatrix
        tableMatrix.push(columnData);
        //reset columnData array for next column
        columnData = [];
      };
    //write all entries in tableMatrix to sql file
    };
    return tableMatrix;
  });
};

export default generateDummyDataQueries;