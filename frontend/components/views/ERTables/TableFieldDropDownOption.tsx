import React from 'react';

type TableFieldDropDownOptionProps = {
  idName: string;
  option: string;
}

const TableFieldDropDownOption = (props: TableFieldDropDownOptionProps) => {
  const { idName, option } = props;

  return (
    <option
      key={`${idName}-option-${option}`}
      value={option}
    >
      {option}
    </option>
  );
};

export default TableFieldDropDownOption;
