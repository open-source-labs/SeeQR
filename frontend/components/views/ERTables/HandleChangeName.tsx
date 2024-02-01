import React from 'react';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import { Save } from '@mui/icons-material';
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
  

export function handleChangeTableName({ data }: TableFooterProps) {
    const { table_name, schemaStateCopy, setSchemaState, backendObj } = data;
    const currentTable = schemaStateCopy.tableList.find(
      (table) => table.table_name === table_name,
    );
  
    const tableInputField = document.getElementById(
      `table-name-form-${data.table_name}`,
    ) as HTMLInputElement;
  
    if (!tableInputField) {
      console.error('Table input field not found');
      return;
    }
  
    console.log(tableInputField.value);
  
    // Update backend
    const alterColumnsArray = currentTable.columns.map((column) => {
      const alterColumnsObj = {
        column_name: column.column_name,
        character_maximum_length: null,
        new_column_name: null,
        add_constraint: [],
        current_data_type: null,
        data_type: null,
        is_nullable: null,
        drop_constraint: [],
        rename_constraint: "",
        table_schema: null,
        table_name: null,
        constraint_type: null,
      };
  
      if (column.constraint_type === 'PRIMARY KEY' || column.constraint_type === 'FOREIGN KEY' || column.constraint_type === 'UNIQUE') {
        alterColumnsObj.rename_constraint = `${column.constraint_type.toLowerCase()}_${currentTable.table_name}${column.column_name}`;
        alterColumnsArray.push(alterColumnsObj);
      }
  
      return alterColumnsObj;
    });
  
    const alterTablesObj = {
      is_insertable_into: currentTable.is_insertable_into,
      table_catalog: currentTable.table_catalog,
      table_name: currentTable.table_name,
      new_table_name: tableInputField.value,
      table_schema: currentTable.table_schema,
      addColumns: [],
      dropColumns: [],
      alterColumns: alterColumnsArray,
    };
  
    // Update frontend
    currentTable.new_table_name = tableInputField.value;
    setSchemaState(schemaStateCopy);
    console.log(schemaStateCopy);
  
    console.log(alterTablesObj);
    backendObj.current.updates.alterTables.push(alterTablesObj);
}


