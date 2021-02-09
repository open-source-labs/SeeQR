import React from 'react';

interface QueryTopSummaryProps {
  rows: number;
  totalTime: string;
}

const QueryTopSummary = ({ rows, totalTime }: QueryTopSummaryProps) => {
  return <div>{`${rows} rows - ${totalTime}`}</div>;
};

export default QueryTopSummary;
