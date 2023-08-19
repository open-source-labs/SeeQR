import { createContext, Dispatch, useContext } from 'react';
import { AppViewState } from '../Reducers/AppViewReducer';
import { AppViewStateAction } from '../Actions/AppViewActions';

// Creating the context provider with no default values. This is so that we can use the context in any component without having to worry about the provider.
export const AppViewContextState = createContext<AppViewState | null>(null);
export const AppViewContextDispatch =
  createContext<Dispatch<AppViewStateAction> | null>(null);

// connecting the context to the provider and exporting it to be used in the proper files.
export function useAppViewContext() {
  return useContext(AppViewContextState);
}
export function useAppViewDispatch() {
  return useContext(AppViewContextDispatch);
}
