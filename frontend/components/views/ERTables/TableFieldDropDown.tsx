import React from 'react';

type TableFieldDropDownProps = {
  label: string;
  idName: string;
  options: string[];
  defaultValue: string[] | string | number | boolean;
  isDisabled?: boolean;
}


const TableFieldDropDown = (props: TableFieldDropDownProps) => {
  const {label, idName, options, defaultValue, isDisabled} = props
  const optionsArray = options.map(opt => {
     const isSelected = (opt === defaultValue)
    return <option key={opt} selected={isSelected} value={opt}>{opt}</option>
  });

  return (
    <div id={`${idName}-wrapper`} className='field-info-dropdown'>
      {`${label}:`}
      <select id={idName} disabled={isDisabled}> 
        {optionsArray}
      </select> 
    </div>
  );
};

export default TableFieldDropDown;
