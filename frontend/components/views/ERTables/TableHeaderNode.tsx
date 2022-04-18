import React from 'react';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import {
  BackendObjType,
  AlterTablesObjType,
  AddColumnsObjType,
  TableHeaderDataObjectType
} from '../../../types';
import './styles.css';

type TableHeaderProps = {
  data: TableHeaderDataObjectType;
};

function TableHeader({ data }: TableHeaderProps) {
  const { table_name, schemaStateCopy, setSchemaState, backendObj } = data;

  const handleAddColumn = () => {
    // iterate through the schema copy
    for (let i = 0; i < schemaStateCopy.length; i++) {
      // edit the schema table for this current table
      if (schemaStateCopy[i].table_name === table_name) {
        // create an alterTableObject with AlterTablesObjectType
        const alterTablesObj: AlterTablesObjType = {
          is_insertable_into: null,
          table_catalog: schemaStateCopy[i].table_catalog,
          table_name,
          new_table_name: null,
          table_schema: schemaStateCopy[i].table_schema,
          addColumns: [],
          dropColumns: [],
          alterColumns: [],
        };

        // create an addColumnsType object
        const addColumnsObj: AddColumnsObjType = {
          column_name: `NewColumn${schemaStateCopy[i].columns.length + 1}`,
          data_type: 'varchar',
        };
        // add the addColumnsObj to the alterTablesObj
        alterTablesObj.addColumns.push(addColumnsObj);
        // update the backendObj
        backendObj.updates.alterTables.push(alterTablesObj);

        // push a new object with blank properties
        schemaStateCopy[i].columns.push({
          character_maxmimum_length: null,
          column_name: `NewColumn${schemaStateCopy[i].columns.length + 1}`,
          constraint_name: null,
          constraint_type: null,
          data_type: 'varchar',
          foreign_column: null,
          foreign_table: null,
          is_nullable: 'NO',
        });
        // set the state
        setSchemaState(schemaStateCopy);
        return;
      }
    }
  };

  const handleDeleteTable = () => {
    for (let i = 0; i < schemaStateCopy.length; i++) {
      if (schemaStateCopy[i].table_name === table_name) {
        // update backend
        const dropTablesObj = {
          table_name,
          table_schema: schemaStateCopy[i].table_schema,
        };
        backendObj.updates.dropTables.push(dropTablesObj);

        // update frontend
        schemaStateCopy.splice(i, 1);
        setSchemaState(schemaStateCopy);

        return;
      }
    }
  };

  // updates the table name when the user hits enter on the submit form
  const handleChangeTableName = (e) => {
    if (e.key === 'Enter') {
      for (let i = 0; i < schemaStateCopy.length; i++) {
        if (schemaStateCopy[i].table_name === table_name) {
          const tableInputField = document.getElementById(
            `table-name-form-${data.table_name}`
          ) as HTMLInputElement;

          // update backend
          const alterTablesObj: AlterTablesObjType = {
            is_insertable_into: schemaStateCopy[i].is_insertable_into,
            table_catalog: schemaStateCopy[i].table_catalog,
            table_name: schemaStateCopy[i].table_name,
            new_table_name: tableInputField.value,
            table_schema: schemaStateCopy[i].table_schema,
            addColumns: [],
            dropColumns: [],
            alterColumns: [],
          };

          // update frontend
          if (tableInputField !== null) {
            schemaStateCopy[i].table_name = tableInputField.value;
            setSchemaState(schemaStateCopy);
          }

          backendObj.updates.alterTables.push(alterTablesObj);
        }
      }
    }
  };

  return (
    <div className="table-header table">
      <Tooltip title="Press ENTER to submit new table name">
        <TextField
          id={`table-name-form-${data.table_name}`}
          label="Table Name"
          variant="outlined"
          defaultValue={data.table_name}
          onKeyPress={handleChangeTableName}
        />
      </Tooltip>
      <Tooltip title="Delete Table">
        <IconButton onClick={handleDeleteTable}>
          <DeleteIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Add Column">
        <IconButton onClick={handleAddColumn}>Add Column</IconButton>
      </Tooltip>
    </div>
  );
}

export default TableHeader;
