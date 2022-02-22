import React from 'react';
import { IconButton, Tooltip } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import styled from 'styled-components';
import { SidebarList } from '../../style-variables';
import { AppState, QueryData } from '../../types';
import { deleteQuery, setCompare, saveQuery, key as queryKey } from '../../lib/queries';
import QueryEntry from './QueryEntry';
import logo from '../../../assets/logo/seeqr_dock.png';
import { greyDarkest } from '../../style-variables';

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

const StyledSidebarList = styled(SidebarList)`
  background-color: ${greyDarkest};
`;

const QueryList = ({
  queries,
  createQuery,
  setQueries,
  comparedQueries,
  setComparedQueries,
  workingQuery,
  setWorkingQuery,
  show
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

  const saveQueryHandler = (query: QueryData) => () => { 
    saveQuery(queries, query)
  }

  if (!show) return null;
  return (
    <>
      <Tooltip title="New Query">
        <IconButton onClick={createQuery}>
          <AddIcon fontSize="large" />
        </IconButton>
      </Tooltip>
      <StyledSidebarList>
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
            saveThisQuery={saveQueryHandler(query)} 
      
          />
        ))}
        
      </StyledSidebarList>
    </>
  );
};

export default QueryList;
