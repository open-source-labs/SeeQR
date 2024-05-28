import { configureStore } from '@reduxjs/toolkit';
import appViewReducer from './Slices/AppViewSlice';
import menuReducer from './Slices/MenuSlice';
import queryReducer from './Slices/QuerySlice';

// Configure the Redux store with slices for app view, menu, and query state
const store = configureStore({
  reducer: {
    appView: appViewReducer,
    menu: menuReducer,
    query: queryReducer,
    // Add more reducers if needed
  },
});

// Define TypeScript type for the overall state and the dispatch function of the redux store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;


