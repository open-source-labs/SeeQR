const updateSchema =
{
  database: "starwars",
  updates: {
    addTables: [
      {
        is_insertable_into: "YES",
        table_catalog: "starwars",
        table_name: "people",
        table_schema: "public"
      },
      {
        is_insertable_into: "YES",
        table_catalog: "starwars",
        table_name: "people_in_films",
        table_schema: "public"
      },
      {
        is_insertable_into: "YES",
        table_catalog: "starwars",
        table_name: "testdrop",
        table_schema: "public"
      },
    ],
    dropTables: [
      {
        table_name: "testdrop",
        table_schema: "public"
      }
    ],
    alterTables: [ 
      {
        is_insertable_into: "YES",
        table_catalog: "starwars",
        table_name: "people",
        new_table_name: "people_new",
        table_schema: "public",
        addColumns: [
          {
            column_name: "mass",
            data_type: "SERIAL"
          },
        ],
        dropColumns: [
        ],
        alterColumns: [ 
          {
            character_maximum_length: 20,
            column_name: "mass",
            new_column_name: "mass_new",
            add_constraint: [
              {
                constraint_type: "PRIMARY KEY",
                constraint_name: "pk2",
                foreign_table: null,
                foreign_column: null,
              },
            ],
            data_type: null,
            is_nullable: "NO",
            drop_constraint: []
          },
        ],
      },
      {
        is_insertable_into: "YES",
        table_catalog: "starwars",
        table_name: "people_in_films",
        new_table_name: "people_in_starwars",
        table_schema: "public",
        addColumns: [
          {
            column_name: "id",
            data_type: "SERIAL"
          },
          {
            column_name: "person_name",
            data_type: "INTEGER"
          },
          {
            column_name: "name1",
            data_type: "VARCHAR"
          },
        ],
        dropColumns: [
          {
            column_name: "name1"
          },
        ],
        alterColumns: [ 
          {
            character_maximum_length: 20,
            column_name: "id",
            new_column_name: "id_new",
            add_constraint: [
              {
                constraint_type: "PRIMARY KEY",
                constraint_name: "pk",
                foreign_table: null,
                foreign_column: null,
              },
              {
                constraint_type: "UNIQUE",
                constraint_name: "unique_1",
                foreign_table: null,
                foreign_column: null,
              },
            ],
            data_type: null,
            is_nullable: "NO",
            drop_constraint: []
          },
          {
            character_maximum_length: 20,
            column_name: "person_name",
            constraint_name: "mass_fk0",
            new_column_name: "person_new_name",
            add_constraint: [
              {
              constraint_type: "FOREIGN KEY",
              constraint_name: "fk000",
              foreign_table: "people",
              foreign_column: "mass",
              unique: null,
              },
            ],
            data_type: null,
            is_nullable: "YES",
            drop_constraint: []
          },
        ],
      },
    ],
  }
}




function stateChangeToSchema (stateChangeObj) {
  const outputArray = [];
  const dbName = stateChangeObj.database;
  
  function addTable (addTableArray) {
    for (let i = 0; i < addTableArray.length; i++) {
      const currTable = addTableArray[i];
      outputArray.push(`CREATE TABLE ${currTable.table_schema}.${currTable.table_name}(); `)
    }
  };

  function dropTable (dropTableArray) {
    for (let i = 0; i < dropTableArray.length; i++) {
      const currTable = dropTableArray[i];
      outputArray.push(`DROP TABLE ${currTable.table_schema}.${currTable.table_name}; `)
    }
    // TODO: add conditional to check if there are primary or foreign keys; unless the related table is also being dropped, need to throw error
  };

  function alterTable (alterTableArray) {

    function addColumn (currTable) {
      let addColumnString = '';
      if (currTable.addColumns.length) {
      for (let i = 0; i < currTable.addColumns.length; i++) {
          addColumnString += `ALTER TABLE ${currTable.table_schema}.${currTable.table_name} ADD COLUMN ${currTable.addColumns[i].column_name} ${currTable.addColumns[i].data_type}; `
      }
     }
     return addColumnString;
    }

    function dropColumn (currTable) {
      let dropColumnString = '';
      if (currTable.dropColumns.length) {
        for (let i = 0; i < currTable.dropColumns.length; i++) {
          dropColumnString += `ALTER TABLE ${currTable.table_schema}.${currTable.table_name} DROP COLUMN ${currTable.dropColumns[i].column_name}; `
        }
      }
      return dropColumnString;
    }

    function alterTableConstraint (currTable) {
      let alterTableConstraintString = ''
      function addPrimaryKey (currConstraint, currColumn) {
        alterTableConstraintString += `ALTER TABLE ${currTable.table_schema}.${currTable.table_name} ADD CONSTRAINT ${currConstraint.constraint_name} PRIMARY KEY (${currColumn.column_name}); `;
      }
      function addForeignKey (currConstraint, currColumn) {
        alterTableConstraintString += `ALTER TABLE ${currTable.table_schema}.${currTable.table_name} ADD CONSTRAINT ${currConstraint.constraint_name} FOREIGN KEY ("${currColumn.column_name}") REFERENCES ${currConstraint.foreign_table}(${currConstraint.foreign_column}); `;
      }
      function addUnique (currConstraint, currColumn) {
        alterTableConstraintString += `ALTER TABLE ${currTable.table_schema}.${currTable.table_name} ADD CONSTRAINT ${currConstraint.constraint_name} UNIQUE (${currColumn.column_name}); `;
      }
      function dropConstraint (currDrop) {
        alterTableConstraintString += `ALTER TABLE ${currTable.table_schema}.${currTable.table_name} DROP CONSTRAINT, ${currDrop}; `;
      }
      for (let i = 0; i < currTable.alterColumns.length; i++) {
        const currColumn = currTable.alterColumns[i];
        for (let j = 0; j < currColumn.add_constraint.length; j++) {
          const currConstraint = currColumn.add_constraint[j];
          if (currConstraint.constraint_type === "PRIMARY KEY") {
            addPrimaryKey(currConstraint, currColumn);
          }
          else if (currConstraint.constraint_type === "FOREIGN KEY") {
            addForeignKey(currConstraint, currColumn);
          }
          else if (currConstraint.constraint_type === "UNIQUE") {
            addUnique(currConstraint, currColumn);
          }
        }
        for (let j = 0; j < currColumn.drop_constraint.length; j++) {
          const currDrop = currColumn.drop_constraint[j];
          console.log(currDrop)
          dropConstraint(currDrop);
        }
      }
      return alterTableConstraintString;
    }

    function alterNotNullConstraint (currTable) {
      let notNullConstraintString = '';
      for (let i = 0; i < currTable.alterColumns.length; i++) {
        if (currTable.alterColumns[i].is_nullable === 'NO') {
          notNullConstraintString += `ALTER TABLE ${currTable.table_schema}.${currTable.table_name} ALTER COLUMN ${currTable.alterColumns[i].column_name} SET NOT NULL; `
        }
        if (currTable.alterColumns[i].is_nullable === 'YES') {
          notNullConstraintString += `ALTER TABLE ${currTable.table_schema}.${currTable.table_name} ALTER COLUMN ${currTable.alterColumns[i].column_name} DROP NOT NULL; `
        }
      };
      return notNullConstraintString;
    }

    function alterType (currTable) {
      let alterTypeString = '';
      for (let i = 0; i < currTable.alterColumns.length; i++) {
        if (currTable.alterColumns[i].data_type !== null) {
          alterTypeString += `ALTER TABLE ${currTable.table_schema}.${currTable.table_name} ALTER COLUMN ${currTable.alterColumns[i].column_name} TYPE ${currTable.alterColumns[i].data_type}; `
        }
      };
      return alterTypeString;
    }
    
    for (let i = 0; i < alterTableArray.length; i++) {
      const currTable = alterTableArray[i];
      outputArray.push(`${addColumn(currTable)}${dropColumn(currTable)}${alterTableConstraint(currTable)}${alterNotNullConstraint(currTable)}${alterType(currTable)}`)
    }
  };

  function renameTablesColumns(renameTableArray) {
    let renameString = '';
    function renameTable (currTable) {
      if (currTable.new_table_name) {
        renameString+= `ALTER TABLE ${currTable.table_schema}.${currTable.table_name} RENAME TO ${currTable.new_table_name}; `;
      }
    }

    function renameColumn (currTable) {
      for (let i = 0; i < currTable.alterColumns.length; i++) {
        if (currTable.alterColumns[i].new_column_name) {
          renameString += `ALTER TABLE ${currTable.table_schema}.${currTable.table_name} RENAME COLUMN ${currTable.alterColumns[i].column_name} TO ${currTable.alterColumns[i].new_column_name}; `;
        }
      }
    }
    for (let i = 0; i < renameTableArray.length; i++) {
      const currTable = renameTableArray[i];
      renameColumn(currTable);
      renameTable(currTable);
    }
    outputArray.push(renameString);
  }

  addTable(stateChangeObj.updates.addTables);
  dropTable(stateChangeObj.updates.dropTables);
  alterTable(stateChangeObj.updates.alterTables);
  renameTablesColumns(stateChangeObj.updates.alterTables)
  return (outputArray.join(''))
}

console.log(stateChangeToSchema(updateSchema))
