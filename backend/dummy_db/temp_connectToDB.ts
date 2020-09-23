// Temporary Hardcoded database scaling
// To test this code:
// 1. Copy and paste this code into the bottom of main.ts
// 2. Create a button on the frontend that activates the route 'generate-data'
// 3. Test the button out out on the defaultDB tab, should only work in that tab because 'defaultDB' is hardcoded below

/*=== SAMPLE OBJECT TO BE SENT FROM USER INTERFACE TO DATA GENERATOR ===*/
const fromApp = {
  schema: 'public', //used to be schema1
  table: 'table1',
  scale: 40,
  columns: [
    {
      name: '_id',
      dataCategory: 'unique', // random, repeating, unique, combo, foreign
      dataType: 'num',
      data: {
        serial: true,
      }
    },
    {
      name: 'username',
      dataCategory: 'unique', // random, repeating, unique, combo, foreign
      dataType: 'str',
      data: {
        length: [10, 15],
        inclAlphaLow: true,
        inclAlphaUp: true,
        inclNum: true,
        inclSpaces: true,
        inclSpecChar: true,
        include: ["include", "these", "aReplace"],
      },
    },
    {
      name: 'first_name',
      dataCategory: 'random', // random, repeating, unique, combo, foreign
      dataType: 'Name - firstName',
      data: {
      }
    },
    {
      name: 'company_name',
      dataCategory: 'random',
      dataType: 'Company - companyName',
      data: {
      }
    }
  ]
};


ipcMain.on('generate-data', (event, paramObj: any) => {
  // Generating Dummy Data from parameters sent from the frontend
  (function dummyFunc(paramsObj) { // paramsObj === fromApp
    // Need addDB in this context
    const addDB = (str: string, nextStep: any) => {
      exec(str, (error, stdout, stderr) => {
        if (error) {
          console.log(`error: ${error.message}`);
          return;
        }
        if (stderr) {
          console.log(`stderr: ${stderr}`);
          return;
        }
        // console.log(`stdout: ${stdout}`);
        console.log(`${stdout}`);
        if (nextStep) nextStep();
      });
    };
    const db_name: string = 'defaultDB';
    // This is based off of the fromApp hard coded object,
    // In theory this would be given to SeeQR from the user
    const schemaStr: string = `CREATE TABLE "table1"(
                                  "_id" integer NOT NULL,
                                  "username" VARCHAR(255) NOT NULL,
                                  "first_name" VARCHAR(255) NOT NULL,
                                  "company_name" VARCHAR(255) NOT NULL,
                                  CONSTRAINT "tabl1_pk" PRIMARY KEY ("_id")
                            ) WITH (
                              OIDS=FALSE
                            );`
    // This is where createInsertQuery function is invoked
    const insertArray: Array<string> = createInsertQuery(paramsObj);
    console.log(insertArray);
    // Important part !!!!
    // takes in an array of insert query strings: insertArray
    // this insertArray is the output of the createInsertQuery function from dataGenHandler.ts
    // db_name is whatever tab they're currently on
    // scemaStr is the hard coded table for the fromApp hard coded object 
    db.query(schemaStr) // this makes hard coded table in database
      .then((returnedData) => {
        // ====== BELOW IS MAIN FUNCTIONALITY FOR SUBMITTING DUMMY DATA TO THE DATABASE ======= AKA looping insert queries into the node child process
        // USE THIS ALONG WITH THE addDB(node childprocess) FUNCTION FOR FINAL PRODUCT
        // THE CODE FROM ABOVE IS FOR TESTING THIS WITHOUT THE INTERFACE
        for (let i = 0; i < insertArray.length; ++i) {
          console.log(i)
          let currentInsert = insertArray[i];
          const dummyScript: string = `docker exec postgres-1 psql -U postgres -d ${db_name} -c "${currentInsert}"`;
          addDB(dummyScript, () => console.log(`Dummied Database: ${db_name}`)) //using the Node childprocess to access postgres for each INSERT query in the insertArray
        }
      })
  })(fromApp);
});