import faker from 'faker';
import execute from '../channels';

const db = require('../models');

/*   THIS FILE CONTAINS THE ALGORITHMS THAT GENERATE DUMMY DATA    */
/*                                                                 */
/* - The functions below are called in channels.ts                 */
/* - This process runs for each table where data is requested      */
/* - generateDummyData creates dummy data values in a table matrix */
/* - This matrix is passed to writeCSV file function, which writes */
/*   a file to the postgres-1 container                            */

// helper function to generate random numbers that will ultimately represent a random date
const getRandomInt = (min, max) => {
  const minInt = Math.ceil(min);
  const maxInt = Math.floor(max);
  // The maximum is exclusive and the minimum is inclusive
  return Math.floor(Math.random() * (maxInt - minInt) + minInt); 
};

// this function generates data for a column
//   column data coming in is an object with the following form
// {
//   columnName: result.rows[i].column_name,
//   dataInfo: {
//     data_type: result.rows[i].data_type,
//     character_maxiumum_length: result.rows[i].character_maxiumum_length,
// }
const generateDataByType = (columnObj) => {
  // faker.js method to generate data by type
  switch (columnObj.dataInfo.data_type) {
    case 'smallint':
      return faker.random.number({ min: -32768, max: 32767 });
    case 'integer':
      return faker.random.number({ min: -2147483648, max: 2147483647 });
    case 'bigint':
      return faker.random.number({
        min: -9223372036854775808,
        max: 9223372036854775807,
      });
    case 'character varying':
      if (columnObj.dataInfo.character_maximum_length) {
        return faker.lorem.character(
          Math.floor(
            Math.random() * columnObj.dataInfo.character_maximum_length
          )
        );
      }
      return faker.lorem.word();
    case 'date': {
      // generating a random date between 1500 and 2020
      let result: string = '';
      const year: string = getRandomInt(1500, 2020).toString();
      let month: string = getRandomInt(1, 13).toString();
      if (month.length === 1) month = `0${month}`;
      let day: string = getRandomInt(1, 29).toString();
      if (day.length === 1) day = `0${day}`;
      result += `${year}-${month}-${day}`;
      return result;
    }
    default:
      console.log('Error generating dummy data by type');
      throw new Error('unhandled data type');
  }
};

// initialize a counter to make sure we are only adding back constraints once we've dropped and re-added columns
let count: number = 0;

let myObj: {
  writeCSVFile: Function;
  generateDummyData: Function;
};

    // console.log('tableObject: ', tableObject)
  // tableObject:  {
    //   tableName: 'films',
    //   data: [
    //     [ 'et' ],
    //     [ 967820530 ],
    //     [ 'commodi' ],
    //     [ 'quis' ],
    //     [ 'et' ],
    //     [ '1656-03-16' ],
    //     [ 0 ]
    //   ]
    // }
    // console.log('schemaLayout ', schemaLayout)
  // schemaLayout  {
    //   tableNames: [
    //     'films',
    //     'people',
    //   ],
    //   tables: {
    //     films: [
    //       [Object], [Object],
    //       [Object], [Object],
    //       [Object], [Object],
    //       [Object]
    //     ],
    //     vessels_in_films: [ [Object], [Object], [Object] ]
    //   }
    // }
    // console.log('keyObject ', keyObject)
  // keyObject  {
    //   films: { primaryKeyColumns: { _id: true }, foreignKeyColumns: {} },
    //   people: {
    //     primaryKeyColumns: { _id: true },
    //     foreignKeyColumns: { species_id: 'species', homeworld_id: 'planets' }
    //   },
    //   people_in_films: {
    //     primaryKeyColumns: { _id: true },
    //     foreignKeyColumns: { film_id: 'films', person_id: 'people' }
    //   },
    // }
    // console.log('dummyDataRequest', dummyDataRequest)
  // dummyDataRequest { schemaName: 'test', dummyData: { films: 2, people: 2 } }
    // console.log('event ', event)
myObj = {
  writeCSVFile: (
    tableObject,
    schemaLayout,
    keyObject,
    dummyDataRequest,
    event: any
  ) => {
    // extracting variables
    // Count of tables that will get injected with dummy data 
    const tableCount: number = Object.keys(dummyDataRequest.dummyData).length;
    // TableName is the name of the 
    const { tableName, data: tableMatrix } = tableObject;
    const { schemaName } = dummyDataRequest;

    // mapping column headers from getColumnObjects in models.ts to columnNames
    const columnArray: string[] = schemaLayout.tables[tableName].map(
      (columnObj) => columnObj.columnName
    );

    // transpose the table-matrix to orient it as a table
    const table: any = [];
    let row: any = [];
    for (let i = 0; i < tableMatrix[0].length; i += 1) {
      for (let j = 0; j < tableMatrix.length; j += 1) {
        row.push(tableMatrix[j][i]);
      }
      // join each subarray (which correspond to rows in our table) with a comma
      const rowString = row.join(',');
      table.push(rowString); // '1, luke, etc'
      row = [];
    }

    // Step 3 - this step adds back the PK constraints that we took off prior to copying the dummy data into the DB (using the db that is imported from models.ts)
    const step3 = () => {
      count += 1;
      const checkLast: number = tableCount - count;
      if (checkLast === 0) {
        db.addPrimaryKeyConstraints(keyObject, dummyDataRequest)
          .then(() => {
            db.addForeignKeyConstraints(keyObject, dummyDataRequest)
              .then(() => {
                event.sender.send('async-complete');
                count = 0;
              })
              .catch((err) => {
                console.log(err);
                count = 0;
              });
          })
          .catch((err) => {
            console.log(err);
            count = 0;
          });
      }
    };

    // Step 2 - using the postgres COPY command, this step copies the contents of the csv file in the container file system into the appropriate postgres DB
    const step2 = () => {
      const queryString: string = `\\copy ${tableName} FROM '${tableName}.csv' WITH CSV HEADER;`;

      execute(`psql -U postgres -d ${schemaName} -c "${queryString}" `, step3);
    };

    let csvString: string;
    // join tableMatrix with a line break (different on mac and windows because of line breaks in the bash CLI)
    if (process.platform === 'win32') {
      const tableDataString: string = table.join(
        `' >> ${tableName}.csv; echo '`
      );
      const columnString: string = columnArray.join(',');
      csvString = columnString
        .concat(`' > ${tableName}.csv; echo '`)
        .concat(tableDataString);
      execute(`bash -c "echo '${csvString}' >> ${tableName}.csv;"`, step2);
    } else {
      // we know we are not on Windows, thank god!
      const tableDataString: string = table.join('\n');
      const columnString: string = columnArray.join(',');
      csvString = columnString.concat('\n').concat(tableDataString);

      // split csv string into an array of csv strings that each are of length 100,000 characters or less
      // create upperLimit variable, which represents that max amount of character a bash shell command can handle
      const upperLimit: number = 100000;

      // create stringCount variable that is equal to csvString divided by upper limit rounded up
      const stringCount: number = Math.ceil(csvString.length / upperLimit);

      // create csvArray that will hold our final csv strings
      const csvArray: string[] = [];

      let startIndex: number;
      let endIndex: number;
      // iterate over i from 0 to less than stringCount, each iteration pushing slices of original csvString into an array
      for (let i = 0; i < stringCount; i += 1) {
        startIndex = upperLimit * i;
        endIndex = startIndex + upperLimit;
        // if on final iteration, only give startIndex to slice operator to grab characters until the end of csvString
        if (i === stringCount - 1) csvArray.push(csvString.slice(startIndex));
        else csvArray.push(csvString.slice(startIndex, endIndex));
      }
      let index: number = 0;
      // Step 1 - this writes a csv file to the postgres-1 file system, which contains all of the dummy data that will be copied into its corresponding postgres DB
      const step1 = () => {
        // NOTE: in order to rewrite the csv files in the container file system, we must use echo with a single angle bracket on the first element of csvArray AND then move on directly to step2 (and then also reset index)

        // if our csvArray contains only one element
        if (csvArray.length === 1) {
          execute(
            `bash -c "echo '${csvArray[index]}' > ${tableName}.csv;"`,
            step2
          );
          index = 0;
        }
        // otherwise if we are working with the first element in csvArray
        else if (index === 0) {
          console.log('this is last else statement in step1 on line 211 ');
          execute(
            `bash -c "echo -n '${csvArray[index]}' > ${tableName}.csv;"`,
            step1
          );
          index += 1;
        }
        // if working with last csvArray element, execute docker command but pass in step2 as second argument
        else if (index === csvArray.length - 1) {
          execute(
            `bash -c "echo '${csvArray[index]}' >> ${tableName}.csv;"`,
            step2
          );
          index = 0;
        }
        // otherwise we know we are not working with the first OR the last element in csvArray, so execute docker command but pass in a recursive call to our step one function and then immediately increment our index variable
        else {
          console.log('this is last else statement in step1 on line 230 ');
          execute(
            `bash -c “echo -n ‘${csvArray[index]}’ >> ${tableName}.csv;“`,
            step1
          );
          index += 1;
        }
      };
      step1();
    }
  },

  // maps table names from schemaLayout to sql files
  generateDummyData: (schemaLayout, dummyDataRequest, keyObject) => {
    const returnArray: any = [];

    // iterate over schemaLayout.tableNames array
    for (let m = 0; m < schemaLayout.tableNames.length; m += 1) {
      const tableName = schemaLayout.tableNames[m];

      const tableMatrix: any = [];
      // if matching key exists in dummyDataRequest.dummyData
      if (dummyDataRequest.dummyData[tableName]) {
        // declare empty columnData array for tableMatrix
        let columnData: any = [];
        // declare an entry variable to capture the entry we will push to column data
        let entry: any;

        // iterate over columnArray (i.e. an array of the column names for the table)
        const columnArray: string[] = schemaLayout.tables[tableName].map(
          (columnObj) => columnObj.columnName
        );
        for (let i = 0; i < columnArray.length; i += 1) {
          // declare a variable j (to be used in while loops below), set equal to zero
          let j: number = 0;
          // if there are either PK or FK columns on this table, enter this logic
          if (keyObject[tableName]) {
            // if this is a PK column, add numbers into column 0 to n-1 (ordered)
            if (keyObject[tableName].primaryKeyColumns[columnArray[i]]) {
              // while i < reqeusted number of rows
              while (j < dummyDataRequest.dummyData[tableName]) {
                // push into columnData
                columnData.push(j);
                // increment j
                j += 1;
              }
            }
            // if this is a FK column, add random number between 0 and n-1 (inclusive) into column (unordered)
            else if (keyObject[tableName].foreignKeyColumns[columnArray[i]]) {
              // while j < reqeusted number of rows
              while (j < dummyDataRequest.dummyData[tableName]) {
                // generate an entry
                entry = Math.floor(
                  Math.random() * dummyDataRequest.dummyData[tableName]
                );
                // push into columnData
                columnData.push(entry);
                j += 1;
              }
            }
            // otherwise, we'll just add data by the type to which the column is constrained
            else {
              while (j < dummyDataRequest.dummyData[tableName]) {
                // generate an entry
                entry = generateDataByType(schemaLayout.tables[tableName][i]);
                // push into columnData
                columnData.push(entry);
                j += 1;
              }
            }
          }
          // otherwise, we'll just add data by the type to which the column is constrained
          else {
            while (j < dummyDataRequest.dummyData[tableName]) {
              // generate an entry
              entry = generateDataByType(schemaLayout.tables[tableName][i]);
              // push into columnData
              columnData.push(entry);
              j += 1;
            }
          }

          // push columnData array into tableMatrix
  
  
          tableMatrix.push(columnData);
          // reset columnData array for next column
          columnData = [];
        }
        // only push something to the array if data was asked for for the specific table
        returnArray.push({ tableName, data: tableMatrix });
      }
    }
    // then return the returnArray
    return returnArray;
  },
};


module.exports = myObj;