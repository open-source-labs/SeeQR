import React, { memo } from 'react';
import { TextField, Box } from '@material-ui/core/';
// import styled from 'styled-components'

interface QueryLabelProps {
  label?: string;
  onChange: (newLabel: string) => void;
}

const isSame = (prevProps: QueryLabelProps, nextProps: QueryLabelProps) =>
  prevProps.label === nextProps.label;

const QueryLabel = ({ label, onChange }: QueryLabelProps) => (
  <Box>
    <TextField
      label="Label"
      value={label}
      onChange={(evt) => onChange(evt.target.value)}
    />
  </Box>
);

export default memo(QueryLabel, isSame);
