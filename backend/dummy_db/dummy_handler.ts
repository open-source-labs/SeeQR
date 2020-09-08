const faker = require('faker');
const fakerLink = require('./fakerLink');
const types = require('./dataTypeLibrary');

// interface Types {
//   unique : any;
//   repeating : object;
// }
// const types : Types = {
//   unique : {},
//   repeating : {},
// };

// // Closure function that contains all functionality for creating unique strings
// types.unique.str = (data : any, scale : number) => {
//   let chars : string = '';
//   const unique : Array<string> = [];
//   const lockedIndexes : Array<number> = [];
//   // if character types are 'true', append them to the character list
//   if (data.inclAlphaLow) chars  += 'abcdefghijklmnopqrstuvwxyz';
//   if (data.inclAlphaUp) chars  += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
//   if (data.inclNum) chars  += '0123456789';
//   if (data.inclSpaces) chars += ' ';
//   if (data.inclSpecChar) chars += ',.?;:!@#$%^&*';
//   // if none were true or is only inclSpaces was true, a series of unique values will not be possible.
//     // if this is the case, set chars to include all letters - lower and upper
//   if (chars.length <= 1) chars  += 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
//   // ensure that the minimum length can accommodate unique values to the length of the scale
//   let min : number = 1;
//   while (chars.length ** min < scale) min += 1;
//   // create minimum unique keys in sequence for quick retrieval when creating record
//   // stop once scale is reached
//   (function buildUnique (str : string) {
//     if (str.length === min) {
//       unique.push(str);
//       return;
//     }
//     for (let i : number = 0; i < chars.length; i += 1) {
//       if (unique.length === scale) return;
//       buildUnique(str + chars[i]);
//     }
//   })('');
//   // handle INCLUDE values : values the user requires to exist
//   // find the first chars up to the index of min (prefix) then search the unique array for that prefix.
//   // if it exist, replace it with the full string.
//   // if not, find a random index and insert the full string there.
//   // Keep track of the indexes already use to avoid overwriting something we need to save (lockedIndex on output)
//   if (data.include > scale) console.log(`ERROR: Entries in 'Include' exceed the scale of the table, some values will not be represented.` )
//   data.include.sort();
//   for (let i = 0; i < data.include.length && i < scale; i += 1) {
//     let prefix : string = ''; 
//     for (let k : number = 0; k < min && k < data.include[i].length; k += 1) prefix += data.include[i][k];
//     let index : number = unique.indexOf(prefix);
//     while (lockedIndexes.includes(index) || index === -1) {
//       index = Math.floor(Math.random() * Math.floor(scale));
//     }
//     lockedIndexes.push(index);
//     unique[index] = data.include[i];
//   }
//   lockedIndexes.sort();

//   // CLOSURE : function to be called on each record

//   return function (i) {
//     // initalize the output string with the unique prefix associated with that record (i)
//     let output : string = unique[i];
//     // if the value has already be set from INCLUDES, do not append random digits.
//     if (lockedIndexes.includes(i)) return output;
//     // create a random string length between the user specified min/max bounds.
//       // account for the space already taken by the prefix
//     const strLen : number = Math.round(Math.random() * (data.maxLen - data.minLen)) + data.minLen;
//     for (let k = unique[i].length; k < strLen; k += 1) {
//       output += chars[Math.floor(Math.random() * Math.floor(chars.length))]
//     }
//     return output;
//   };
// };

// types.unique.num = (data : any, scale : number) => {
//   return (index) => {if (data.serial) return index};
// };

// // REPEATING DATA TYPE - STILL NEEDED
// // types.repeating.loop = (data : object, scale : number) => {};
// // types.repeating.weighted = (data : object, scale : number) => {};
// // types.repeating.counted = (data : object, scale : number) => {};

// /* ===================== END OF DATA TYPE FUNCTIONS ===================== */


/* ==================== BEGIN RECORD CREATE FUNCTIONS =================== */

// GENERATE 'INSERT INTO' QUERY STRING
// Populate an array of INSERT queries to add the data for the table to the database.
  // An array is used to break the insert into smaller pieces if needed.
  // Postgres limits insert queries to 100,000 entry values: 100,000 / # of columns = Max number of rows per query.
// Arguments: form = DB generation form object submitted by user - from front end
function createInsertQuery (form : any) : string {
  const values = valuesList(form.columns, form.scale);
  const cols = columnList(form.columns);
  const queryArray : any = [];
  values.forEach(e => queryArray.push(`INSERT INTO "${form.table}"(${cols}) VALUES ${e}; `));
  return queryArray;
}

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
  let maxRecords : number = 20; // columns.length;
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


module.exports = createInsertQuery;

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
