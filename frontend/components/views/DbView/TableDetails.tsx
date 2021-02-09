import React from 'react'

interface TableDetailsProps {
  table: string;
}

const TableDetails = ({ table }: TableDetailsProps) => (<div>{`${table} Details`}</div>);

export default TableDetails
