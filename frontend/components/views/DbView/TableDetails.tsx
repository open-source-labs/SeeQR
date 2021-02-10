import React from 'react'
import {TableInfo} from '../../../types'
// import { Typography } from '@material-ui/core';

interface TableDetailsProps {
  table: TableInfo | undefined;
}

// TODO: don't render if no table is received
const TableDetails = ({ table }: TableDetailsProps) => (<div>{`${table?.table_name} Details`}</div>);
// <Typography variant="h3">{table}</Typography>
export default TableDetails
