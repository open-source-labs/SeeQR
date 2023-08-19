import { createContext, Dispatch, useContext } from 'react';
import { AppViewState } from '../Reducers/AppViewReducer';
import { AppViewStateAction } from '../Actions/AppViewActions';

export const AppViewContextState = createContext<AppViewState | null>(null);
export const AppViewContextDispatch =
  createContext<Dispatch<AppViewStateAction> | null>(null);

export function useAppViewContext() {
  return useContext(AppViewContextState);
}
export function useAppViewDispatch() {
  return useContext(AppViewContextDispatch);
}
