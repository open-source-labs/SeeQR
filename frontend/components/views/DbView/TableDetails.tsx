import React from 'react';
import { Typography } from '@material-ui/core';

interface TableDetailsProps {
  table: string;
}

const TableDetails = ({ table }: TableDetailsProps) => (
  <Typography variant="h3">{table}</Typography>
);
export default TableDetails;
