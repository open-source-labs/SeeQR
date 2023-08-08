import MenuActions from '../Actions/MenuActions';
import { TableInfo } from '../types';

type MenuState = {
  selectedView: ViewName;
  sidebarState: 'CLOSED' | 'QUERIES' | 'DATABASES';
  visibleDialog: Dialogs | null;
  loading: {
    status: 'IDLE' | 'LOADING';
    count: number;
    queue: Set<any>;
  };
};

// idea: Loading event will take a payload: {dispatch: dispatch function, action: appropriate action}
// Loading event action payload will have a getter function
// use getter function to store backend event and its payload
// loading: {status, queue[]} queue contains event, payload, dispatch fn
// Set useEffect up to run invoke with payload when loading queue changes
// After async, dispatch a Loading action with the Idle status and identifier for
// removal from queue.

function menuReducer(state: MenuState, action: MenuActions): MenuState {
  switch (action.type) {
    case 'CHANGE_VIEW': {
      // change main view window

      return { ...state, selectedView: action.newView };
    }
    case 'TOGGLE_DIALOG': {
      // pop up any of the pop up dialogs
      let dialog: Dialogs | null;
      if (state.visibleDialog !== null) dialog = null;
      else dialog = action.dialog;
      return { ...state, visibleDialog: dialog };
    }
    case 'TOGGLE_SIDEBAR': {
      // change between database, query, and hidden sidebar states
      return { ...state, sidebarState: action.sidebarState };
    }
    case 'ASYNC_TRIGGER': {
      // activate / deactivate green loading bar

      const oldLoading = structuredClone(state.loading);

      if (action.loading === 'IDLE') {
        // LOGIC for removing async from queue
        oldLoading.queue.delete(action.payload.key);
        if (oldLoading.queue.size === 0) oldLoading.status = 'IDLE';
        return { ...state, loading: oldLoading };
      }

      const queueItem = {
        ...action.payload,
      };
      oldLoading.queue.add(queueItem);
      // after changing queue, useEffect will run invoke with event and payload acquired from
      // getter, then dispatch an IDLE async trigger and the stored dispatch and action
      // with any response data from async.

      // useEffect can also handle feedback modal!
      return { ...state, loading: oldLoading };
    }
    case 'CHANGE_SAVE_LOCATION': {
      // TODO: backend event to choose a path to save queries to

      return state;
    }

    default:
      return state;
  }
}

export default menuReducer;
