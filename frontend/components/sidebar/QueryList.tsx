import React from 'react';
import { AppState,  QueryData } from '../../types';
import { deleteQuery, toggleCompare, key as queryKey } from '../../lib/queries';

interface QueryEntryProps {
  query: QueryData;
  isSelected: boolean;
  select: () => void;
  toggleComparison: () => void;
  deleteThisQuery: () => void;
}

const QueryEntry = ({
  query,
  select,
  isSelected,
  toggleComparison,
  deleteThisQuery,
}: QueryEntryProps) => (
  // TODO: conditional style based on query.isSelected
  <li>
    <span onClick={select}>{`${query.label}${isSelected ? ' <' : ''}`}</span>
    <span>{query.db}</span>
    <button type="button" onClick={toggleComparison}>
      +
    </button>
    <button type="button" onClick={deleteThisQuery}>
      x
    </button>
  </li>
);

type QueryListProps = Pick<
  AppState,
  | 'queries'
  | 'setQueries'
  | 'comparedQueries'
  | 'setComparedQueries'
  | 'workingQuery'
  | 'setWorkingQuery'
> & {
  createQuery: () => void;
};

const QueryList = ({
  queries,
  createQuery,
  setQueries,
  comparedQueries,
  setComparedQueries,
  workingQuery,
  setWorkingQuery,
}: QueryListProps) => (
  <>
    <ul>
      {Object.values(queries).map((query: QueryData) => (
        <QueryEntry
          key={`QueryList_${query.label}_${query.db}`}
          query={query}
          select={() => setWorkingQuery(query)}
          isSelected={
            !!workingQuery && queryKey(query) === queryKey(workingQuery)
          }
          deleteThisQuery={() => {
            setQueries(deleteQuery(queries, query));
            setComparedQueries(deleteQuery(comparedQueries, query));
          }}
          toggleComparison={() =>
            setComparedQueries(toggleCompare(comparedQueries, query))
          }
        />
      ))}
    </ul>
    <button type="button" onClick={createQuery}>
      Create Query
    </button>
  </>
);

export default QueryList;
