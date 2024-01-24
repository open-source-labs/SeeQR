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
} from '../../../types';
import './styles.css';
import * as colors from '../../../style-variables';
import { sendFeedback } from '../../../lib/utils';

type TableHeaderProps = {
  data: TableHeaderDataObjectType;
};

function TableHeader({ data }: TableHeaderProps) {
  const { table_name, schemaStateCopy, setSchemaState, backendObj } = data;
  // find table we are editing in schemaStateCopy to use throughout all of our TableHeader functions
  const currentTable = schemaStateCopy.tableList.find(
    (table) => table.table_name === table_name,
  );
  
  // This function handles the add delete button on the table
  const handleDeleteTable = (): void => {
    // create a dropTables Obj
    const dropTablesObj: DropTablesObjType = {
      table_name,
      table_schema: currentTable.table_schema,
    };
    // update backendObj
    backendObj.current.updates.dropTables.push(dropTablesObj);
    // update frontend
    schemaStateCopy.tableList = schemaStateCopy.tableList.filter(
      (table) => table.table_name !== table_name,
    );
    // set the state with the modified copy
    setSchemaState(schemaStateCopy);
  };
  // Added a warning on click. It seems like changing table names is not a great idea. I don't think the app correctly renames constraints, so support of this feature should be limited for now.
  const warnUser = (): void => {
    sendFeedback({
      type: 'error',
      message:
        'WARNING: Changing table name will only rename constraints in fk_tableNameColumnName format. Use at your own discretion.',
    });
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
          // onKeyDown={handleChangeTableName}
          onClick={warnUser}
          style={{ backgroundColor: 'white' }}
        />
      </Tooltip>
      <Tooltip title="Delete Table">
        <IconButton onClick={handleDeleteTable} size="large">
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    </div>
  );
}

export default TableHeader;
