const faker = require('faker');
const {fakerLink} = require('./fakerLink');
const {types} = require('./dataTypeLibrary');

/* --- MAIN FUNCTION --- */

// GENERATE 'INSERT INTO' QUERY STRING
// Populate an array of INSERT queries to add the data for the table to the database.
  // An array is used to break the insert into smaller pieces if needed.
  // Postgres limits insert queries to 100,000 entry values: 100,000 / # of columns = Max number of rows per query.
// Arguments: form = DB generation form object submitted by user - from front end
export const createInsertQuery = (form : any) : string => {
  const values = valuesList(form.columns, form.scale);
  const cols = columnList(form.columns);
  const queryArray : any = [];
  values.forEach(e => queryArray.push(`INSERT INTO "${form.table}"(${cols}) VALUES ${e}; `));
  return queryArray;
}


/* --- CALLBACK FUNCTIONS --- */

// CREATE 'COLUMN' STRING FOR QUERY
  // Called by createInsertQuery()
// deconstruct and convert the column names to a single string
// Arguments: column = form.columns
const columnList = (columns : Array<object>) => {      
  let list : string = '';
  columns.forEach( (e : any , i : number) => {
    list += e.name;
    if (i < columns.length - 1) list += ', ';
  } );
  return list;
}

// CREATE ALL VALUES FOR ALL RECORDS AT SCALE
  // Called by createInsertQuery()
// Arguments: column = form.columns, scale = form.scale
const valuesList = (columns : any, scale : number) => {
  const columnTypes = createRecordFunc(columns, scale);
  const valuesArray : any = [];
  // determine maximum number of records Postgres will allow per insert query - with buffer
  let maxRecords : number = 10; // columns.length;
  let list : string = '';
  // create the number of records equal to the scale of the table
  for (let i : number = 0; i < scale; i += 1) {
    // start each record as an empty string
    let record : string = '';
    // traverse each column and concat the results of calling the the data type function
    columnTypes.forEach( (e : any, k : number) => {
      // concat to the record the results of calling the function for the data type
        // if the type is random, pass no arguments. If it is any other type, pass the index 
      let entry = (e.random) ? e.func().replace(`'`, ``) : e.func(i);
      record += "" + ((typeof entry === 'string') ? `'${entry}'` : entry);
      if (k < columns.length - 1) record += ', ';
    })
    list += `(${record})`;
    if (i && i % maxRecords === 0 || i === scale - 1) {
      valuesArray.push(list);
      list = '';
    } 
    else list += ', ';
  }
  return valuesArray;
};

// DEFINE TYPE FORMULAS FOR EACH COLUMN (prior to iterating)
  // Called by valuesList()
// Helper function: connect each column to its appropriate function prior to creating records to reduce redundant function calls.  
// Arguments: column = form.columns, scale = form.scale
const createRecordFunc = (columns : any, scale : number) => {
  let output : Array<object> = [];
  columns.forEach(e => {    
    const {dataCategory, dataType} = e;
    if (dataCategory === 'random') output.push({random : true, func : fakerLink[dataType]});
    else if (dataCategory === 'repeating' || dataCategory === 'unique') output.push({random : false, func : types[dataCategory][dataType](e.data, scale)});
    // ADD OTHER DATA TYPES HERE
    else {
      console.log(`ERROR: Column ${e.name} has an invalid data type. Table will still populate but this column will be empty.`)
      output.push (() => {});
    }
  } );
  return output;
};

/* UNCOMMENT BELOW FOR TESTING OBJECT AND FUNCTION */
// const fromApp = {
//   schema : 'schema1',  // Not currrently relevant: when multiple schemas per db are added, add this after INTO in createInsertQuery = |"${form.schema}".|
//   table : 'table1',
//   scale : 5,
//   columns : [
//     {
//       name : '_id',
//       dataCategory : 'unique', // random, repeating, unique, combo, foreign
//       dataType : 'num', 
//       data : {
//         serial: true,
//       }
//     },
//     {
//       name : 'username',
//       dataCategory : 'unique', // random, repeating, unique, combo, foreign
//       dataType : 'str',
//       data : {
//         minLen : 10,
//         maxLen : 15,
//         inclAlphaLow : true,
//         inclAlphaUp : true,
//         inclNum : true,
//         inclSpaces : true,
//         inclSpecChar : true,
//         include : ["include", "these", "abReplace"],
//       },
//     },
//     {
//       name : 'first_name',
//       dataCategory : 'random', // random, repeating, unique, combo, foreign
//       dataType : 'Name - firstName', 
//       data : {
//       }
//     },
//     {
//       name : 'company_name',
//       dataCategory : 'random',
//       dataType : 'Company - companyName', 
//       data : {
//       }
//     }
//   ]
// };
// console.log(createInsertQuery(fromApp));
