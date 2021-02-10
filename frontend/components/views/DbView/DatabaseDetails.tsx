import React from 'react';
import { Typography } from '@material-ui/core';

interface DatabaseDetailsProps {
  db: string;
}

const DatabaseDetails = ({ db }: DatabaseDetailsProps) => (
  <>
    <Typography variant="h2">{db}</Typography>
  </>
);

export default DatabaseDetails;
