import React from 'react';
import { IconButton, Tooltip } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { SidebarList } from '../../style-variables';
import { AppState, QueryData } from '../../types';
import { deleteQuery, setCompare, key as queryKey } from '../../lib/queries';
import QueryEntry from './QueryEntry';

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
  show: boolean;
};

const QueryList = ({
  queries,
  createQuery,
  setQueries,
  comparedQueries,
  setComparedQueries,
  workingQuery,
  setWorkingQuery,
  show,
}: QueryListProps) => {
  const deleteQueryHandler = (query: QueryData) => () => {
    setQueries(deleteQuery(queries, query));
    setComparedQueries(deleteQuery(comparedQueries, query));
  };

  const setComparisonHandler = (query: QueryData) => (
    evt: React.ChangeEvent<HTMLInputElement>
  ) => {
    setComparedQueries(setCompare(comparedQueries, query, evt.target.checked));
  };

  if (!show) return null;
  return (
    <>
      <Tooltip title="New Query">
        <IconButton onClick={createQuery}>
          <AddIcon fontSize="large" />
        </IconButton>
      </Tooltip>
      <SidebarList>
        {Object.values(queries).map((query: QueryData) => (
          <QueryEntry
            key={`QueryList_${query.label}_${query.db}`}
            query={query}
            select={() => setWorkingQuery(query)}
            isSelected={
              !!workingQuery && queryKey(query) === queryKey(workingQuery)
            }
            deleteThisQuery={deleteQueryHandler(query)}
            isCompared={!!comparedQueries[queryKey(query)]}
            setComparison={setComparisonHandler(query)}
          />
        ))}
      </SidebarList>
    </>
  );
};

export default QueryList;
