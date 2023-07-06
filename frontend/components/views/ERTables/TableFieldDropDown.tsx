import React from 'react';
import TableFieldDropDownOption from './TableFieldDropDownOption';

type OtherTablesType = {
  table_name: string;
  column_names: string[];
};

type TableFieldDropDownProps = {
  label: string;
  idName: string;
  options: string[];
  defaultValue: string;
  isDisabled?: boolean;
  otherTables: OtherTablesType[];
  setFkOptions?: (fkOptions: string[]) => void;
};

const TableFieldDropDown = ({
  label,
  idName,
  options,
  defaultValue,
  isDisabled,
  otherTables,
  setFkOptions,
}: TableFieldDropDownProps) => {

  const optionsArray = options.map((option, i) => (
    <TableFieldDropDownOption
      key={idName + i}
      idName={idName}
      option={option}
    />
  ));

  const handleChange = (e) => {
    // if setFKOptions is truthy, the instance of TableFieldDropDown
    // with Other table names has been changed
    if (setFkOptions) {
      // check to see if otherTables is truthy
      // set the FK options to rerender a new list depending on the table name
      const newTableFkOptions = otherTables.find(
        (el) => el.table_name === e.target.value
      );

      if (newTableFkOptions) {
        setFkOptions(newTableFkOptions.column_names);
      }
    }
  };

  return (
    <div id={`${idName}-wrapper`} className="field-info-dropdown">
      {`${label}:`}
      <select
        id={idName}
        defaultValue={
          defaultValue === 'character varying' ? 'varchar' : defaultValue
        }
        disabled={isDisabled}
        onChange={(evnt) => handleChange(evnt)}
      >
        {optionsArray}
      </select>
    </div>
  );
};

export default TableFieldDropDown;
