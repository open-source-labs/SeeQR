import React from 'react';

type TableFieldInputProps = {
  defaultValue: any
  label: string
}
const TableFieldInput = ({defaultValue, label}: TableFieldInputProps) => {
  return (
    <div className='field-info-input'>
      {label + ':'}
      <input defaultValue={defaultValue} />
    </div>
  );
};

export default TableFieldInput;