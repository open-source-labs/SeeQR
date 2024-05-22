import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppViewState } from '../Reducers/AppViewReducer';
import { ViewName } from '../../types';

// Define initial state for the app view
const initialState: AppViewState = {
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


export const {
  selectedView,
  toggleSidebar,
  toggleConfigDialog,
  toggleCreateDialog,
  setPGConnected,
  setMYSQLConnected,
} = appViewSlice.actions;

export default appViewSlice.reducer;



