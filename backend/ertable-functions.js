function backendObjToQuery(backendObj) {
  const outputArray = [];
  const dbName = backendObj.database;
  const columnsNames = {};
  const tablesNames = {};
  function addTable(addTableArray) {
    for (let i = 0; i < addTableArray.length; i += 1) {
      const currTable = addTableArray[i];
      outputArray.push(
        `CREATE TABLE ${currTable.table_schema}.${currTable.table_name}(); `
      );
    }
  }

  function dropTable(dropTableArray) {
    for (let i = 0; i < dropTableArray.length; i += 1) {
      const currTable = dropTableArray[i];
      outputArray.push(
        `DROP TABLE ${currTable.table_schema}.${currTable.table_name}; `
      );
    }
  }

  function alterTable(alterTableArray) {
    function addColumn(currTable) {
      let addColumnString = '';
      if (currTable.addColumns.length) {
        for (let i = 0; i < currTable.addColumns.length; i += 1) {
          addColumnString += `ALTER TABLE ${currTable.table_schema}.${currTable.table_name} ADD COLUMN ${currTable.addColumns[i].column_name} ${currTable.addColumns[i].data_type}; `;
        }
      }
      return addColumnString;
    }

    function dropColumn(currTable) {
      let dropColumnString = '';
      if (currTable.dropColumns.length) {
        for (let i = 0; i < currTable.dropColumns.length; i += 1) {
          dropColumnString += `ALTER TABLE ${currTable.table_schema}.${currTable.table_name} DROP COLUMN ${currTable.dropColumns[i].column_name}; `;
        }
      }
      return dropColumnString;
    }

    function alterTableConstraint(currTable) {
      let alterTableConstraintString = '';

      function addPrimaryKey(currConstraint, currColumn) {
        alterTableConstraintString += `ALTER TABLE ${currTable.table_schema}.${currTable.table_name} ADD CONSTRAINT ${currConstraint.constraint_name} PRIMARY KEY (${currColumn.column_name}); `;
      }

      function addForeignKey(currConstraint, currColumn) {
        alterTableConstraintString += `ALTER TABLE ${currTable.table_schema}.${currTable.table_name} ADD CONSTRAINT ${currConstraint.constraint_name} FOREIGN KEY ("${currColumn.column_name}") REFERENCES ${currConstraint.foreign_table}(${currConstraint.foreign_column}); `;
      }

      function addUnique(currConstraint, currColumn) {
        alterTableConstraintString += `ALTER TABLE ${currTable.table_schema}.${currTable.table_name} ADD CONSTRAINT ${currConstraint.constraint_name} UNIQUE (${currColumn.column_name}); `;
      }

      function dropConstraint(currDrop) {
        alterTableConstraintString += `ALTER TABLE ${currTable.table_schema}.${currTable.table_name} DROP CONSTRAINT ${currDrop}; `;
      }

      for (let i = 0; i < currTable.alterColumns.length; i += 1) {
        const currColumn = currTable.alterColumns[i];
        for (let j = 0; j < currColumn.add_constraint.length; j += 1) {
          const currConstraint = currColumn.add_constraint[j];
          if (currConstraint.constraint_type === 'PRIMARY KEY') {
            addPrimaryKey(currConstraint, currColumn);
          } else if (currConstraint.constraint_type === 'FOREIGN KEY') {
            addForeignKey(currConstraint, currColumn);
          } else if (currConstraint.constraint_type === 'UNIQUE') {
            addUnique(currConstraint, currColumn);
          }
        }
        for (let j = 0; j < currColumn.drop_constraint.length; j += 1) {
          const currDrop = currColumn.drop_constraint[j];
          dropConstraint(currDrop);
        }
      }
      return alterTableConstraintString;
    }

    function alterNotNullConstraint(currTable) {
      let notNullConstraintString = '';
      for (let i = 0; i < currTable.alterColumns.length; i += 1) {
        if (currTable.alterColumns[i].is_nullable === 'NO') {
          notNullConstraintString += `ALTER TABLE ${currTable.table_schema}.${currTable.table_name} ALTER COLUMN ${currTable.alterColumns[i].column_name} SET NOT NULL; `;
        }
        if (currTable.alterColumns[i].is_nullable === 'YES') {
          notNullConstraintString += `ALTER TABLE ${currTable.table_schema}.${currTable.table_name} ALTER COLUMN ${currTable.alterColumns[i].column_name} DROP NOT NULL; `;
        }
      }
      return notNullConstraintString;
    }

    function alterType(currTable) {
      let alterTypeString = '';
      for (let i = 0; i < currTable.alterColumns.length; i += 1) {
        if (currTable.alterColumns[i].data_type !== null) {
          if (currTable.alterColumns[i].data_type === 'date') {
            alterTypeString += `ALTER TABLE ${currTable.table_schema}.${currTable.table_name} ALTER COLUMN ${currTable.alterColumns[i].column_name} TYPE date USING ${currTable.alterColumns[i].column_name}::text::date; `;
          } else {
            alterTypeString += `ALTER TABLE ${currTable.table_schema}.${currTable.table_name} ALTER COLUMN ${currTable.alterColumns[i].column_name} TYPE ${currTable.alterColumns[i].data_type} USING ${currTable.alterColumns[i].column_name}::${currTable.alterColumns[i].data_type}; `;
          }
        }
      }
      return alterTypeString;
    }

    for (let i = 0; i < alterTableArray.length; i += 1) {
      const currTable = alterTableArray[i];
      outputArray.push(
        `${addColumn(currTable)}${dropColumn(currTable)}${alterTableConstraint(
          currTable
        )}${alterNotNullConstraint(currTable)}${alterType(currTable)}`
      );
    }
  }

  function renameTablesColumns(renameTableArray) {
    let renameString = '';

    function renameTable(currTable) {
      if (currTable.new_table_name) {
        tablesNames[currTable.table_name] = {
          table_name: currTable.table_name,
          table_schema: currTable.table_schema,
          new_table_name: currTable.new_table_name
        }
      }
    }

    function renameColumn(currTable) {
      for (let i = 0; i < currTable.alterColumns.length; i++) {
        const currAlterColumn = currTable.alterColumns[i];
        // populates an array of objects with all of the new column names
        if (currAlterColumn.new_column_name) {
          columnsNames[currAlterColumn.column_name] = {
            column_name: currAlterColumn.column_name,
            table_name: currTable.table_name,
            table_schema: currTable.table_schema,
            new_column_name: currAlterColumn.new_column_name
          }
        }
      }
    }
    for (let i = 0; i < renameTableArray.length; i++) {
      const currTable = renameTableArray[i];
      renameColumn(currTable);
      renameTable(currTable);
    }

    const columnsToRename = Object.keys(columnsNames)
    for (let i = 0; i < columnsToRename.length; i++) {
      const currColumn = columnsNames[columnsToRename[i]]
      // only renames a column with the most recent name that was saved
      renameString += `ALTER TABLE ${currColumn.table_schema}.${currColumn.table_name} RENAME COLUMN ${currColumn.column_name} TO ${currColumn.new_column_name}; `;
    }

    const tablesToRename = Object.keys(tablesNames)
    for (let i = 0; i < tablesToRename.length; i++) {
      const currTable = tablesNames[tablesToRename[i]]
      console.log(currTable)
      // only renames a table with the most recent name that was saved
      renameString += `ALTER TABLE ${currTable.table_schema}.${currTable.table_name} RENAME TO ${currTable.new_table_name}; `;
    }

    outputArray.push(renameString);
  }

  addTable(backendObj.updates.addTables);

  dropTable(backendObj.updates.dropTables);
  alterTable(backendObj.updates.alterTables);
  renameTablesColumns(backendObj.updates.alterTables);
  return outputArray.join('');
}

export default backendObjToQuery;
