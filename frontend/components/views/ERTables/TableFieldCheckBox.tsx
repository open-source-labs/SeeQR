import React from 'react';

type TableFieldCheckBoxProps = {
  label : string;
  idName : string;
  isChecked? : boolean | undefined;
  onChange? : ((any) => void)[] | ((any) => void);
}

const TableFieldCheckBox = ({
  label, idName, isChecked, onChange,
}: TableFieldCheckBoxProps) => {
  const onChangeHandler = (e) => {
    // confirm that onChange is given
    if (!onChange) return;
    // if an array of callbacks is given, apply consecutively
    if (Array.isArray(onChange)) {
      onChange.forEach((func) => func(e.target.checked));
    } else {
      // if only one callback is given, apply solely
      onChange(e.target.checked);
    }
  };

  return (
    <div className="field-info-checkbox">
      {`${label}:`}
      <div className="checkbox-wrapper">
        <input
          id={idName}
          type="checkbox"
          defaultChecked={isChecked}
          onChange={(e) => { onChangeHandler(e); }}
        />
      </div>
    </div>
  );
};

export default TableFieldCheckBox;
