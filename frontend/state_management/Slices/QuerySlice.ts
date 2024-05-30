import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { QueryData } from '../../../shared/types/types';

// Define the state interface
export interface QueryState {
  queries: Record<string, QueryData>; 
  comparedQueries: Record<string, QueryData>; 
  workingQuery: QueryData;
  newFilePath: string; 
  localQuery: {
    queries: Record<string, QueryData>;
  };
}

// Define initial state for the query view
const initialState: QueryState = {
  queries: {},
  comparedQueries: {},
  workingQuery: {} as QueryData,
  newFilePath: '',
  localQuery: {
    queries: {},
  },
};

// Create a slice for query state management
const querySlice = createSlice({
  name: 'query',
  initialState,
  reducers: {
    updateQueries: (state, action: PayloadAction<Record<string, QueryData>>) => {
      state.queries = action.payload;
    },
    updateComparedQueries: (state, action: PayloadAction<Record<string, QueryData>>) => {
      state.comparedQueries = action.payload;
    },
    updateWorkingQuery: (state, action: PayloadAction<QueryData>) => {
      state.workingQuery = action.payload;
    },
    updateFilePath: (state, action: PayloadAction<string>) => {
      state.newFilePath = action.payload;
    },
    updateLocalQuery: (state, action: PayloadAction<{ queries: Record<string, QueryData> }>) => {
      state.localQuery.queries = action.payload.queries;
    },
  },
});

export const {
  updateQueries,
  updateComparedQueries,
  updateWorkingQuery,
  updateFilePath,
  updateLocalQuery
} = querySlice.actions;

export default querySlice.reducer;

