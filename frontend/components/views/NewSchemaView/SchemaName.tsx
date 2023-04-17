import React from 'react';
import { TextField, Box } from '@material-ui/core/';

interface SchemaNameProps {
  name? : string;
  onChange: (newName: string) => void;
}

const SchemaName = ({ name, onChange }: SchemaNameProps) => (

  <Box>
    <TextField
      value={name}
      label="Database Name"
      onChange={(evt) => onChange(evt.target.value)}
    />
  </Box>
);

export default SchemaName;
