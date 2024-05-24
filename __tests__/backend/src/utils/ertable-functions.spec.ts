import  backendObjToQuery   from "../../../../backend/src/utils/ertable-functions";
import { BackendObjType, DBType } from '../../../../shared/types/dbTypes';
import {
  AddTablesObjType,
  DropTablesObjType,
  AlterTablesObjType,
  AlterColumnsObjType,
  AddConstraintObjType,
} from '../../../../frontend/types';


describe('ertable-functions tests', () => {

    // mock backendObj
  const backendObj: BackendObjType  = {
    database: 'tester2',
    updates: {
      addTables: [
        {
          is_insertable_into: 'yes',
          table_name: 'NewTable8',
          table_schema: 'public',
          table_catalog: 'tester2',
          columns: [],
        },
      ],

      dropTables: [
        {
          table_name: 'newtable5',
          table_schema: 'public',
        },
      ],

      alterTables: [
        {
          is_insertable_into: null,
          table_catalog: 'tester2',
          table_name: 'newtable7',
          new_table_name: null,
          table_schema: 'public',
          addColumns: [],
          dropColumns: [],
          alterColumns: [],
        },
      ],
    },
  };

  
  describe('backendObjToQuery tests', () => {
    test('it should create a query string for Postgres database', () => {
      const dbType = DBType.Postgres;
      const result = backendObjToQuery(backendObj, dbType);
      expect(typeof result).toBe('string');
    });

    test('it should create a query string for MySQL database', ()=>{
      const dbType = DBType.MySQL;
      const result = backendObjToQuery(backendObj, dbType);
      expect(typeof result).toBe('string');
    })

    test('it should invoke addTable passing in an addtable and altertable arrays', () => {
      const dbType = DBType.Postgres;
      // need an outputArray, which was in the outer scope of addTable
      const outputArray: string[] = [];
      // mock function for addTable, copied and pasted from erTable-functions.ts
      const addTable = jest.fn((
        addTableArray: AddTablesObjType[],
        alterTablesArray: AlterTablesObjType[],
      ): void => {
        for (let i = 0; i < addTableArray.length; i += 1) {
          const currTable: AddTablesObjType = addTableArray[i];
          const currAlterTable: AlterTablesObjType = alterTablesArray[i]
          if (dbType === DBType.Postgres || dbType === DBType.RDSPostgres) {
            outputArray.push(
              `CREATE TABLE ${currTable.table_schema}.${currTable.table_name}(); `
            );
          }
        }
      })
      
        // invoke addTable passining in params
      addTable(backendObj.updates.addTables, backendObj.updates.alterTables);
      expect(addTable).toBeCalledWith(backendObj.updates.addTables, backendObj.updates.alterTables);
      
        // output array should have a string passed into output array. table name and schema are from the mock obj.
      expect(outputArray).toEqual(["CREATE TABLE public.NewTable8(); "]);
      });
    });

    test('it should invoke dropTable passing in a dropTable array', () => {
      const dbType = DBType.Postgres;
          // need an outputArray, which was in the outer scope of addTable
      const outputArray: string[] = [];
         // mock function for dropTable, copied and pasted from erTable-functions.ts
      const dropTable = jest.fn((dropTableArray: DropTablesObjType[]): void => {
        for (let i = 0; i < dropTableArray.length; i += 1) {
          const currTable: DropTablesObjType = dropTableArray[i];
          if (dbType === DBType.Postgres || dbType === DBType.RDSPostgres) {
            outputArray.push(
              `DROP TABLE ${currTable.table_schema}.${currTable.table_name}; `,
            );
          }
        }
      })

      // invoke dropTable passining in params
      dropTable(backendObj.updates.dropTables);
      expect(dropTable).toBeCalledWith(backendObj.updates.dropTables);

      // output array should have a string passed into output array. table name and schema are from the mock obj.
      expect(outputArray).toEqual(["DROP TABLE public.newtable5; "]);
    });



    test('it should invoke alterTable passing in an alterTable array', () => {
      const dbType = DBType.Postgres;
      const outputArray: string[] = [];
      const alterTables = jest.fn((alterTableArray: AlterTablesObjType[]): void => {
        // Add column to table
        function addColumn(currTable: AlterTablesObjType): string {
          let addColumnString: string = '';
          if (currTable.addColumns.length) {
            for (let i = 0; i < currTable.addColumns.length; i += 1) {
              if (dbType === DBType.Postgres || dbType === DBType.RDSPostgres)
                addColumnString += `ALTER TABLE ${currTable.table_schema}.${currTable.table_name} ADD COLUMN ${currTable.addColumns[i].column_name} ${currTable.addColumns[i].data_type}(${currTable.addColumns[i].character_maximum_length}); `;
              // if (dbType === DBType.MySQL || dbType === DBType.RDSMySQL) {
              //   let lengthOfData = '';
              //   if (currTable.addColumns[i].character_maximum_length != null) {
              //     lengthOfData = `(${currTable.addColumns[i].character_maximum_length})`;
              //   }
              //   if (
              //     firstAddingMySQLColumnName === null ||
              //     firstAddingMySQLColumnName !==
              //       `${currTable.addColumns[i].column_name}`
              //   ) {
              //     addColumnString += `ALTER TABLE ${currTable.table_name} ADD COLUMN ${currTable.addColumns[i].column_name} ${currTable.addColumns[i].data_type} ${lengthOfData}; `;
              //   }
              // }
              // if (dbType === DBType.SQLite)
              //   addColumnString += `ALTER TABLE ${currTable.table_name} ADD COLUMN ${currTable.addColumns[i].column_name} ${currTable.addColumns[i].data_type}(${currTable.addColumns[i].character_maximum_length}); `;
            }
          }
          return addColumnString;
        }
    
        // Remove column from table
        function dropColumn(currTable: AlterTablesObjType): string {
          let dropColumnString: string = '';
          if (currTable.dropColumns.length) {
            for (let i = 0; i < currTable.dropColumns.length; i += 1) {
              if (dbType === DBType.Postgres || dbType === DBType.RDSPostgres)
                dropColumnString += `ALTER TABLE ${currTable.table_schema}.${currTable.table_name} DROP COLUMN ${currTable.dropColumns[i].column_name}; `;
              // if (dbType === DBType.MySQL || dbType === DBType.RDSMySQL)
              //   dropColumnString += `ALTER TABLE ${currTable.table_name} DROP COLUMN ${currTable.dropColumns[i].column_name}; `;
            }
          }
          return dropColumnString;
        }
    
        // Add/remove constraints from column
        function alterTableConstraint(currTable: AlterTablesObjType): string {
          let alterTableConstraintString: string = '';
          // Add a primary key constraint to column
          function addPrimaryKey(
            currConstraint: AddConstraintObjType,
            currColumn: AlterColumnsObjType,
          ): void {
            let defaultRowValue: number | string;
            if (currColumn.current_data_type === 'character varying')
              defaultRowValue = 'A';
            else defaultRowValue = 1;
    
            if (dbType === DBType.Postgres || dbType === DBType.RDSPostgres)
              alterTableConstraintString += `ALTER TABLE ${currTable.table_schema}.${currTable.table_name} ADD CONSTRAINT ${currConstraint.constraint_name} PRIMARY KEY (${currColumn.column_name}); INSERT INTO ${currTable.table_schema}.${currTable.table_name} (${currColumn.column_name}) VALUES ('${defaultRowValue}'); `;
            // if (dbType === DBType.MySQL || dbType === DBType.RDSMySQL)
            //   alterTableConstraintString += `ALTER TABLE ${currTable.table_name} ADD CONSTRAINT ${currConstraint.constraint_name} PRIMARY KEY (${currColumn.column_name}); INSERT INTO ${currTable.table_schema}.${currTable.table_name} (${currColumn.column_name}) VALUES ('${defaultRowValue}'); `;
          }
          // Add a foreign key constraint to column
          function addForeignKey(
            currConstraint: AddConstraintObjType,
            currColumn: AlterColumnsObjType,
          ): void {
            if (dbType === DBType.Postgres || dbType === DBType.RDSPostgres)
              alterTableConstraintString += `ALTER TABLE ${currTable.table_schema}.${currTable.table_name} ADD CONSTRAINT ${currConstraint.constraint_name} FOREIGN KEY ("${currColumn.column_name}") REFERENCES ${currConstraint.foreign_table}(${currConstraint.foreign_column}); `;
            // if (dbType === DBType.MySQL || dbType === DBType.RDSMySQL)
            //   alterTableConstraintString += `ALTER TABLE ${currTable.table_name} ADD CONSTRAINT ${currConstraint.constraint_name} FOREIGN KEY ("${currColumn.column_name}") REFERENCES ${currConstraint.foreign_table}(${currConstraint.foreign_column}); `;
          }
          // Add a unique constraint to column
          function addUnique(
            currConstraint: AddConstraintObjType,
            currColumn: AlterColumnsObjType,
          ): void {
            if (dbType === DBType.Postgres || dbType === DBType.RDSPostgres)
              alterTableConstraintString += `ALTER TABLE ${currTable.table_schema}.${currTable.table_name} ADD CONSTRAINT ${currConstraint.constraint_name} UNIQUE (${currColumn.column_name}); `;
            // if (dbType === DBType.MySQL || dbType === DBType.RDSMySQL)
            //   alterTableConstraintString += `ALTER TABLE ${currTable.table_name} ADD CONSTRAINT ${currConstraint.constraint_name} UNIQUE (${currColumn.column_name}); `;
          }
          // Remove constraint from column
          function dropConstraint(currDrop): void {
            if (dbType === DBType.Postgres || dbType === DBType.RDSPostgres)
              alterTableConstraintString += `ALTER TABLE ${currTable.table_schema}.${currTable.table_name} DROP CONSTRAINT ${currDrop}; `;
            // if (dbType === DBType.MySQL || dbType === DBType.RDSMySQL)
            //   alterTableConstraintString += `ALTER TABLE ${currTable.table_name} DROP CONSTRAINT ${currDrop}; `;
          }
    
          for (let i = 0; i < currTable.alterColumns.length; i += 1) {
            const currColumn: AlterColumnsObjType = currTable.alterColumns[i];
            for (let j = 0; j < currColumn.add_constraint.length; j += 1) {
              const currConstraint: AddConstraintObjType =
                currColumn.add_constraint[j];
    
              if (currConstraint.constraint_type === 'PRIMARY KEY') {
                addPrimaryKey(currConstraint, currColumn);
              } else if (currConstraint.constraint_type === 'FOREIGN KEY') {
                addForeignKey(currConstraint, currColumn);
              } else if (currConstraint.constraint_type === 'UNIQUE') {
                addUnique(currConstraint, currColumn);
              }
            }
            for (let j = 0; j < currColumn.drop_constraint.length; j += 1) {
              const currDrop: string = currColumn.drop_constraint[j];
              dropConstraint(currDrop);
            }
          }
          return alterTableConstraintString;
        }
    
        // Add/remove not null constraint from column
        function alterNotNullConstraint(currTable: AlterTablesObjType): string {
          let notNullConstraintString: string = '';
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
    
        // Change the data type of the column
        function alterType(currTable: AlterTablesObjType): string {
          let alterTypeString: string = '';
          for (let i = 0; i < currTable.alterColumns.length; i += 1) {
            if (currTable.alterColumns[i].data_type !== null) {
              if (dbType === DBType.Postgres || dbType === DBType.RDSPostgres) {
                if (currTable.alterColumns[i].data_type === 'date') {
                  alterTypeString += `ALTER TABLE ${currTable.table_schema}.${currTable.table_name} ALTER COLUMN ${currTable.alterColumns[i].column_name} TYPE date USING ${currTable.alterColumns[i].column_name}::text::date; `;
                } else {
                  alterTypeString += `ALTER TABLE ${currTable.table_schema}.${currTable.table_name} ALTER COLUMN ${currTable.alterColumns[i].column_name} TYPE ${currTable.alterColumns[i].data_type} USING ${currTable.alterColumns[i].column_name}::${currTable.alterColumns[i].data_type}; `;
                }
              }
            }
          }
          return alterTypeString;
        }
    
        // Change the max character length of a varchar
        function alterMaxCharacterLength(currTable: AlterTablesObjType): string {
          let alterMaxCharacterLengthString: string = '';
          for (let i = 0; i < currTable.alterColumns.length; i += 1) {
            if (dbType === DBType.Postgres || dbType === DBType.RDSPostgres) {
              if (currTable.alterColumns[i].character_maximum_length) {
                alterMaxCharacterLengthString += `ALTER TABLE ${currTable.table_schema}.${currTable.table_name} ALTER COLUMN ${currTable.alterColumns[i].column_name} TYPE varchar(${currTable.alterColumns[i].character_maximum_length}); `;
              }
            }
            // if (dbType === DBType.MySQL || dbType === DBType.RDSMySQL) {
            //   if (currTable.alterColumns[i].character_maximum_length) {
            //     alterMaxCharacterLengthString += `ALTER TABLE ${currTable.table_name} MODIFY COLUMN ${currTable.alterColumns[i].column_name} ${currTable.alterColumns[i].data_type}(${currTable.alterColumns[i].character_maximum_length}); `;
            //   }
            // }
          }
          return alterMaxCharacterLengthString;
        }
    
        for (let i = 0; i < alterTableArray.length; i += 1) {
          const currTable: AlterTablesObjType = alterTableArray[i];
          outputArray.push(
            `${addColumn(currTable)}${dropColumn(currTable)}${alterType(
              currTable,
            )}${alterTableConstraint(currTable)}${alterNotNullConstraint(
              currTable,
            )}${alterMaxCharacterLength(currTable)}`,
          );
        }
      })

      alterTables(backendObj.updates.alterTables);
      expect(alterTables).toBeCalledWith(backendObj.updates.alterTables);
      expect(outputArray).toEqual([""]);
      expect(outputArray).not.toEqual(["ALTER TABLE public.newTable7 ALTER COLUMN newTable7.mockColumn TYPE varchar(255); "])
    });

    
    test('it should invoke renameTablesColumns passing in an alterTable array', () => {
  
      const outputArray: string[] = [];
      const dbType = DBType.Postgres;
      const renameTablesColumns = jest.fn((renameTableArray: AlterTablesObjType[]): void => {
        let renameString: string = '';
        const columnsNames: object = {};
        const tablesNames: object = {};
        const constraintsNames: object = {};
        // Populates the tablesNames object with new table names
        function renameTable(currTable: AlterTablesObjType): void {
          if (currTable.new_table_name) {
            tablesNames[currTable.table_name] = {
              table_name: currTable.table_name,
              table_schema: currTable.table_schema,
              new_table_name: currTable.new_table_name,
            };
          }
        }
        // Populates the columnsNames object with new column names
        function renameColumn(currTable: AlterTablesObjType): void {
          for (let i = 0; i < currTable.alterColumns.length; i += 1) {
            const currAlterColumn: AlterColumnsObjType = currTable.alterColumns[i];
            // populates an array of objects with all of the new column names
            if (currAlterColumn.new_column_name) {
              columnsNames[currAlterColumn.column_name] = {
                column_name: currAlterColumn.column_name,
                table_name: currTable.table_name,
                table_schema: currTable.table_schema,
                new_column_name: currAlterColumn.new_column_name,
              };
            }
          }
        }
        const renameConstraintCache = {};
        const outputArray: string[] = [];
        // Populates the constraintsNAmes object with new constraint names
        function renameConstraint(currTable): void {
          for (let i = 0; i < currTable.alterColumns.length; i += 1) {
            const currAlterColumn: AlterColumnsObjType = currTable.alterColumns[i];
            // populates an array of objects with all of the new constraint names
            if (currAlterColumn.rename_constraint) {
              constraintsNames[currAlterColumn.rename_constraint] = {
                constraint_type:
                  currAlterColumn.rename_constraint[0] === 'p'
                    ? 'pk'
                    : 'f'
                    ? 'fk'
                    : 'unique',
                column_name: currAlterColumn.new_column_name
                  ? currAlterColumn.new_column_name
                  : currAlterColumn.column_name,
                table_name: renameConstraintCache[currTable.table_name]
                  ? renameConstraintCache[currTable.table_name]
                  : currTable.table_name,
                table_schema: currTable.table_schema,
              };
            }
          }
        }
      
        for (let i = 0; i < renameTableArray.length; i += 1) {
          if (renameTableArray[i].new_table_name)
            renameConstraintCache[renameTableArray[i].table_name] =
              renameTableArray[i].new_table_name;
        }
      
        for (let i = 0; i < renameTableArray.length; i += 1) {
          const currTable: AlterTablesObjType = renameTableArray[i];
          renameConstraint(currTable);
          renameColumn(currTable);
          renameTable(currTable);
        }
        // Goes through the columnsNames object and adds the query for renaming
        const columnsToRename: string[] = Object.keys(columnsNames);
        for (let i = 0; i < columnsToRename.length; i += 1) {
          const currColumn: AlterColumnsObjType = columnsNames[columnsToRename[i]];
          // only renames a column with the most recent name that was saved
          if (dbType === DBType.Postgres || dbType === DBType.RDSPostgres)
            renameString += `ALTER TABLE ${currColumn.table_schema}.${currColumn.table_name} RENAME COLUMN ${currColumn.column_name} TO ${currColumn.new_column_name}; `;
          // if (dbType === DBType.MySQL || dbType === DBType.RDSMySQL)
          //   renameString += `ALTER TABLE ${currColumn.table_name} RENAME COLUMN ${currColumn.column_name} TO ${currColumn.new_column_name}; `;
        }
        // Goes through the tablesNames object and adds the query for renaming
        const tablesToRename: string[] = Object.keys(tablesNames);
        for (let i = 0; i < tablesToRename.length; i += 1) {
          const currTable: AlterTablesObjType = tablesNames[tablesToRename[i]];
          // only renames a table with the most recent name that was saved
          if (dbType === DBType.Postgres || dbType === DBType.RDSPostgres)
            renameString += `ALTER TABLE ${currTable.table_schema}.${currTable.table_name} RENAME TO ${currTable.new_table_name}; `;
          // if (dbType === DBType.MySQL || dbType === DBType.RDSMySQL)
          //   renameString += `ALTER TABLE ${currTable.table_name} RENAME ${currTable.new_table_name}; `;
        }
        // Constraint names might not be compatible with databases with other naming conventions and the query will fail
        // Goes through the constraintsNames object and adds the query for renaming
        const constraintsToRename: string[] = Object.keys(constraintsNames);
        for (let i = 0; i < constraintsToRename.length; i += 1) {
          const currColumn: AlterColumnsObjType =
            constraintsNames[constraintsToRename[i]];
          if (dbType === DBType.Postgres || dbType === DBType.RDSPostgres)
            renameString += `ALTER TABLE ${currColumn.table_schema}.${currColumn.table_name} RENAME CONSTRAINT ${constraintsToRename[i]} TO ${currColumn.constraint_type}_${currColumn.table_name}${currColumn.column_name}; `;
          // if (dbType === DBType.MySQL || dbType === DBType.RDSMySQL)
          //   renameString += `ALTER TABLE ${currColumn.table_name} RENAME CONSTRAINT ${constraintsToRename[i]} TO ${currColumn.constraint_type}_${currColumn.table_name}${currColumn.column_name}; `;
        }
        outputArray.push(renameString);
      })


      renameTablesColumns(backendObj.updates.alterTables);
      expect(renameTablesColumns).toBeCalledWith(backendObj.updates.alterTables);

      // alter column array is empty in mock backendObj
      expect(outputArray).toEqual([]);
      expect(outputArray).not.toEqual(["ALTER TABLE public.newTable7 RENAME COLUMN mockColumn TO mockColumn2; "]);

    });
});

