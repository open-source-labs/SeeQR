import React from 'react';
import { MuiThemeProvider, TextField } from '@material-ui/core/';
import { MuiTheme } from '../../../style-variables';

interface QueryLabelProps {
  label?: string;
  onChange: (newLabel: string) => void;
}

const QueryLabel = ({ label, onChange }: QueryLabelProps) => (
  <MuiThemeProvider theme={MuiTheme}>
    <TextField
      label="Label"
      value={label}
      onChange={(evt) => onChange(evt.target.value)}
    />
  </MuiThemeProvider>
);

export default QueryLabel;
