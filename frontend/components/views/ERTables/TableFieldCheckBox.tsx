import React from 'react';

type TableFieldCheckBoxProps = {
  label : string;
  idName : string;
  isChecked? : boolean | undefined;
  changeCallback? : (any) => any; // FIXME:
}

const TableFieldCheckBox = ({label, idName, isChecked, changeCallback}: TableFieldCheckBoxProps) => {
  const handleChange = (e) => {
    // only apply callback if one is passed in
    if (changeCallback) changeCallback(e.target.checked);
  }

  return (  
    <div className='field-info-checkbox'>
      {`${label}:`}
      <div className='checkbox-wrapper'>
        <input 
          id={idName} 
          type="checkbox" 
          defaultChecked={isChecked}
          onChange={(evnt) => {handleChange(evnt)}}
        />
      </div>
    </div>
  )
}


export default TableFieldCheckBox;