import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  margin-left: auto;
`;

interface QueryTopSummaryProps {
  rows: number | undefined;
  totalTime: string | undefined;
}

const QueryTopSummary = ({ rows, totalTime }: QueryTopSummaryProps) => {
  if (!rows || !totalTime) return null;
  return <Container>{`${rows} rows - ${totalTime}`}</Container>;
};

export default QueryTopSummary;
