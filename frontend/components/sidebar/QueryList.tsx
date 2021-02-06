import React from 'react';
import { AppState, userCreateQuery, Query } from '../../types';

type QueryListProps = Pick<AppState, 'queries'> & {
  createQuery: userCreateQuery;
};

interface QueryEntryProps {
  query: Query;
}

const QueryEntry = ({ query }: QueryEntryProps) => (
  // TODO: conditional style based on query.isSelected
  <li>
    <span onClick={() => query.select()}>{query.label}</span>
    <span>{query.db}</span>
    <button type="button" onClick={() => query.toggleCompare()}>
      +
    </button>
    <button type="button" onClick={() => query.delete()}>
      x
    </button>
  </li>
);

const QueryList = ({ queries, createQuery }: QueryListProps) => (
  <>
    <ul>
      {queries.list().map((query: Query) => (
        <QueryEntry
          key={`QueryList_${query.label}_${query.db}`}
          query={query}
        />
      ))}
    </ul>
    <button type="button" onClick={createQuery}>
      Create Query
    </button>
  </>
);

export default QueryList;
