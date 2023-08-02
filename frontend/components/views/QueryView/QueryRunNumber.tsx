import React from 'react';
import { TextField } from '@mui/material/';
import Box from '@mui/material/Box';

interface QueryRunProps {
  runNumber?: number;
  onChange: (runNumber: number) => void;
}

const QueryRunNumber = ({ runNumber, onChange }: QueryRunProps) => (
  <Box className="query-run-box">
    <TextField
      label="Number of Queries"
      value={runNumber}
      onChange={(evt) => onChange(Number(evt.target.value) || 1)}
    />
  </Box>
);

export default QueryRunNumber;
