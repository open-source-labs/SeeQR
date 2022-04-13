import React, {useEffect} from 'react';
import TableFieldDropDownOption from './TableFieldDropDownOption';

type TableFieldDropDownProps = {
  label: string;
  idName: string;
  options: string[];
  defaultValue: string;
  isDisabled?: boolean;
  changeCallback?: (any?) => any; // FIXME:
}


const TableFieldDropDown = (props: TableFieldDropDownProps) => {
  const {label, idName, options, defaultValue, isDisabled, changeCallback} = props

  const optionsArray = options.map(option => <TableFieldDropDownOption idName={idName} option={option} />);


  const handleChange = (e) => {
    // // only apply callback if one is passed in
    if (changeCallback) changeCallback(e.target.checked);
    
  } 

  return (
    <div id={`${idName}-wrapper`} className='field-info-dropdown'>
      {`${label}:`}
      <select id={idName} defaultValue={defaultValue} disabled={isDisabled} onChange={(evnt)=>handleChange(evnt)}> 
        {optionsArray}
      </select> 
    </div>
  );
};

export default TableFieldDropDown;
