import React from 'react';
import { Select, MenuItem, InputLabel, FormControl } from '@mui/material/';
import Box from '@mui/material/Box';
import styled from 'styled-components';
import { defaultMargin, greyPrimary } from '../../../style-variables';

const SpacedBox = styled(Box)`
  margin-left: ${defaultMargin};
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledMenuItem = styled(MenuItem)`
  color: #575151;
  outline: none;
`;

const StyledFormControl = styled(FormControl)`
  margin-top: 15px;
`;

const StyledSelect = styled(Select)`
  outline: none;
  display: flex;
  justify-content: center;
  border-top: 1px solid black;
  border-right: 1px solid black;
  border-bottom: 1px solid black;
  border-radius: none;
`;

const StyledInputLabel = styled(InputLabel)`
  border-top: 1px solid black;
  border-left: 1px solid black;
  border-bottom: 1px solid black;
  padding-top: 16.5px;
  padding-bottom: 16.5px;
  padding-left: 10px;
  border-radius: 4px;
`;

interface QueryHistoryProps {
  history: string[];
}

function QueryHistory({ history }: QueryHistoryProps) {
  const label = 'Previous Queries';
  return (
    <div>
      <StyledFormControl sx={{ width: 450 }}>
        <InputLabel>{label}</InputLabel>
        <Select label={label}>
          {history.map((item, index) => (
            <StyledMenuItem key={index} value={item}>
              {item}
            </StyledMenuItem>
          ))}
        </Select>
      </StyledFormControl>
    </div>
  );
}

// export default QueryHistory;
