import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  margin-left: auto;
`;

interface QueryTopSummaryProps {
  rows: number;
  totalTime: string;
}

const QueryTopSummary = ({ rows, totalTime }: QueryTopSummaryProps) => (
  <Container>{`${rows} rows - ${totalTime}`}</Container>
);

export default QueryTopSummary;
