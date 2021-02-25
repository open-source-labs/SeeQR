import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
} from '@material-ui/core';
import SpeedIcon from '@material-ui/icons/Speed';
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

// prettier-ignore
const StyledCell = styled(TableCell)<{
  $isFastest: boolean;
  $isMarker: boolean;
}>`
  color: ${({ $isFastest }) => ($isFastest ? greenPrimary : 'inherit')};
  ${({ $isMarker }) => $isMarker ? ` padding:0;` : ''}
`;

const FastestMarker = () => (
  <Tooltip title="Fastest Query in label group">
    <SpeedIcon style={{ margin: 0 }} />
  </Tooltip>
);

type AnalysedQuery = QueryData & {
  relativeSpeed: number;
  isFastest: boolean;
};

type Alignment = 'left' | 'right' | 'center';
type InfoColumn = [
  string,
  Alignment,
  (q: AnalysedQuery) => string | number | undefined | JSX.Element
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
  // Fastest Icon marker
  ['', 'center', (q: AnalysedQuery) => (q.isFastest ? <FastestMarker /> : '')],
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
  comparedQueries.sort(
    (a, b) =>
      // sort by label alphabetically
      a.label.localeCompare(b.label) ||
      // if same label, sort by speed ascending
      a.relativeSpeed - b.relativeSpeed
  );

  return (
    <TableBg>
      <Table>
        <TableHead>
          <TableRow>
            {tableInfo.map(([column, alignment]) => (
              <TableCell key={column} align={alignment}>
                {column}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {comparedQueries.map((query: AnalysedQuery) => (
            <TableRow key={query.label + query.db}>
              {tableInfo.map(([columnLabel, alignment, transformer]) => (
                <StyledCell
                  align={alignment}
                  key={`${query.label}_${query.db}_${columnLabel}`}
                  $isFastest={query.isFastest}
                  $isMarker={!columnLabel}
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
