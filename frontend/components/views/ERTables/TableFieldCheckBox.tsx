import React from 'react';

type TableFieldCheckBoxProps = {
  label : string;
  idName : string;
  isChecked? : boolean | undefined;
  onChange? : (any?) => any; // FIXME:
}

// eslint-disable-next-line arrow-body-style
const TableFieldCheckBox = ({label, idName, isChecked, onChange}: TableFieldCheckBoxProps) => {

  return (  
    <div className='field-info-checkbox'>
      {`${label}:`}
      <div className='checkbox-wrapper'>
        <input 
          id={idName} 
          type="checkbox" 
          defaultChecked={isChecked}
          onChange={(e) => {if (onChange) onChange(e.target.checked)}}
        />
      </div>
    </div>
  )
}


export default TableFieldCheckBox;