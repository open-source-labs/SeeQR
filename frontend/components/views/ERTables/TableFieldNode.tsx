import React, { useCallback, useState, useEffect } from 'react';
import { Handle, Position } from 'react-flow-renderer';
import { ERTableColumnData } from '../../../types';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from '@mui/material'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import "./styles.css";

import TableFieldCheckBox from './TableFieldCheckBox';
import TableFieldInput from './TableFieldInput';
import TableFieldDropDown from './TableFieldDropDown';

type TableFieldProps = {
  data
}

//import "./styles.css";

function TableField({ data } : TableFieldProps) {
  const {
    constraint_type, 
    column_name, 
    data_type, 
    character_maximum_length,
    unique,
    auto_increment,
    foreign_column,
    foreign_table } : ERTableColumnData = data.columnData;
  
  const onChange = useCallback((evt) => {
    console.log(evt.target.value);
  }, []);


  useEffect(() => {
    // #TODO: UPDATE FKTABLE/FIELD DISABLED BASED ON DK CHECKBOX
    // #TODO: UPDATEFK FIELD OPTIONS BASED ON FK TABLE
  },[])
  
  // if (document.getElementById('foreign-key-chkbox')) {
  //   console.log('fk', document.getElementById('foreign-key-chkbox'))
  //   console.log('fk', document.getElementById('foreign-key-chkbox').value)
  // }

  
  return (
    <div>
      {constraint_type === "PRIMARY KEY" ? 
        <Handle type='target' position={Position.Left} onChange={onChange} style={{background: '#fff'}}/> : 
        <Handle type='source' position={Position.Right} onChange={onChange} />}
      <Accordion sx={{width: 350}}>

        <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
          <div className='field-summary-wrapper'>
            <p id='column-name'>{column_name}</p>
            <p id='data-type'>{data_type}</p>
          </div>
        </AccordionSummary>

        <AccordionDetails>
          <TableFieldInput 
            label='Name' 
            defaultValue={column_name} 
          />
          <TableFieldDropDown 
            label='Type' 
            idName={`type-dd-${column_name}`}
            defaultValue={data_type} 
            options={['serial', 'varchar', 'bigint', 'integer', 'date']}
          />
          <TableFieldInput 
            label='Size' 
            defaultValue={character_maximum_length}
          />
          <p></p>
          <TableFieldCheckBox 
            label='Foreign Key' 
            idName={`foreign-key-chkbox-${column_name}`}
            isChecked={foreign_table != null}
          />
          <TableFieldDropDown 
            label='Table'
            idName={`foreign-key-table-dd-${column_name}`}
            // isDisabled={document.getElementById(id);!= null}
            defaultValue={foreign_table} 
            options={data.otherTables.map(table => table.table_name)}
          />
          <TableFieldDropDown 
            label='Field' 
            idName={`foreign-key-field-dd-${column_name}`}
            defaultValue={foreign_column} 
            options={[]}
          />
          <p></p>
          <TableFieldCheckBox // FIXME:
            idName={`primary-key-chkbox-${column_name}`}
            label='Primary Key'
          />
          <TableFieldCheckBox // FIXME:
            idName='allow-null-chkbox'
            label='Allow Null'
          />
          <TableFieldCheckBox // FIXME: MAKE FIXED TO PRIMARY KEY
            idName={`unique-chkbox-${column_name}`}
            label='Unique' 
            isChecked={unique} 
          />
          <TableFieldCheckBox // FIXME: MAKE FIXED TO PRIMARY KEY
            idName={`auto-increment-chkbox-${column_name}`}
            label='Auto Increment' 
            isChecked={auto_increment}
          />
          <p></p>
          <div>
            <button id='update-btn' >Update</button>  
            <button id='cancel-btn' >Cancel</button>  
            <button id='delete-btn' >Delete</button>  
          </div>
        </AccordionDetails>

      </Accordion> 
    </div>
  );
}

export default TableField;