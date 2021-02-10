import React from 'react'
import {TableInfo} from '../../../types'

interface TableDetailsProps {
  table: TableInfo | undefined;
}

// TODO: don't render if no table is received
const TableDetails = ({ table }: TableDetailsProps) => (<div>{`${table?.table_name} Details`}</div>);

export default TableDetails
