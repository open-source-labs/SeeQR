import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ViewName } from '../../../shared/types/types';

// Define the state interface
export interface AppState {
    selectedView: ViewName;
    sideBarIsHidden: boolean;
    showConfigDialog: boolean;
    showCreateDialog: boolean;
    PG_isConnected: boolean;
    MYSQL_isConnected: boolean;
}

// Define initial state for the app view
const initialState: AppState = {
  selectedView: 'dbView',
  sideBarIsHidden: false,
  showConfigDialog: false,
  showCreateDialog: false,
  PG_isConnected: false,
  MYSQL_isConnected: false,
};

// Create a slice for app view state management
const appViewSlice = createSlice({
  name: 'appView',
  initialState,
  reducers: {
    selectedView: (state, action: PayloadAction<ViewName>) => {
      state.selectedView = action.payload;
    },
    toggleSidebar: (state) => {
      state.sideBarIsHidden = !state.sideBarIsHidden;
    },
    toggleConfigDialog: (state) => {
      state.showConfigDialog = !state.showConfigDialog;
    },
    toggleCreateDialog: (state) => {
      state.showCreateDialog = !state.showCreateDialog;
    },
    setPGConnected: (state, action: PayloadAction<boolean>) => {
      state.PG_isConnected = action.payload;
    },
    setMYSQLConnected: (state, action: PayloadAction<boolean>) => {
      state.MYSQL_isConnected = action.payload;
    },
  },
});

// Export actions for AppView slice
export const {
  selectedView,
  toggleSidebar,
  toggleConfigDialog,
  toggleCreateDialog,
  setPGConnected,
  setMYSQLConnected,
} = appViewSlice.actions;

// Export the reducer to be used in the store
export default appViewSlice.reducer;



