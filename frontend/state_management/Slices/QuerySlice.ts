import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { QueryState } from '../Reducers/QueryReducers';

const initialState: QueryState = {
  queries: {},
  comparedQueries: {},
  workingQuery: undefined,
  newFilePath: '',
};

const querySlice = createSlice({
  name: 'query',
  initialState,
  reducers: {
    updateQueries: (state, action: PayloadAction<any>) => {
      state.queries = action.payload;
    },
    updateComparedQueries: (state, action: PayloadAction<any>) => {
      state.comparedQueries = action.payload;
    },
    updateWorkingQuery: (state, action: PayloadAction<any>) => {
      state.workingQuery = action.payload;
    },
    updateFilePath: (state, action: PayloadAction<any>) => {
      state.newFilePath = action.payload;
    },
  },
});

export const {
  updateQueries,
  updateComparedQueries,
  updateWorkingQuery,
  updateFilePath,
} = querySlice.actions;

export default querySlice.reducer;
