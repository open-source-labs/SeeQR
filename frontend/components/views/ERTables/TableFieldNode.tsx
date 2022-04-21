import React, { useCallback, useState, useEffect } from 'react';
import { Handle, Position } from 'react-flow-renderer';

import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  ERTableColumnData,
  BackendObjType,
  AlterTablesObjType,
  DropColumnsObjType,
  AlterColumnsObjType,
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
    for (let i = 0; i < schemaStateCopy.tableList.length; i++) {
      // edit schema table for this current table
      if (schemaStateCopy.tableList[i].table_name === data.tableName) {
        let columnIndex;
        // iterate through columns
        for (let j = 0; j < schemaStateCopy.tableList[i].columns.length; j++) {
          if (
            schemaStateCopy.tableList[i].columns[j].column_name === column_name
          ) {
            columnIndex = j;

            // create alterTablesObject with AlterTablesObjecttype
            const alterTablesObj: AlterTablesObjType = {
              is_insertable_into: null,
              table_catalog: schemaStateCopy.tableList[i].table_catalog,
              table_name: schemaStateCopy.tableList[i].table_name,
              new_table_name: null,
              table_schema: schemaStateCopy.tableList[i].table_schema,
              addColumns: [],
              dropColumns: [],
              alterColumns: [],
            };
            // create a deleteColumnsType object
            const dropColumnObj: DropColumnsObjType = {
              column_name: schemaStateCopy.tableList[i].columns[j].column_name,
            };
            // add deleteColumns obj to the alterTablesObj
            alterTablesObj.dropColumns.push(dropColumnObj);
            // update the backendObj
            backendObj.current.updates.alterTables.push(alterTablesObj);
            // alter schema state to remove the column
            schemaStateCopy.tableList[i].columns.splice(columnIndex, 1);
            // set the state
            setSchemaState(schemaStateCopy);
            return;
          }
        }
      }
    }
  };

  const handleUpdateColumn = () => {
    // create an alterColumns object
    const alterColumnsObj: AlterColumnsObjType = {
      column_name,
      character_maximum_length: null,
      new_column_name: null,
      add_constraint: [],
      data_type: null,
      is_nullable: null,
      drop_constraint: [],
    };

    // // handle is_nullable change
    // const isNullable = document.getElementById(
    //   `allow-null-chkbox-${tableColumn}`
    // ) as HTMLInputElement;
    // const isNullableString = isNullable.checked ? 'yes' : 'no';
    // alterColumnsObj.is_nullable =
    //   isNull !== isNullableString ? isNullableString : null;

    for (let i = 0; i < schemaStateCopy.tableList.length; i++) {
      if (schemaStateCopy.tableList[i].table_name === data.tableName) {
        let columnIndex;
        // iterate through columns
        for (let j = 0; j < schemaStateCopy.tableList[i].columns.length; j++) {
          if (
            schemaStateCopy.tableList[i].columns[j].column_name === column_name
          ) {
            const alterTablesObj: AlterTablesObjType = {
              is_insertable_into: null,
              table_catalog: schemaStateCopy.tableList[i].table_catalog,
              table_name: data.tableName,
              new_table_name: null,
              table_schema: schemaStateCopy.tableList[i].table_schema,
              addColumns: [],
              dropColumns: [],
              alterColumns: [],
            };

            // handle column_name change
            const columnNameInput = document.getElementById(
              `type-input-column_name-${tableColumn}`
            ) as HTMLSelectElement;
            console.log('columnNameInput.value', columnNameInput.value);
            if (column_name !== columnNameInput.value) {
              alterColumnsObj.new_column_name = columnNameInput.value;
              schemaStateCopy.tableList[i].columns[j].new_column_name =
                columnNameInput.value;
            }

            // handle data_type change
            const dataTypeInput = document.getElementById(
              `type-dd-${tableColumn}`
            ) as HTMLSelectElement;
            if (data_type !== dataTypeInput.value) {
              alterColumnsObj.data_type = dataTypeInput.value;
              schemaStateCopy.tableList[i].columns[j].data_type =
                dataTypeInput.value;
            }

            // add the alterTablesObj
            alterTablesObj.alterColumns.push(alterColumnsObj);
            // update the backendObj
            backendObj.current.updates.alterTables.push(alterTablesObj);
            setSchemaState(schemaStateCopy);
            console.log('backendobj after update', backendObj.current);
            return;
          }
        }
      }
      // TODO: MAKE STATE CHANGE
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
  const disableForeignKeyMenuHandler = (isChecked) => {
    const tableID = `foreign-key-table-dd-${tableColumn}`;
    const fieldID = `foreign-key-field-dd-${tableColumn}`;

    const tableDD = document.getElementById(tableID) as HTMLSelectElement;
    const fieldDD = document.getElementById(fieldID) as HTMLSelectElement;

    tableDD.disabled = !isChecked;
    fieldDD.disabled = !isChecked;
  };

  const disableAllowNullHandler = () => {
    const pkID = `primary-key-chkbox-${tableColumn}`;
    const pkCheckBox = document.getElementById(pkID) as HTMLInputElement;
    const isPkChecked = pkCheckBox.checked;

    const fkID = `foreign-key-chkbox-${tableColumn}`;
    const fkCheckBox = document.getElementById(fkID) as HTMLInputElement;
    const isFkChecked = fkCheckBox.checked;

    const allowNullID = `allow-null-chkbox-${tableColumn}`;
    const allowNullCheckBox = document.getElementById(
      allowNullID
    ) as HTMLSelectElement;
    allowNullCheckBox.disabled = isFkChecked || isPkChecked;
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
              {data_type === 'character varying' ? 'varchar' : data_type}
            </p>
          </div>
        </AccordionSummary>

        <AccordionDetails>
          <TableFieldInput
            idName={`type-input-column_name-${tableColumn}`}
            label="Name"
            defaultValue={column_name}
          />
          <TableFieldDropDown
            label="Type"
            idName={`type-dd-${tableColumn}`}
            defaultValue={data_type}
            otherTables={data.otherTables}
            options={['serial', 'varchar', 'bigint', 'integer', 'date']}
          />
          <TableFieldInput
            idName={`type-input-char_max_size-${tableColumn}`}
            label="Size"
            defaultValue={character_maximum_length}
          />
          <p />
          <TableFieldCheckBox
            label="Foreign Key"
            idName={`foreign-key-chkbox-${tableColumn}`}
            isChecked={foreign_table != null}
            onChange={[disableForeignKeyMenuHandler, disableAllowNullHandler]}
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
          <TableFieldCheckBox
            idName={`primary-key-chkbox-${tableColumn}`}
            label="Primary Key"
            isChecked={constraint_type === 'PRIMARY KEY'}
            onChange={disableAllowNullHandler}
          />
          <TableFieldCheckBox
            idName={`allow-null-chkbox-${tableColumn}`}
            label="Allow Null"
            isChecked={
              !(constraint_type === 'PRIMARY KEY' || foreign_table == null)
            }
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
            <button id="update-btn" onClick={handleUpdateColumn}>
              Update
            </button>
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
