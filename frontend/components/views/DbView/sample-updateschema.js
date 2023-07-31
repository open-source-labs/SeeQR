const updateSchema = {
  database: 'starwars',
  updates: {
    addTables: [
      {
        is_insertable_into: 'YES',
        table_catalog: 'starwars',
        table_name: 'people',
        table_schema: 'public',
      },
      {
        is_insertable_into: 'YES',
        table_catalog: 'starwars',
        table_name: 'people_in_films',
        table_schema: 'public',
      },
      {
        is_insertable_into: 'YES',
        table_catalog: 'starwars',
        table_name: 'testdrop',
        table_schema: 'public',
      },
    ],
    dropTables: [
      {
        table_name: 'testdrop',
        table_schema: 'public',
      },
    ],
    alterTables: [
      {
        is_insertable_into: 'YES',
        table_catalog: 'starwars',
        table_name: 'people',
        new_table_name: 'people_new',
        table_schema: 'public',
        addColumns: [
          {
            column_name: 'mass',
            data_type: 'SERIAL',
          },
        ],
        dropColumns: [
        ],
        alterColumns: [
          {
            character_maximum_length: 20,
            column_name: 'mass',
            new_column_name: 'mass_new',
            add_constraint: [
              {
                constraint_type: 'PRIMARY KEY',
                constraint_name: 'pk2',
                foreign_table: null,
                foreign_column: null,
              },
            ],
            data_type: null,
            is_nullable: 'NO',
            drop_constraint: [],
          },
        ],
      },
      {
        is_insertable_into: 'YES',
        table_catalog: 'starwars',
        table_name: 'people_in_films',
        new_table_name: 'people_in_starwars',
        table_schema: 'public',
        addColumns: [
          {
            column_name: 'id',
            data_type: 'SERIAL',
          },
          {
            column_name: 'person_name',
            data_type: 'INTEGER',
          },
          {
            column_name: 'name1',
            data_type: 'VARCHAR',
          },
        ],
        dropColumns: [
          {
            column_name: 'name1',
          },
        ],
        alterColumns: [
          {
            character_maximum_length: 20,
            column_name: 'id',
            new_column_name: 'id_new',
            add_constraint: [
              {
                constraint_type: 'PRIMARY KEY',
                constraint_name: 'pk',
                foreign_table: null,
                foreign_column: null,
              },
              {
                constraint_type: 'UNIQUE',
                constraint_name: 'unique_1',
                foreign_table: null,
                foreign_column: null,
              },
            ],
            data_type: null,
            is_nullable: 'NO',
            drop_constraint: [],
          },
          {
            character_maximum_length: 20,
            column_name: 'person_name',
            constraint_name: 'mass_fk0',
            new_column_name: 'person_new_name',
            add_constraint: [
              {
                constraint_type: 'FOREIGN KEY',
                constraint_name: 'fk000',
                foreign_table: 'people',
                foreign_column: 'mass',
                unique: null,
              },
            ],
            data_type: null,
            is_nullable: 'YES',
            drop_constraint: [],
          },
        ],
      },
    ],
  },
};

export default updateSchema;
