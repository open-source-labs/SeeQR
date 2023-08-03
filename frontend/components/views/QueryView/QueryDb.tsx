import React from 'react';
import { Select, MenuItem, InputLabel } from '@mui/material/';
import Box from '@mui/material/Box';
import styled from 'styled-components';
import { defaultMargin, greyPrimary } from '../../../style-variables';
import { DBType } from '../../../../backend/BE_types';

const SpacedBox = styled(Box)`
  margin-left: ${defaultMargin};
`;

const StyledMenuItem = styled(MenuItem)`
  /* background-color: ${greyPrimary}; */
  color: #575151;
`;

interface QueryDbProps {
  db: string;
  onDbChange: (newDb: string, newDBType: DBType) => void;
  dbNames: string[] | undefined;
  dbTypes: DBType[] | undefined;
}

function QueryDb({
  db, onDbChange, dbNames, dbTypes,
}: QueryDbProps) {
  const menuitems: any = [];
  const values: any = {};

  if (dbNames && dbTypes) {
    for (let i = 0; i < dbNames.length; i++) {
      menuitems.push(
        <StyledMenuItem
          value={dbNames[i]}
          key={`queryview_dbselect_${dbNames[i]}`}
        >
          {`${dbNames[i]} [${dbTypes[i]}]`}
        </StyledMenuItem>,
      );
      values[dbNames[i]] = [dbNames[i], dbTypes[i]];
    }
  }

  return (
    <SpacedBox>
      <InputLabel id="queryView-db-label">Database</InputLabel>
      <Select
        value={db}
        onChange={(evt) => onDbChange(
          (values[evt.target.value] as Array<any>)[0],
          (values[evt.target.value] as Array<any>)[1],
        )}
        labelId="queryView-db-label"
      >
        {menuitems}
      </Select>
    </SpacedBox>
  );
}

export default QueryDb;
