import React from 'react';

type TableFieldDropDownProps = {
  label: string;
  idName: string;
  options: string[];
  defaultValue: string[] | string | number | boolean;
}


const TableFieldDropDown = (props: TableFieldDropDownProps) => {
  const {label, idName, options, defaultValue} = props
  const optionsArray = options.map(opt => {
     const isSelected = (opt === defaultValue)
    return <option key={opt} value={opt}>{opt}</option>
  });

  return (
    <div id={idName} className='field-info-dropdown'>
      {label + ':'}
      <select> 
        {optionsArray}
      </select> 
    </div>
  );
};

export default TableFieldDropDown;
