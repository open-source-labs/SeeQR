import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import appViewReducer from './Slices/AppViewSlice';
import menuReducer from './Slices/MenuSlice';
import queryReducer from './Slices/QuerySlice';

/**
 * Configure the Redux store with slices for managing the application's state.
 * Each slice reducer handles a specific part of the application's state.
 * 
 * @reducer appViewReducer Manages the state related to the application's view, such as sidebar visibility and selected view.
 * @reducer menuReducer Manages the state related to the application's menu, including async tasks and messages.
 * @reducer queryReducer Manages the state related to the queries, including the list of queries and compared queries.
 */
const store = configureStore({
  reducer: {
    appView: appViewReducer,
    menu: menuReducer,
    query: queryReducer,
    // Add more reducers here if needed for additional state management
  },
});

/**
 * RootState is a TypeScript type that represents the overall state of the Redux store.
 * It uses ReturnType to infer the type from the store's getState method.
 */
export type RootState = ReturnType<typeof store.getState>;

// Export dispatch type & useDispatch method to re-use in component files
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

export default store;
