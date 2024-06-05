import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Dialogs, ViewName } from '../../../shared/types/types';

interface AsyncPayload {
  issued: number;
  asyncList: Map<number, any>;
  invoke: (e: string, p: string | number) => Promise<any>;
}

// Define the state interface
export interface MenuState {
  selectedView: ViewName;
  sidebarState: 'CLOSED' | 'QUERIES' | 'DATABASES';
  visibleDialog: Dialogs | null;
  loading: {
    status: 'IDLE' | 'LOADING';
    issued: number;
    resolved: number;
    asyncList: Map<number, any>;
  };
}

// Define initial state for the menu view
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

// Create a slice for munu state management
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
    toggleSidebar: (
      state,
      action: PayloadAction<'CLOSED' | 'QUERIES' | 'DATABASES'>,
    ) => {
      state.sidebarState = action.payload;
    },
    asyncTrigger: (
      state,
      action: PayloadAction<{
        loading: 'LOADING' | 'IDLE';
        key?: number;
        options?: {
          event: string;
          callback?: any;
          args?: any[];
          payload?: any;
        };
      }>,
    ) => {
      if (
        action.payload.loading === 'IDLE' &&
        action.payload.key !== undefined
      ) {
        state.loading.asyncList.delete(action.payload.key);
        state.loading.resolved += 1;
        if (state.loading.issued === state.loading.resolved) {
          state.loading.status = 'IDLE';
        }
      } else if (
        action.payload.loading === 'LOADING' &&
        action.payload.options
      ) {
        state.loading.issued += 1;
        state.loading.asyncList.set(
          state.loading.issued,
          action.payload.options,
        );
        state.loading.status = 'LOADING';
      }
    },
  },
});

// Create async thunk for submitting async tasks to backend
export const submitAsyncToBackend = createAsyncThunk(
  'menu/submitAsyncToBackend',
  async ({ issued, asyncList, invoke }: AsyncPayload, { dispatch }) => {
    const request = asyncList.get(issued);
    if (!request) return;
    const { event, payload, callback, args } = request;

    try {
      const response = await invoke(event, payload);
      if (callback) callback(...(args || []), response);
      dispatch(asyncTrigger({ loading: 'IDLE', key: issued }));
      // TODO feedback modal call
    } catch (err) {
      console.log('error communicating with the backend,', err);
      // TODO feedback modal call
    }
  },
);

// Export actions for Menu slice
export const { changeView, toggleDialog, toggleSidebar, asyncTrigger } =
  menuSlice.actions;

// Export the reducer to be used in the store
export default menuSlice.reducer;
