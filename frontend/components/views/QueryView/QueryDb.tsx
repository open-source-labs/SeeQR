import React from 'react';
import { Select, MenuItem, InputLabel, Box } from '@material-ui/core/';
import styled from 'styled-components';
import { defaultMargin, greyPrimary } from '../../../style-variables';

const SpacedBox = styled(Box)`
  margin-left: ${defaultMargin};
`;

const StyledMenuItem = styled(MenuItem)`
  /* background-color: ${greyPrimary}; */
  color: #575151;
`;

interface QueryDbProps {
  db: string;
  onChange: (newDb: string) => void;
  databases: string[];
}

const QueryDb = ({ db, onChange, databases }: QueryDbProps) => (
  <SpacedBox>
    <InputLabel id="queryView-db-label">Database</InputLabel>
    <Select
      value={db}
      onChange={(evt) => onChange(evt.target.value as string)}
      labelId="queryView-db-label"
    >
      {databases.map((dbName) => (
        <StyledMenuItem value={dbName} key={`queryview_dbselect_${dbName}`}>
          {dbName}
        </StyledMenuItem>
      ))}
    </Select>
  </SpacedBox>
);

export default QueryDb;
