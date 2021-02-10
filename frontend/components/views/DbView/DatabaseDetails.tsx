import React from 'react';
import { DatabaseInfo } from '../../../types';
// import { Typography } from '@material-ui/core';

interface DatabaseDetailsProps {
  db: DatabaseInfo;
}

const DatabaseDetails = ({ db }: DatabaseDetailsProps) => (
  <>
    <div>{`${db.db_name} = ${db.db_size}`}</div>

    {/* <Typography variant="h2">{db}</Typography> */}
  </>
);

export default DatabaseDetails;
