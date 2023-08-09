// MASTER TYPE FOR ERD OBJECT
export type ErdObjType = {
  dbName: string; // maybe this can go to dbState (save for later)
  updates: UpdatesObjType;
};

export type UpdatesObjType = {
  addTables: AddTablesObjType[];
  dropTables: DropTablesObjType[];
  alterTables: AlterTablesObjType[];
};

// ADD
export type AddTablesObjType = {
  is_insertable_into: 'yes' | 'no';
  table_catalog: string;
  table_name: string;
  table_schema: string; // what is this ?
  columns: ERTableColumnData[];
  ericTestUnitTables?: any;
  col_N?: any;
  col_T?: any;
  col_L?: any;
};

export interface ERTableColumnData extends TableColumn {
  new_column_name: string | null;
  constraint_name: string | null;
  constraint_type: string | null;
  foreign_column: string;
  foreign_table: string;
  unique?: boolean; // optional until implemented
  auto_increment?: boolean; // optional until implemented
}

// DROP
export type DropTablesObjType = {
  table_name: string;
  table_schema: string;
};

// ALTER
export type AlterTablesObjType = {
  is_insertable_into: 'yes' | 'no' | null;
  table_catalog: string | null;
  table_name: string;
  new_table_name: string | null;
  table_schema: string | null;
  addColumns: AddColumnsObjType[];
  dropColumns: DropColumnsObjType[];
  alterColumns: AlterColumnsObjType[];
};

export type AddColumnsObjType = {
  column_name: string | null;
  data_type: DataTypes;
  character_maximum_length: number | null;
};
export type DropColumnsObjType = {
  column_name: string;
};
export type AlterColumnsObjType = {
  column_name: string;
  character_maximum_length: number | null;
  new_column_name: string | null;
  add_constraint: AddConstraintObjType[];
  current_data_type: string | null;
  data_type: string | null;
  is_nullable: 'YES' | 'NO' | null;
  drop_constraint: string[];
  rename_constraint: string | null;
  table_schema: string | null;
  table_name: string | null;
  constraint_type: 'PRIMARY KEY' | 'FOREIGN KEY' | 'UNIQUE' | null;
};

export type AddConstraintObjType = {
  constraint_type: 'PRIMARY KEY' | 'FOREIGN KEY' | 'UNIQUE' | null;
  constraint_name: string;
  foreign_table: string | null;
  foreign_column: string | null;
};

/*
const backendObj = {
    database: 'tester2',
    updates: {
     addTables: [
      {
       is_insertable_into: 'yes',
       table_name: 'NewTable8',
       table_schema: 'puclic',
       table_catalog: 'tester2',
       columns: []
      }
     ],
     
     dropTables: [{
      table_name: 'newtable5',
      table_schema: 'puclic'
      }
     ],

     alterTables: [
      {
        is_insertable_into: null,
        table_catalog: 'tester2',
        table_name: 'newtable7',
        new_table_name: null,
        table_schema: 'puclic',
        addColumns: [Array],
        dropColumns: [],
        alterColumns: []
      },
      {
        is_insertable_into: null,
        table_catalog: 'tester2',
        table_name: 'newtable7',
        new_table_name: null,
        table_schema: 'puclic',
        addColumns: [Array],
        dropColumns: [],
        alterColumns: []
      }]
    }
}
*/
