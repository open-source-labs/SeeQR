import React from 'react';

type TableFieldInputProps = {
  defaultValue: any;
  label: string;
  idName: string;
};
function TableFieldInput({
  defaultValue,
  label,
  idName,
}: TableFieldInputProps) {
  return <div className="field-info-input">
    {`${label}:`}
    <input id={idName} defaultValue={defaultValue} />
  </div>
}

export default TableFieldInput;
