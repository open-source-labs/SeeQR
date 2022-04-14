import React, { useCallback, useState, useEffect } from 'react';
import { Handle, Position } from 'react-flow-renderer';

import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  ERTableColumnData,
  BackendObjType,
  AlterTablesObjType,
  DropColumnsObjType,
} from '../../../types';

import TableFieldCheckBox from './TableFieldCheckBox';
import TableFieldInput from './TableFieldInput';
import TableFieldDropDown from './TableFieldDropDown';
import TableFieldDropDownOption from './TableFieldDropDownOption';
import './styles.css';

type TableFieldDataObjectType = {
  table_name: string;
  schemaStateCopy: any;
  setSchemaState: (string) => {};
  backendObj: BackendObjType;
};

type TableFieldProps = {
  data;
};

function TableField({ data }: TableFieldProps) {
  const {
    table_name,
    schemaStateCopy,
    setSchemaState,
    backendObj,
  }: TableFieldDataObjectType = data;
  const {
    constraint_type,
    column_name,
    data_type,
    character_maximum_length,
    unique,
    auto_increment,
    foreign_column,
    foreign_table,
  }: ERTableColumnData = data.columnData;

  const tableColumn = `${data.tableName}-${column_name}`;

  const handleDropColumn = () => {
    // iterate through schema copy
    for (let i = 0; i < schemaStateCopy.length; i++) {
      // edit schema table for this current table
      if (schemaStateCopy[i].table_name === data.tableName) {
        let columnIndex;
        // iterate through columns
        for (let j = 0; j < schemaStateCopy[i].columns.length; j++) {
          if (schemaStateCopy[i].columns[j].column_name === column_name) {
            columnIndex = j;

            // create alterTablesObject with AlterTablesObjecttype
            const alterTablesObj: AlterTablesObjType = {
              is_insertable_into: null,
              table_catalog: schemaStateCopy[i].table_catalog,
              table_name: schemaStateCopy[i].table_name,
              new_table_name: null,
              table_schema: schemaStateCopy[i].table_schema,
              addColumns: [],
              dropColumns: [],
              alterColumns: [],
            };
            // create a deleteColumnsType object
            const dropColumnObj: DropColumnsObjType = {
              column_name: schemaStateCopy[i].columns[j].column_name,
            };
            // add deleteColumns obj to the alterTablesObj
            alterTablesObj.dropColumns.push(dropColumnObj);
            // update the backendObj
            backendObj.updates.alterTables.push(alterTablesObj);
            // alter schema state to remove the column
            schemaStateCopy[i].columns.splice(columnIndex, 1);
            // set the state
            setSchemaState(schemaStateCopy);
            return;
          }
        }
      }
    }
  };

  // autopopulates the fk field options from state
  const createFieldOptions = () => {
    const options: string[] = [];

    // if foreign_table is NOT provided return column names of first table in otherTables
    if (foreign_table == null && data.otherTables.length > 0) {
      options.push(...data.otherTables[0].column_names);
    }

    // if foreign_table is provided return associated column_names
    data.otherTables.forEach((table) => {
      if (table.table_name === foreign_table) {
        options.push(...table.column_names);
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

  const [fkOptions, setFkOptions] = useState<string[]>(createFieldOptions());

  return (
    <div>
      {constraint_type === 'PRIMARY KEY' ? (
        <Handle
          type="target"
          position={Position.Left}
          style={{ background: '#fff' }}
        />
      ) : (
        <Handle type="source" position={Position.Right} />
      )}
      <Accordion sx={{ width: 350 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <div className="field-summary-wrapper">
            <p id="column-name">{column_name}</p>
            <p id="data-type">
              {data_type === 'varchar' ? 'varchar' : data_type}
            </p>
          </div>
        </AccordionSummary>

        <AccordionDetails>
          <TableFieldInput label="Name" defaultValue={column_name} />
          <TableFieldDropDown
            label="Type"
            idName={`type-dd-${tableColumn}`}
            defaultValue={data_type}
            otherTables={data.otherTables}
            options={['serial', 'varchar', 'bigint', 'integer', 'date']}
          />
          <TableFieldInput
            label="Size"
            defaultValue={character_maximum_length}
          />
          <p />
          <TableFieldCheckBox
            label="Foreign Key"
            idName={`foreign-key-chkbox-${tableColumn}`}
            isChecked={foreign_table != null}
            changeCallback={disableFKHandler}
          />
          <TableFieldDropDown
            label="Table"
            idName={`foreign-key-table-dd-${tableColumn}`}
            isDisabled={foreign_table == null}
            defaultValue={foreign_table}
            options={data.otherTables.map((table) => table.table_name)}
            setFkOptions={setFkOptions}
            otherTables={data.otherTables}
          />
          <TableFieldDropDown
            label="Field"
            idName={`foreign-key-field-dd-${tableColumn}`}
            isDisabled={foreign_table == null}
            defaultValue={foreign_column}
            options={fkOptions}
            otherTables={data.otherTables}
          />
          <p />
          <TableFieldCheckBox // FIXME:
            idName={`primary-key-chkbox-${tableColumn}`}
            label="Primary Key"
          />
          <TableFieldCheckBox // FIXME:
            idName={`allow-null-chkbox-${tableColumn}`}
            label="Allow Null"
          />
          <TableFieldCheckBox // FIXME: MAKE FIXED TO PRIMARY KEY
            idName={`unique-chkbox-${tableColumn}`}
            label="Unique"
            isChecked={unique}
          />
          <TableFieldCheckBox // FIXME: MAKE FIXED TO PRIMARY KEY
            idName={`auto-increment-chkbox-${tableColumn}`}
            label="Auto Increment"
            isChecked={auto_increment}
          />
          <p />
          <div>
            <button id="update-btn">Update</button>
            <button id="cancel-btn">Cancel</button>
            <button id="delete-btn" onClick={handleDropColumn}>
              Delete
            </button>
          </div>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}

export default TableField;
