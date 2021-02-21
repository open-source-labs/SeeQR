import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@material-ui/core';
import styled from 'styled-components';
import { AppState, QueryData } from '../../../types';
import {
  DarkPaperFull,
  defaultMargin,
  greenPrimary,
} from '../../../style-variables';
import { getPrettyTime, getTotalTime } from '../../../lib/queries';

const TableBg = styled(DarkPaperFull)`
  margin-top: ${defaultMargin};
`;

const StyledCell = styled(TableCell)<{ $isFastest: boolean }>`
  color: ${({ $isFastest }) => ($isFastest ? greenPrimary : 'inherit')};
`;

type AnalysedQuery = QueryData & {
  relativeSpeed: number;
  isFastest: boolean;
};

type Alignment = 'left' | 'right' | 'center';
type InfoColumn = [
  string,
  Alignment,
  (q: AnalysedQuery) => string | number | undefined
];

// Array of columns names and transformers that receive query and return printable value
const tableInfo: InfoColumn[] = [
  ['Label', 'left', (q: QueryData) => q.label],
  ['Database', 'left', (q: QueryData) => q.db],
  ['Timing', 'right', getPrettyTime],
  ['Rows', 'right', (q: QueryData) => q.returnedRows?.length],
  [
    'Performance',
    'right',
    (q: AnalysedQuery) => `${q.relativeSpeed.toFixed(2)}x`,
  ],
];

const getFastestPerGroup = (queries: QueryData[]) =>
  queries.reduce<Record<string, number>>(
    (acc, q) => ({
      ...acc,
      [q.label]: Math.min(acc[q.label] ?? Infinity, getTotalTime(q)),
    }),
    {}
  );

const analyze = (queries: QueryData[]): AnalysedQuery[] => {
  // fastest query in each group
  const fastest = getFastestPerGroup(queries);
  return queries.map((q) => ({
    ...q,
    relativeSpeed: getTotalTime(q) / fastest[q.label],
    isFastest: fastest[q.label] === getTotalTime(q),
  }));
};

interface CompareTableProps {
  queries: AppState['queries'];
}

const CompareTable = ({ queries }: CompareTableProps) => {
  const comparedQueries = analyze(Object.values(queries));

  return (
    <TableBg>
      <Table>
        <TableHead>
          <TableRow>
            {tableInfo.map(([column, alignment]) => (
              <TableCell key={column} align={alignment}>{column}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {comparedQueries.map((query: AnalysedQuery) => (
            <TableRow key={query.label + query.db}>
              {tableInfo.map(([label, alignment, transformer]) => (
                <StyledCell
                  align={alignment}
                  key={`${query.label}_${query.db}_${label}`}
                  $isFastest={query.isFastest}
                >
                  {transformer(query)}
                </StyledCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableBg>
  );
};

export default CompareTable;
