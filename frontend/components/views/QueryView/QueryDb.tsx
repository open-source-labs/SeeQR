import React from 'react';
import { Select, MenuItem, InputLabel, Box } from '@material-ui/core/';
import styled from 'styled-components';
import { defaultMargin, greyPrimary } from '../../../style-variables';
import { DBType } from '../../../types';

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

const QueryDb = ({ db, onDbChange, dbNames, dbTypes}: QueryDbProps) => {

  const menuitems: any = [];
  const values: any = {};
  
  if(dbNames && dbTypes) {
    for (let i = 0; i < dbNames.length; i++) {
      menuitems.push(
        <StyledMenuItem value={dbNames[i]} key={`queryview_dbselect_${dbNames[i]}`}>
          {dbNames[i]}
        </StyledMenuItem>
      )
      values[dbNames[i]] = [dbNames[i], dbTypes[i]];
    }
  }

  // const arr1 = ['mk', 'fredjeong', 'mysql']  // ['mk', 'pg']
  // const arr2 = ['pg', 'pg', 'mysql']


  // const menuitems2 = dbNames?.map((dbName) => (
  //   <StyledMenuItem value={dbName} key={`queryview_dbselect_${dbName}`}>
  //     {dbName}
  //   </StyledMenuItem>
  // ));

  return (
    <SpacedBox>
      <InputLabel id="queryView-db-label">Database</InputLabel>
      <Select
        value={db}
        onChange={(evt) => onDbChange((values[evt.target.value as string] as Array<any>)[0], (values[evt.target.value as string] as Array<any>)[1])}
        labelId="queryView-db-label"
      >
        {menuitems}
      </Select>
    </SpacedBox>
  )

  
};


export default QueryDb;
