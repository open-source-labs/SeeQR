import React from 'react';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import { Save } from '@mui/icons-material';
// import { } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import {
  AlterTablesObjType,
  AddColumnsObjType,
  DropTablesObjType,
  TableHeaderDataObjectType,
  AlterColumnsObjType,
  BackendObjType,
} from '../../../types';
import './styles.css';
import * as colors from '../../../style-variables';
import { sendFeedback } from '../../../lib/utils';

type TableFooterObjectType = {
  table_name: string;
  schemaStateCopy: any;
  setSchemaState: (string) => {};
  backendObj: BackendObjType;
};
type TableFooterProps = {
  data;
};

function TableFooter({ data }: TableFooterProps) {
  const { table_name, schemaStateCopy, setSchemaState, backendObj } = data;
  // find table we are editing in schemaStateCopy to use throughout all of our TableHeader functions
  const currentTable = schemaStateCopy.tableList.find(
    (table) => table.table_name === table_name,
  );
  // This function handles the add column button on the table
  const handleAddColumn = (): void => {
    // edit the schema table for this current table
    // create an alterTableObject with AlterTablesObjectType
    const alterTablesObj: AlterTablesObjType = {
      is_insertable_into: null,
      table_catalog: currentTable.table_catalog,
      table_name,
      new_table_name: null,
      table_schema: currentTable.table_schema,
      addColumns: [],
      dropColumns: [],
      alterColumns: [],
    };
    // create an addColumnsType object
    const addColumnsObj: AddColumnsObjType = {
      column_name: `NewColumn${currentTable.columns?.length + 1 || 1}`,
      data_type: 'varchar',
      character_maximum_length: 255,
    };
    // add the addColumnsObj to the alterTablesObj
    alterTablesObj.addColumns.push(addColumnsObj);
    // update the backendObj
    backendObj.current.updates.alterTables.push(alterTablesObj);
    // push a new object with blank properties
    currentTable.columns.push({
      column_name: `NewColumn${currentTable.columns?.length + 1 || 1}`,
      new_column_name: `NewColumn${currentTable.columns?.length + 1 || 1}`,
      constraint_name: null,
      constraint_type: null,
      data_type: 'varchar',
      character_maximum_length: 255,
      foreign_column: null,
      foreign_table: null,
      is_nullable: 'NO',
    });
    // set the state with the modified copy
    setSchemaState(schemaStateCopy);
  };

  // This function updates the table name when the user hits enter on the submit form
  // const handleChangeTableName = (): void => {
  //   const tableInputField = document.getElementById(
  //     `table-name-form-${data.table_name}`,
  //   ) as HTMLInputElement;

  //   console.log(tableInputField.value);

  //   // update backend
  //   const alterColumnsArray: AlterColumnsObjType[] = [];
  //   for (let j = 0; j < currentTable.columns.length; j += 1) {
  //     const alterColumnsObj: AlterColumnsObjType = {
  //       column_name: currentTable.columns[j].column_name,
  //       character_maximum_length: null,
  //       new_column_name: null,
  //       add_constraint: [],
  //       current_data_type: null,
  //       data_type: null,
  //       is_nullable: null,
  //       drop_constraint: [],
  //       rename_constraint: null,
  //       table_schema: null,
  //       table_name: null,
  //       constraint_type: null,
  //     };
  //     if (currentTable.columns[j].constraint_type === 'PRIMARY KEY') {
  //       alterColumnsObj.rename_constraint = `pk_${currentTable.table_name}${currentTable.columns[j].column_name}`;
  //       alterColumnsArray.push(alterColumnsObj);
  //     }
  //     if (currentTable.columns[j].constraint_type === 'FOREIGN KEY') {
  //       alterColumnsObj.rename_constraint = `fk_${currentTable.table_name}${currentTable.columns[j].column_name}`;
  //       alterColumnsArray.push(alterColumnsObj);
  //     }
  //     if (currentTable.columns[j].constraint_type === 'UNIQUE') {
  //       alterColumnsObj.rename_constraint = `unique_${currentTable.table_name}${currentTable.columns[j].column_name}`;
  //       alterColumnsArray.push(alterColumnsObj);
  //     }
  //   }
  //   const alterTablesObj: AlterTablesObjType = {
  //     is_insertable_into: currentTable.is_insertable_into,
  //     table_catalog: currentTable.table_catalog,
  //     table_name: currentTable.table_name,
  //     new_table_name: tableInputField.value,
  //     table_schema: currentTable.table_schema,
  //     addColumns: [],
  //     dropColumns: [],
  //     alterColumns: alterColumnsArray,
  //   };

  //   // update frontend
  //   if (tableInputField !== null) {
  //     currentTable.new_table_name = tableInputField.value;
  //     setSchemaState(schemaStateCopy);
  //     console.log(schemaStateCopy);
  //   }
  //   console.log(alterTablesObj);
  //   backendObj.current.updates.alterTables.push(alterTablesObj);
  // };

  return (
    <div
      style={{ backgroundColor: colors.greyLightest }}
      className="table-header table"
    >
      <Tooltip title="Add Column">
        <IconButton
          onClick={handleAddColumn}
          className="add-column"
          size="large"
        >
          Add Column
        </IconButton>
      </Tooltip>
    </div>
  );
}

export default TableFooter;
