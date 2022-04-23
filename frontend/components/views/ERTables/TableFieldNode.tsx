import React, { useState } from 'react';
import { Handle, Position } from 'react-flow-renderer';
import { AccordionSummary, AccordionDetails } from '@mui/material';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import styled from 'styled-components';
import { Button } from '@material-ui/core';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  ERTableColumnData,
  BackendObjType,
  AlterTablesObjType,
  DropColumnsObjType,
  AlterColumnsObjType,
  AddConstraintObjType,
} from '../../../types';
import TableFieldCheckBox from './TableFieldCheckBox';
import TableFieldInput from './TableFieldInput';
import TableFieldDropDown from './TableFieldDropDown';
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

const StyledButton = styled(Button)`
  color: rgba(0, 0, 0, 0.87);
  background-color: rgb(203, 212, 214);
  margin: 1rem;
  margin-left: 0rem;
  padding: 0.5rem 1rem;
`;

// Mui wrapper is used here to use the default styling
// the imported MuiAccordion component comes with
const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion
    TransitionProps={{ unmountOnExit: true }}
    disableGutters
    square={false}
    elevation={0}
    {...props}
  />
))(() => ({}));

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

  // handles functionality of the drop down delete button
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
  // handles functionality of the drop down update button
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

    for (let i = 0; i < schemaStateCopy.tableList.length; i += 1) {
      if (schemaStateCopy.tableList[i].table_name === data.tableName) {
        // iterate through columns
        for (
          let j = 0;
          j < schemaStateCopy.tableList[i].columns.length;
          j += 1
        ) {
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
            if (column_name !== columnNameInput.value) {
              alterColumnsObj.new_column_name = columnNameInput.value;
              schemaStateCopy.tableList[i].columns[j].new_column_name =
                columnNameInput.value;
            }

            // handle max_character_length change
            const columnMaxCharacterLengthInput = document.getElementById(
              `type-input-char_max_size-${tableColumn}`
            ) as HTMLSelectElement;
            if (columnMaxCharacterLengthInput.value) {
              if (
                character_maximum_length !==
                parseInt(columnMaxCharacterLengthInput.value, 10)
              ) {
                alterColumnsObj.character_maximum_length = parseInt(
                  columnMaxCharacterLengthInput.value,
                  10
                );
                schemaStateCopy.tableList[i].columns[
                  j
                ].character_maximum_length = parseInt(
                  columnMaxCharacterLengthInput.value,
                  10
                );
              }
            }

            // handle data_type change
            const dataTypeInput = document.getElementById(
              `type-dd-${tableColumn}`
            ) as HTMLSelectElement;
            if (
              (data_type === 'character varying' ? 'varchar' : data_type) !==
              dataTypeInput.value
            ) {
              alterColumnsObj.data_type = dataTypeInput.value;
              schemaStateCopy.tableList[i].columns[j].data_type =
                dataTypeInput.value;
            }

            // handle add/Drop Constraint type

            // create an empty AddConstraintObj
            const addConstraintObj: AddConstraintObjType = {
              constraint_type: null,
              constraint_name: '',
              foreign_table: null,
              foreign_column: null,
            };
            /* handle primary key */
            // get the primary key checkmark value
            const pkCheckBox = document.getElementById(
              `primary-key-chkbox-${tableColumn}`
            ) as HTMLInputElement;
            // if constraint type is PK in state but checkbox is unchecked, drop the constraint
            if (
              constraint_type === 'PRIMARY KEY' &&
              pkCheckBox.checked === false
            ) {
              // add the PK constraint name to the drop constraint array
              alterColumnsObj.drop_constraint.push(
                `PK_${data.tableName + column_name}`
              );
            } // if constraint type is not in state but checkbox is checked, add the constraint
            else if (
              constraint_type !== 'PRIMARY KEY' &&
              pkCheckBox.checked === true
            ) {
              // create a copy in case multiple constraints are added
              const addConstraintObjCopy = { ...addConstraintObj };
              // name the constraint PK_<column_name>
              addConstraintObjCopy.constraint_name = `PK_${
                data.tableName + column_name
              }`;
              // assign the constraint_type to 'PRIMARY KEY'
              addConstraintObjCopy.constraint_type = 'PRIMARY KEY';
              // add the constraint obj to the alter columns obj
              alterColumnsObj.add_constraint.push(addConstraintObjCopy);
            }

            // handle foreign key
            const fkCheckBox = document.getElementById(
              `foreign-key-chkbox-${tableColumn}`
            ) as HTMLInputElement;
            // if constraint type is FK in state but checkbox is unchecked, drop the constraint
            if (
              constraint_type === 'FOREIGN KEY' &&
              fkCheckBox.checked === false
            ) {
              // add the fk constraint name to the drop constraint array
              alterColumnsObj.drop_constraint.push(
                `FK_${data.tableName + column_name}`
              );
            } else if (
              constraint_type !== 'FOREIGN KEY' &&
              fkCheckBox.checked === true
            ) {
              const addConstraintObjCopy = { ...addConstraintObj };
              // name the constraint FK_<Column_name>
              addConstraintObjCopy.constraint_name = `FK_${
                data.tableName + column_name
              }`;
              // assign the constraint type to 'FOREIGN KEY'
              addConstraintObjCopy.constraint_type = 'FOREIGN KEY';
              // get the value of the drop down for foreign table
              const foreignTableDD = document.getElementById(
                `foreign-key-table-dd-${tableColumn}`
              ) as HTMLSelectElement;
              // assign the constraintobjcopy to foreign table value
              addConstraintObjCopy.foreign_table = foreignTableDD.value;
              // get the value of the drop down for foreign column
              const foreignColumnDD = document.getElementById(
                `foreign-key-field-dd-${tableColumn}`
              ) as HTMLSelectElement;
              // assign the constraintobjcopy to foreign column value
              addConstraintObjCopy.foreign_column = foreignColumnDD.value;
              // add the constraint obj to the alter columns obj
              alterColumnsObj.add_constraint.push(addConstraintObjCopy);
            }

            // add the alterTablesObj
            alterTablesObj.alterColumns.push(alterColumnsObj);
            // update the backendObj
            backendObj.current.updates.alterTables.push(alterTablesObj);
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
  const disableForeignKeyMenuHandler = (isChecked) => {
    const tableID = `foreign-key-table-dd-${tableColumn}`;
    const fieldID = `foreign-key-field-dd-${tableColumn}`;

    const tableDD = document.getElementById(tableID) as HTMLSelectElement;
    const fieldDD = document.getElementById(fieldID) as HTMLSelectElement;

    tableDD.disabled = !isChecked;
    fieldDD.disabled = !isChecked;
  };

  // disable allow null checkbox when the column is either a foreign key or primary key
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

  // create a state for the foreign key drop down options
  const [fkOptions, setFkOptions] = useState<string[]>(createFieldOptions());

  const [isAccordionExpanded, setAccordionExpanded] = useState(false);

  // This function handles the click functionality of clicking the accordion
  const handleAccordionClick = () => {
    setAccordionExpanded(!isAccordionExpanded);
  };

  // This function close the accordion expansion on mouse leave
  const handleMouseLeave = () => {
    setAccordionExpanded(false);
  };

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
      <Accordion
        expanded={isAccordionExpanded}
        onMouseLeave={handleMouseLeave}
        sx={{ width: 350 }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon onClick={handleAccordionClick} />}
        >
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
            schemaStateCopy={schemaStateCopy}
            setSchemaState={setSchemaState}
          />
          <TableFieldInput
            idName={`type-input-char_max_size-${tableColumn}`}
            label="Size"
            defaultValue={character_maximum_length}
          />
          <br />
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
            schemaStateCopy={schemaStateCopy}
            setSchemaState={setSchemaState}
          />
          <TableFieldDropDown
            label="Field"
            idName={`foreign-key-field-dd-${tableColumn}`}
            isDisabled={foreign_table == null}
            defaultValue={foreign_column}
            options={fkOptions}
            otherTables={data.otherTables}
            schemaStateCopy={schemaStateCopy}
            setSchemaState={setSchemaState}
          />
          <br />
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
          <TableFieldCheckBox
            idName={`unique-chkbox-${tableColumn}`}
            label="Unique"
            isChecked={unique}
          />
          <TableFieldCheckBox
            idName={`auto-increment-chkbox-${tableColumn}`}
            label="Auto Increment"
            isChecked={auto_increment}
          />
          <br />
          <div>
            <StyledButton id="update-btn" onClick={handleUpdateColumn}>
              SAVE
            </StyledButton>
            <StyledButton id="delete-btn" onClick={handleDropColumn}>
              DELETE
            </StyledButton>
          </div>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}

export default TableField;
