import React from 'react';
import type Query from '../../classes/Query';

interface QueryViewProps {
  query: Query;
}

const QueryView = ({ query }: QueryViewProps) => (
  <>
    <h4>Query View</h4>
    {query.label}
    {query.db}
    {query.sqlString}
    {query.returnedRows}
  </>
);

export default QueryView;
