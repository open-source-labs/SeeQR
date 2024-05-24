import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MenuState } from '../Reducers/MenuReducers';
import { Dialogs, ViewName } from '../../../shared/types/types';

const initialState: MenuState = {
  selectedView: 'quickStartView',
  sidebarState: 'DATABASES',
  visibleDialog: null,
  loading: {
    status: 'IDLE',
    issued: 0,
    resolved: 0,
    asyncList: new Map<number, any>(),
  },
};


const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    changeView: (state, action: PayloadAction<ViewName>) => {
      state.selectedView = action.payload;
    },
    toggleDialog: (state, action: PayloadAction<Dialogs | null>) => {
      state.visibleDialog = action.payload;
    },
    toggleSidebar: (state, action: PayloadAction<'CLOSED' | 'QUERIES' | 'DATABASES'>) => {
      state.sidebarState = action.payload;
    },
  },
});

export const { changeView, toggleDialog, toggleSidebar } = menuSlice.actions;

export default menuSlice.reducer;
