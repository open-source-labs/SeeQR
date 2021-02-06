import React from 'react';

interface QueryDbProps {
  db: string;
}

const QueryDb = ({ db }: QueryDbProps) => {
  return <div>{db}</div>;
};

export default QueryDb;
