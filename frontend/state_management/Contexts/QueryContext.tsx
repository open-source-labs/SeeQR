import { createContext, Dispatch, useContext } from 'react';
import { QueryState } from '../Reducers/QueryReducers';
import { QueryActions } from '../Actions/QueryActions';

export const QueryContextState = createContext<QueryState | null>(null);
export const QueryContextDispatch =
  createContext<Dispatch<QueryActions> | null>(null);

export function useQueryContext() {
  return useContext(QueryContextState);
}
export function useQueryDispatch() {
  return useContext(QueryContextDispatch);
}