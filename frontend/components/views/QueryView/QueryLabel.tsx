import React from 'react';
import { TextField } from '@mui/material/';
import Box from '@mui/material/Box';
import { defaultMargin } from '../../../style-variables';

interface QueryLabelProps {
  label?: string;
  onChange: (newLabel: string) => void;
}

function QueryLabel({ label, onChange }: QueryLabelProps) {
  return <Box paddingRight={defaultMargin}>
    <TextField
      label="Label"
      value={label}
      onChange={(evt) => onChange(evt.target.value)}
    />
  </Box>
}

export default QueryLabel;
