//#TODO: replace with proper numbered table name
//#TODO: FIGURE OUT HOW TO PASS DOWN THEMES
//#TODO: GET BOX TO WORK
import React from 'react';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';

type TableHeaderProps = {
  data: any
}

function TableHeader({data}: TableHeaderProps) {

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
    </div>
  );
}

export default TableHeader;