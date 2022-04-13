import React, { useCallback, useState, useEffect } from 'react';
import { Handle, Position } from 'react-flow-renderer';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from '@mui/material'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ERTableColumnData } from '../../../types';

import TableFieldCheckBox from './TableFieldCheckBox';
import TableFieldInput from './TableFieldInput';
import TableFieldDropDown from './TableFieldDropDown';
import TableFieldDropDownOption from './TableFieldDropDownOption';

import "./styles.css";

type TableFieldProps = {
  data
}

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

  const tableColumn = `${data.tableName}-${column_name}`;
  const [fkOptions, setFkOptions] = useState<string[]>(createFieldOptions());
  const onChange = useCallback((evt) => {
    console.log(evt.target.value);
  }, []);

  // autopopulates the fk field options
  function createFieldOptions() {
    const options:string[] = [];

    // if foreign_table is NOT provided return column names of first table in otherTables
    if (foreign_table == null) options.push(... data.otherTables[0].column_names)

    // if foreign_table is provided return associated column_names
    data.otherTables.forEach(table => {
      if (table.table_name === foreign_table) {
        options.push(... table.column_names);
      }
    });

    return options;
  };

  // disable the dropdown menus for fk table and field when fk checkbox is not checked
  const disableFKHandler = (isChecked) => {
    const tableID = `foreign-key-table-dd-${tableColumn}`;
    const fieldID = `foreign-key-field-dd-${tableColumn}`;

    const tableDD = document.getElementById(tableID) as HTMLSelectElement;
    const fieldDD = document.getElementById(fieldID) as HTMLSelectElement;

    tableDD.disabled = !isChecked;
    fieldDD.disabled = !isChecked;
  };

  // create and update the fk field dropdown options based on the selected fk table
  const changeFKOptionsHandler = () => {
    // const tableID = `foreign-key-table-dd-${tableColumn}`;
    // const fieldID = `foreign-key-field-dd-${tableColumn}`;

    // const tableDD = document.getElementById(tableID) as HTMLSelectElement;
    // let fieldDD = document.getElementById(fieldID) as HTMLSelectElement;

    // // const options:HTMLOptionElement[] = []; //FIXME: FIX TYPE
    // const options: JSX.Element[] = [];
    // data.otherTables.forEach(table => {
    //   if (table.table_name === tableDD.value) {
    //     table.column_names.forEach(col => {
    //       options.push(<TableFieldDropDownOption idName={fieldID} option={col} />);
    //     });
    //   }
    // });

    // if (options.length > 0) {
    //   console.log(options)
    //   fieldDD.add(options[0])
    // }


  }


  
  return (
    <div>
      {constraint_type === "PRIMARY KEY" ? 
        <Handle type='target' position={Position.Left} onChange={onChange} style={{background: '#fff'}} /> : 
        <Handle type='source' position={Position.Right} onChange={onChange} />}
      <Accordion sx={{width: 350}}>

        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
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
            idName={`type-dd-${tableColumn}`}
            defaultValue={data_type} 
            options={['serial', 'varchar', 'bigint', 'integer', 'date']}
          />
          <TableFieldInput 
            label='Size' 
            defaultValue={character_maximum_length}
          />
          <p />
          <TableFieldCheckBox 
            label='Foreign Key' 
            idName={`foreign-key-chkbox-${tableColumn}`}
            isChecked={foreign_table != null}
            changeCallback={disableFKHandler}
          />
          <TableFieldDropDown 
            label='Table'
            idName={`foreign-key-table-dd-${tableColumn}`}
            isDisabled={foreign_table == null}
            defaultValue={foreign_table} 
            options={data.otherTables.map(table => table.table_name)}
            // changeCallback={changeFKOptionsHandler}
            // setFkOptions={setFkOptions}
          />
          <TableFieldDropDown 
            label='Field' 
            idName={`foreign-key-field-dd-${tableColumn}`}
            isDisabled={foreign_table == null}
            defaultValue={foreign_column} 
            options={fkOptions}
          />
          <p />
          <TableFieldCheckBox // FIXME:
            idName={`primary-key-chkbox-${tableColumn}`}
            label='Primary Key'
          />
          <TableFieldCheckBox // FIXME:
            idName={`allow-null-chkbox-${tableColumn}`}
            label='Allow Null'
          />
          <TableFieldCheckBox // FIXME: MAKE FIXED TO PRIMARY KEY
            idName={`unique-chkbox-${tableColumn}`}
            label='Unique' 
            isChecked={unique} 
          />
          <TableFieldCheckBox // FIXME: MAKE FIXED TO PRIMARY KEY
            idName={`auto-increment-chkbox-${tableColumn}`}
            label='Auto Increment' 
            isChecked={auto_increment}
          />
          <p />
          <div>
            <button id='update-btn'>Update</button>  
            <button id='cancel-btn'>Cancel</button>  
            <button id='delete-btn'>Delete</button>  
          </div>
        </AccordionDetails>

      </Accordion> 
    </div>
  );
}

export default TableField;