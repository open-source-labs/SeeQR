import React from 'react';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import {
  AlterTablesObjType,
  AddColumnsObjType,
  DropTablesObjType,
  TableHeaderDataObjectType,
  AlterColumnsObjType,
} from '../../../types';
import './styles.css';
import * as colors from '../../../style-variables';

type TableHeaderProps = {
  data: TableHeaderDataObjectType;
};

function TableHeader({ data }: TableHeaderProps) {
  const { table_name, schemaStateCopy, setSchemaState, backendObj } = data;

  // This function handles the add column button on the table
  const handleAddColumn = () => {
    // iterate through the schema copy
    for (let i = 0; i < schemaStateCopy.tableList.length; i += 1) {
      // edit the schema table for this current table
      if (schemaStateCopy.tableList[i].table_name === table_name) {
        // create an alterTableObject with AlterTablesObjectType
        const alterTablesObj: AlterTablesObjType = {
          is_insertable_into: null,
          table_catalog: schemaStateCopy.tableList[i].table_catalog,
          table_name,
          new_table_name: null,
          table_schema: schemaStateCopy.tableList[i].table_schema,
          addColumns: [],
          dropColumns: [],
          alterColumns: [],
        };

        // create an addColumnsType object
        const addColumnsObj: AddColumnsObjType = {
          column_name: `NewColumn${
            schemaStateCopy.tableList[i].columns.length + 1
          }`,
          data_type: 'varchar',
          character_maximum_length: 255,
        };
        // add the addColumnsObj to the alterTablesObj
        alterTablesObj.addColumns.push(addColumnsObj);
        // update the backendObj
        backendObj.current.updates.alterTables.push(alterTablesObj);
        // push a new object with blank properties
        schemaStateCopy.tableList[i].columns.push({
          column_name: `NewColumn${
            schemaStateCopy.tableList[i].columns.length + 1
          }`,
          new_column_name: `NewColumn${
            schemaStateCopy.tableList[i].columns.length + 1
          }`,
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
        return;
      }
    }
  };

  // This function handles the add delete button on the table
  const handleDeleteTable = () => {
    for (let i = 0; i < schemaStateCopy.tableList.length; i += 1) {
      if (schemaStateCopy.tableList[i].table_name === table_name) {
        // create a dropTables Obj
        const dropTablesObj: DropTablesObjType = {
          table_name,
          table_schema: schemaStateCopy.tableList[i].table_schema,
        };
        // update backendObj
        backendObj.current.updates.dropTables.push(dropTablesObj);
        // update frontend
        schemaStateCopy.tableList.splice(i, 1);
        // set the state with the modified copy
        setSchemaState(schemaStateCopy);
      }
    }
  };

  // This function updates the table name when the user hits enter on the submit form
  const handleChangeTableName = (e) => {
    if (e.key === 'Enter') {
      for (let i = 0; i < schemaStateCopy.tableList.length; i += 1) {
        if (schemaStateCopy.tableList[i].table_name === table_name) {
          const tableInputField = document.getElementById(
            `table-name-form-${data.table_name}`
          ) as HTMLInputElement;

          // update backend
          const alterColumnsArray: AlterColumnsObjType[] = [];
          for (let j = 0; j < schemaStateCopy.tableList[i].columns.length; j += 1) {
            const alterColumnsObj: AlterColumnsObjType = {
              column_name: schemaStateCopy.tableList[i].columns[j].column_name,
              character_maximum_length: null,
              new_column_name: null,
              add_constraint: [],
              current_data_type: null,
              data_type: null,
              is_nullable: null,
              drop_constraint: [],
              rename_constraint: null
            }
            if (schemaStateCopy.tableList[i].columns[j].constraint_type === 'PRIMARY KEY') {
              alterColumnsObj.rename_constraint = `pk_${schemaStateCopy.tableList[i].table_name}${schemaStateCopy.tableList[i].columns[j].column_name}`;
              alterColumnsArray.push(alterColumnsObj);
            }
            if (schemaStateCopy.tableList[i].columns[j].constraint_type === 'FOREIGN KEY') {
              alterColumnsObj.rename_constraint = `fk_${schemaStateCopy.tableList[i].table_name}${schemaStateCopy.tableList[i].columns[j].column_name}`;
              alterColumnsArray.push(alterColumnsObj);
            }
            if (schemaStateCopy.tableList[i].columns[j].constraint_type === 'UNIQUE') {
              alterColumnsObj.rename_constraint = `unique_${schemaStateCopy.tableList[i].table_name}${schemaStateCopy.tableList[i].columns[j].column_name}`;
              alterColumnsArray.push(alterColumnsObj);
            }
          }
          const alterTablesObj: AlterTablesObjType = {
            is_insertable_into: schemaStateCopy.tableList[i].is_insertable_into,
            table_catalog: schemaStateCopy.tableList[i].table_catalog,
            table_name: schemaStateCopy.tableList[i].table_name,
            new_table_name: tableInputField.value,
            table_schema: schemaStateCopy.tableList[i].table_schema,
            addColumns: [],
            dropColumns: [],
            alterColumns: alterColumnsArray,
          };

          // update frontend
          if (tableInputField !== null) {
            schemaStateCopy.tableList[i].new_table_name = tableInputField.value;
            setSchemaState(schemaStateCopy);
          }
          backendObj.current.updates.alterTables.push(alterTablesObj);
        }
      }
    }
  };

  return (
    <div
      style={{ backgroundColor: colors.greyLightest }}
      className="table-header table"
    >
      <Tooltip title="Press ENTER to submit new table name">
        <TextField
          id={`table-name-form-${data.table_name}`}
          label="Table Name"
          variant="outlined"
          defaultValue={data.table_name}
          onKeyPress={handleChangeTableName}
          style={{ backgroundColor: 'white' }}
        />
      </Tooltip>
      <Tooltip title="Add Column">
        <IconButton onClick={handleAddColumn}>Add Column</IconButton>
      </Tooltip>
      <Tooltip title="Delete Table">
        <IconButton onClick={handleDeleteTable}>
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    </div>
  );
}

export default TableHeader;
