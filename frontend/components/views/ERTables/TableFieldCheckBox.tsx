import React from 'react';

type TableFieldCheckBoxProps = {
  label : string
  idName : string
  isChecked? : boolean | undefined
}

const TableFieldCheckBox = ({label, idName, isChecked}: TableFieldCheckBoxProps) => {
  const onClick = () => {

  }

  return (
    <div className='field-info-checkbox'>
      {label + ':'}
      <div className='checkbox-wrapper'>
        <input id={idName} type="checkbox" defaultChecked={isChecked}/>
      </div>
    </div>
  )
};

export default TableFieldCheckBox;