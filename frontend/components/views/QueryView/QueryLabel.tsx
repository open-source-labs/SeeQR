import React from 'react';
import { TextField } from '@material-ui/core/';

interface QueryLabelProps {
  label?: string;
  onChange: (newLabel: string) => void;
}

const QueryLabel = ({ label, onChange }: QueryLabelProps) => (
  <>
    <TextField
      label="Label"
      value={label}
      onChange={(evt) => onChange(evt.target.value)}
    />
  </>
);

export default QueryLabel;
