interface Types {
  unique : any;
  repeating : object;
}

export const types : Types = {
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
    const strLen : number = Math.round(Math.random() * (data.maxLen - data.minLen)) + data.minLen;
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