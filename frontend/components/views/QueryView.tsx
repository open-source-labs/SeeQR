import React from 'react';
import type Query from '../../classes/Query';

interface QueryViewProps {
  query?: Query;
  createNewQuery: (query) => void;
  selectedDb: string;
}

const QueryView = ({ query, createNewQuery, selectedDb }: QueryViewProps) => {
  // if no selectedQuery, display empty box for user to create new Query. On submit, create new Query
  if (!query) return <h4>Creating new</h4>;

  return (
    <>
      <h4>Query View</h4>
      {query.label}
      {query.db}
      {query.sqlString}
      {query.returnedRows}
    </>
  );
};

export default QueryView;
