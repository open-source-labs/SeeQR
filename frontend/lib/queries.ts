/**
 * Functions that operate on collections of queries and individual queries. Used
 * to create and modify state objects for App.state.queries and
 * App.state.comparedQueries
 */

import ms from 'ms';
import { AppState, QueryData } from '../types';

/**
 * create identifiew from label and database name
 */
export const keyFromData = (label: string, db: string) =>
  `label:${label} db:${db}`;

/**
 * create identifiew from query object
 */
export const key = (query: QueryData) => `label:${query.label} db:${query.db}`;

/**
 * Creates new query in collection
 * returns new queries object with all queries but deleted one
 */
export const createQuery = (
  queries: AppState['queries'],
  newQuery: QueryData
) => ({
  ...queries,
  [key(newQuery)]: newQuery,
});

/**
 * delete query from collection
 * returns new queries object with all queries but deleted one
 */
export const deleteQuery = (
  queries: AppState['queries'],
  queryToDelete: QueryData
) => {
  const tempQueries = { ...queries };
  delete tempQueries[key(queryToDelete)];
  return tempQueries;
};

/**
 * Toggle compare flag for query.
 * Compare flag indicates whether a Query should be shown on Compare View
 * returns new queries object with all queries
 */
export const toggleCompare = (
  comparedQueries: AppState['comparedQueries'],
  query: QueryData
) => {
  const tempQueries = { ...comparedQueries };

  if (tempQueries[key(query)]) {
    delete tempQueries[key(query)];
    return tempQueries;
  }

  tempQueries[key(query)] = query;
  return tempQueries;
};

/**
 * Get query execution time. Planning + Execution. Returns 0 if not given a given
 */
export const getTotalTime = (query: QueryData | undefined) => {
  if (!query?.executionPlan) return 0;
  return (
    query.executionPlan['Execution Time'] + query.executionPlan['Planning Time']
  );
};

/**
 * Get query exeuction time as a formatted string. Returns 'n/a' if not given a query
 */
export const getPrettyTime = (query: QueryData | undefined) => {
  if (!query?.executionPlan) return 'n/a';
  return ms(getTotalTime(query), { long: true });
};
