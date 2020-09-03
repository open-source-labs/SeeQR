const faker = require('faker');

// FAKER CONVERSION
// Convert string from front end to a call to the Faker.js API
const fakerLink = {
  'Address - zipCode' : faker.address.zipCode,
  'Address - zipCodeByState' : faker.address.zipCodeByState,
  'Address - city' : faker.address.city,
  'Address - cityPrefix' : faker.address.cityPrefix,
  'Address - citySuffix' : faker.address.citySuffix,
  'Address - streetName' : faker.address.streetName,
  'Address - streetAddress' : faker.address.streetAddress,
  'Address - streetSuffix' : faker.address.streetSuffix,
  'Address - streetPrefix' : faker.address.streetPrefix,
  'Address - secondaryAddress' : faker.address.secondaryAddress,
  'Address - county' : faker.address.county,
  'Address - country' : faker.address.country,
  'Address - countryCode' : faker.address.countryCode,
  'Address - state' : faker.address.state,
  'Address - stateAbbr' : faker.address.stateAbbr,
  'Address - latitude' : faker.address.latitude,
  'Address - longitude' : faker.address.longitude,
  'Address - direction' : faker.address.direction,
  'Address - cardinalDirection' : faker.address.cardinalDirection,
  'Address - ordinalDirection' : faker.address.ordinalDirection,
  'Address - nearbyGPSCoordinate' : faker.address.nearbyGPSCoordinate,
  'Address - timeZone' : faker.address.timeZone,
  'Commerce - color' : faker.commerce.color,
  'Commerce - department' : faker.commerce.department,
  'Commerce - productName' : faker.commerce.productName,
  'Commerce - price' : faker.commerce.price,
  'Commerce - productAdjective' : faker.commerce.productAdjective,
  'Commerce - productMaterial' : faker.commerce.productMaterial,
  'Commerce - product' : faker.commerce.product,
  'Commerce - productDescription' : faker.commerce.productDescription,
  'Company - suffixes' : faker.company.suffixes,
  'Company - companyName' : faker.company.companyName,
  'Company - companySuffix' : faker.company.companySuffix,
  'Company - catchPhrase' : faker.company.catchPhrase,
  'Company - bs' : faker.company.bs,
  'Company - catchPhraseAdjective' : faker.company.catchPhraseAdjective,
  'Company - catchPhraseDescriptor' : faker.company.catchPhraseDescriptor,
  'Company - catchPhraseNoun' : faker.company.catchPhraseNoun,
  'Company - bsAdjective' : faker.company.bsAdjective,
  'Company - bsBuzz' : faker.company.bsBuzz,
  'Company - bsNoun' : faker.company.bsNoun,
  'Database - column' : faker.database.column,
  'Database - type' : faker.database.type,
  'Database - collation' : faker.database.collation,
  'Database - engine' : faker.database.engine,
  'Date - past' : faker.date.past,
  'Date - future' : faker.date.future,
  'Date - between' : faker.date.between,
  'Date - recent' : faker.date.recent,
  'Date - soon' : faker.date.soon,
  'Date - month' : faker.date.month,
  'Date - weekday' : faker.date.weekday,
  'Finance - account' : faker.finance.account,
  'Finance - accountName' : faker.finance.accountName,
  'Finance - routingNumber' : faker.finance.routingNumber,
  'Finance - mask' : faker.finance.mask,
  'Finance - amount' : faker.finance.amount,
  'Finance - transactionType' : faker.finance.transactionType,
  'Finance - currencyCode' : faker.finance.currencyCode,
  'Finance - currencyName' : faker.finance.currencyName,
  'Finance - currencySymbol' : faker.finance.currencySymbol,
  'Finance - bitcoinAddress' : faker.finance.bitcoinAddress,
  'Finance - litecoinAddress' : faker.finance.litecoinAddress,
  'Finance - creditCardNumber' : faker.finance.creditCardNumber,
  'Finance - creditCardCVV' : faker.finance.creditCardCVV,
  'Finance - ethereumAddress' : faker.finance.ethereumAddress,
  'Finance - iban' : faker.finance.iban,
  'Finance - bic' : faker.finance.bic,
  'Finance - transactionDescription' : faker.finance.transactionDescription,
  'Git - branch' : faker.git.branch,
  'Git - commitEntry' : faker.git.commitEntry,
  'Git - commitMessage' : faker.git.commitMessage,
  'Git - commitSha' : faker.git.commitSha,
  'Git - shortSha' : faker.git.shortSha,
  'Hacker - abbreviation' : faker.hacker.abbreviation,
  'Hacker - adjective' : faker.hacker.adjective,
  'Hacker - noun' : faker.hacker.noun,
  'Hacker - verb' : faker.hacker.verb,
  'Hacker - ingverb' : faker.hacker.ingverb,
  'Hacker - phrase' : faker.hacker.phrase,
  'Helpers - randomize' : faker.helpers.randomize,
  'Helpers - slugify' : faker.helpers.slugify,
  'Helpers - replaceSymbolWithNumber' : faker.helpers.replaceSymbolWithNumber,
  'Helpers - replaceSymbols' : faker.helpers.replaceSymbols,
  'Helpers - replaceCreditCardSymbols' : faker.helpers.replaceCreditCardSymbols,
  'Helpers - repeatString' : faker.helpers.repeatString,
  'Helpers - regexpStyleStringParse' : faker.helpers.regexpStyleStringParse,
  'Helpers - shuffle' : faker.helpers.shuffle,
  'Helpers - mustache' : faker.helpers.mustache,
  'Helpers - createCard' : faker.helpers.createCard,
  'Helpers - contextualCard' : faker.helpers.contextualCard,
  'Helpers - userCard' : faker.helpers.userCard,
  'Helpers - createTransaction' : faker.helpers.createTransaction,
  'Image - image' : faker.image.image,
  'Image - avatar' : faker.image.avatar,
  'Image - imageUrl' : faker.image.imageUrl,
  'Image - abstract' : faker.image.abstract,
  'Image - animals' : faker.image.animals,
  'Image - business' : faker.image.business,
  'Image - cats' : faker.image.cats,
  'Image - city' : faker.image.city,
  'Image - food' : faker.image.food,
  'Image - nightlife' : faker.image.nightlife,
  'Image - fashion' : faker.image.fashion,
  'Image - people' : faker.image.people,
  'Image - nature' : faker.image.nature,
  'Image - sports' : faker.image.sports,
  'Image - technics' : faker.image.technics,
  'Image - transport' : faker.image.transport,
  'Image - dataUri' : faker.image.dataUri,
  'Image - lorempixel' : faker.image.lorempixel,
  'Image - unsplash' : faker.image.unsplash,
  'Image - lorempicsum' : faker.image.lorempicsum,
  'Internet - avatar' : faker.internet.avatar,
  'Internet - email' : faker.internet.email,
  'Internet - exampleEmail' : faker.internet.exampleEmail,
  'Internet - userName' : faker.internet.userName,
  'Internet - protocol' : faker.internet.protocol,
  'Internet - url' : faker.internet.url,
  'Internet - domainName' : faker.internet.domainName,
  'Internet - domainSuffix' : faker.internet.domainSuffix,
  'Internet - domainWord' : faker.internet.domainWord,
  'Internet - ip' : faker.internet.ip,
  'Internet - ipv6' : faker.internet.ipv6,
  'Internet - userAgent' : faker.internet.userAgent,
  'Internet - color' : faker.internet.color,
  'Internet - mac' : faker.internet.mac,
  'Internet - password' : faker.internet.password,
  'Lorem - word' : faker.lorem.word,
  'Lorem - words' : faker.lorem.words,
  'Lorem - sentence' : faker.lorem.sentence,
  'Lorem - slug' : faker.lorem.slug,
  'Lorem - sentences' : faker.lorem.sentences,
  'Lorem - paragraph' : faker.lorem.paragraph,
  'Lorem - paragraphs' : faker.lorem.paragraphs,
  'Lorem - text' : faker.lorem.text,
  'Lorem - lines' : faker.lorem.lines,
  'Name - firstName' : faker.name.firstName,
  'Name - lastName' : faker.name.lastName,
  'Name - findName' : faker.name.findName,
  'Name - jobTitle' : faker.name.jobTitle,
  'Name - gender' : faker.name.gender,
  'Name - prefix' : faker.name.prefix,
  'Name - suffix' : faker.name.suffix,
  'Name - title' : faker.name.title,
  'Name - jobDescriptor' : faker.name.jobDescriptor,
  'Name - jobArea' : faker.name.jobArea,
  'Name - jobType' : faker.name.jobType,
  'Phone - phoneNumber' : faker.phone.phoneNumber,
  'Phone - phoneNumberFormat' : faker.phone.phoneNumberFormat,
  'Phone - phoneFormats' : faker.phone.phoneFormats,
  'Random - number' : faker.random.number,
  'Random - float' : faker.random.float,
  'Random - arrayElement' : faker.random.arrayElement,
  'Random - arrayElements' : faker.random.arrayElements,
  'Random - objectElement' : faker.random.objectElement,
  'Random - uuid' : faker.random.uuid,
  'Random - boolean' : faker.random.boolean,
  'Random - word' : faker.random.word,
  'Random - words' : faker.random.words,
  'Random - image' : faker.random.image,
  'Random - locale' : faker.random.locale,
  'Random - alpha' : faker.random.alpha,
  'Random - alphaNumeric' : faker.random.alphaNumeric,
  'Random - hexaDecimal' : faker.random.hexaDecimal,
  'System - fileName' : faker.system.fileName,
  'System - commonFileName' : faker.system.commonFileName,
  'System - mimeType' : faker.system.mimeType,
  'System - commonFileType' : faker.system.commonFileType,
  'System - commonFileExt' : faker.system.commonFileExt,
  'System - fileType' : faker.system.fileType,
  'System - fileExt' : faker.system.fileExt,
  'System - directoryPath' : faker.system.directoryPath,
  'System - filePath' : faker.system.filePath,
  'System - semver' : faker.system.semver,
  'Time - recent' : faker.time.recent,
  'Vehicle - vehicle' : faker.vehicle.vehicle,
  'Vehicle - manufacturer' : faker.vehicle.manufacturer,
  'Vehicle - model' : faker.vehicle.model,
  'Vehicle - type' : faker.vehicle.type,
  'Vehicle - fuel' : faker.vehicle.fuel,
  'Vehicle - vin' : faker.vehicle.vin,
  'Vehicle - color' : faker.vehicle.color,
};

// Create category types for non-faker (random) data types
interface Types {
  unique : any;
  repeating : object;
}
const types : Types = {
  unique : {},
  repeating : {},
};

// Closure function that contains all functionality for creating unique strings
types.unique.str = (data : any, scale : number) => {
  let chars : string = '';
  const unique : Array<string> = [];
  const lockedIndexes : Array<number> = [];
  // if character types are 'true', append them to the character list
  if (data.inclAlphaLow) chars  += 'abcdefghijklmnopqrstuvwxyz';
  if (data.inclAlphaUp) chars  += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (data.inclNum) chars  += '0123456789';
  if (data.inclSpaces) chars += ' ';
  if (data.inclSpecChar) chars += ',.?;:!@#$%^&*';
  // if none were true or is only inclSpaces was true, a series of unique values will not be possible.
    // if this is the case, set chars to include all letters - lower and upper
  if (chars.length <= 1) chars  += 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  // ensure that the minimum length can accommodate unique values to the length of the scale
  let min : number = 1;
  while (chars.length ** min < scale) min += 1;
  // create minimum unique keys in sequence for quick retrieval when creating record
  // stop once scale is reached
  (function buildUnique (str : string) {
    if (str.length === min) {
      unique.push(str);
      return;
    }
    for (let i : number = 0; i < chars.length; i += 1) {
      if (unique.length === scale) return;
      buildUnique(str + chars[i]);
    }
  })('');
  // handle INCLUDE values : values the user requires to exist
  // find the first chars up to the index of min (prefix) then search the unique array for that prefix.
  // if it exist, replace it with the full string.
  // if not, find a random index and insert the full string there.
  // Keep track of the indexes already use to avoid overwriting something we need to save (lockedIndex on output)
  if (data.include > scale) console.log(`ERROR: Entries in 'Include' exceed the scale of the table, some values will not be represented.` )
  data.include.sort();
  for (let i = 0; i < data.include.length && i < scale; i += 1) {
    let prefix : string = ''; 
    for (let k : number = 0; k < min && k < data.include[i].length; k += 1) prefix += data.include[i][k];
    let index : number = unique.indexOf(prefix);
    while (lockedIndexes.includes(index) || index === -1) {
      index = Math.floor(Math.random() * Math.floor(scale));
    }
    lockedIndexes.push(index);
    unique[index] = data.include[i];
  }
  lockedIndexes.sort();

  // CLOSURE : function to be called on each record

  return function (i) {
    // initalize the output string with the unique prefix associated with that record (i)
    let output : string = unique[i];
    // if the value has already be set from INCLUDES, do not append random digits.
    if (lockedIndexes.includes(i)) return output;
    // create a random string length between the user specified min/max bounds.
      // account for the space already taken by the prefix
    const strLen : number = Math.round(Math.random() * (data.length[1] - data.length[0])) + data.length[0];
    for (let k = unique[i].length; k < strLen; k += 1) {
      output += chars[Math.floor(Math.random() * Math.floor(chars.length))]
    }
    return output;
  };
};

types.unique.num = (data : any, scale : number) => {
  return (index) => {if (data.serial) return index};
};

// REPEATING DATA TYPE - STILL NEEDED
// types.repeating.loop = (data : object, scale : number) => {};
// types.repeating.weighted = (data : object, scale : number) => {};
// types.repeating.counted = (data : object, scale : number) => {};

/* ===================== END OF DATA TYPE FUNCTIONS ===================== */


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
  values.forEach(e => queryArray.push(`INSERT INTO "${form.schema}"."${form.table}"(${cols}) VALUES ${e}; `));
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
//   schema : 'schema1',
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
//         length : [10, 15],
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
