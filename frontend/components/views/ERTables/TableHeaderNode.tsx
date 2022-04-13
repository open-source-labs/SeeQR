//#TODO: replace with proper numbered table name
//#TODO: FIGURE OUT HOW TO PASS DOWN THEMES
//#TODO: GET BOX TO WORK
import React from 'react';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import {BackendObjType, AlterTablesObjType, AddColumnsObjType} from '../../../types'

type TableHeaderDataObjectType = {
  table_name: string;
  schemaStateCopy: any;
  setSchemaState: (string) => {};
  backendObj: BackendObjType;
}

type TableHeaderProps = {
  data: TableHeaderDataObjectType;
}

function TableHeader({data}: TableHeaderProps) {
  const {table_name, schemaStateCopy, setSchemaState, backendObj} = data;

  const handleAddColumn = () => {
    // iterate through the schema copy
    for (let i = 0; i < schemaStateCopy.length; i++){
      // edit the schema table for this current table
      if (schemaStateCopy[i].table_name === table_name) {
        // create an alterTableObject with AlterTablesObjectType
        const alterTablesObj: AlterTablesObjType = {
          is_insertable_into: null,
          table_catalog: schemaStateCopy[i].table_catalog,
          table_name,
          new_table_name: null,
          table_schema: null,
          addColumns: [],
          dropColumns: [],
          alterColumns: [],
        }
 
        // create an addColumnsType object
        const addColumnsObj: AddColumnsObjType = {
          column_name: `NewColumn${schemaStateCopy[i].columns.length + 1}`,
          data_type: 'character varying'
        }

        // add the addColumnsObj to the alterTablesObj
        alterTablesObj.addColumns.push(addColumnsObj);
        // update the backendObj
        backendObj.updates.alterTables.push(alterTablesObj);
        // push a new object into backendObj.alterTables
        // push a new object with blank properties
        schemaStateCopy[i].columns.push(
          {
            character_maxmimum_length: null,
            column_name: `NewColumn${schemaStateCopy[i].columns.length + 1}`,
            constraint_name: null,
            constraint_type: null,
            data_type: "character varying",
            foreign_column: null,
            foreign_table: null,
            is_nullable: "NO"
        })
        // set the state 
        setSchemaState(schemaStateCopy);
        return;
      }
    }
  }

  return (
    <div className='table-header table'>
      <TextField 
        id='table-name-form' 
        label='Table Name' 
        variant='standard'
        defaultValue={data.table_name}
        // required={true}
        // type='string'
        // value={data.tableName} 
      />
      <Tooltip title='Delete Table'>
        <IconButton>
          <DeleteIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title='Add Column'>
        <IconButton onClick={handleAddColumn}>
          Add Column
        </IconButton>
      </Tooltip>
    </div>
  );
}

export default TableHeader;