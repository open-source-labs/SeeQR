import React from 'react';
import { TextField } from '@mui/material/';
import Box from '@mui/material/Box';

interface SchemaNameProps {
  name? : string;
  onChange: (newName: string) => void;
}

function SchemaName({ name, onChange }: SchemaNameProps) {
  return <Box>
    <TextField
      value={name}
      label="Database Name"
      onChange={(evt) => onChange(evt.target.value)}
    />
  </Box>
}

export default SchemaName;
