import { Dialogs, ViewName } from '../../../shared/types/types';
import MenuActions, { async } from '../Actions/MenuActions';

// idea: Loading event will take a payload: {dispatch: dispatch function, action: appropriate action}
// Loading event action payload will have a getter function
// use getter function to store backend event and its payload
// loading: {status, queue[]} queue contains event, payload, dispatch fn
// Set useEffect up to run invoke with payload when loading queue changes
// After async, dispatch a Loading action with the Idle status and identifier for
// removal from queue.

export type MenuState = {
  selectedView: ViewName;
  sidebarState: 'CLOSED' | 'QUERIES' | 'DATABASES';
  visibleDialog: Dialogs | null;
  loading: {
    status: 'IDLE' | 'LOADING';
    issued: number;
    resolved: number;
    asyncList: Map<number, async>;
  };
};

export const initialMenuState: MenuState = {
  selectedView: 'quickStartView',
  sidebarState: 'DATABASES',
  visibleDialog: null,
  loading: {
    status: 'IDLE',
    issued: 0,
    resolved: 0,
    asyncList: new Map<number, async>(),
  },
};

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
      // const oldLoading = structuredClone(state.loading);
      const oldLoading = {
        status: state.loading.status,
        issued: state.loading.issued,
        resolved: state.loading.resolved,
        asyncList: new Map(state.loading.asyncList),
      };

      if (action.loading === 'IDLE') {
        // LOGIC for removing async from queue
        oldLoading.asyncList.delete(action.payload.key);
        oldLoading.resolved += 1;
        if (oldLoading.issued === oldLoading.resolved)
          oldLoading.status = 'IDLE';
        return { ...state, loading: oldLoading };
      }
      // LOGIC for adding async to queue
      // increment num of issued asyncs
      oldLoading.issued += 1;
      // construct element of async tracker
      const queueItem = {
        ...action.options,
      };

      // add this async request to the asyncList using its issued count as an id
      oldLoading.asyncList.set(oldLoading.issued, queueItem);

      // after changing queue, useEffect will run invoke with event and payload acquired from
      // getter, then dispatch an IDLE async trigger and the stored dispatch and action
      // with any response data from async.
      // useEffect can also handle feedback modal!
      return { ...state, loading: oldLoading };
    }
    case 'CHANGE_SAVE_LOCATION': {
      return state;
    }

    default:
      return state;
  }
}

/**
 * Non reducer business logic
 */
export const submitAsyncToBackend = (
  issued: number,
  asyncList: Map<number, async>,
  invoke: (e: string, p: string | number) => Promise<any>,
  menuDispatch: (v: MenuActions) => void,
) => {
  const request = asyncList.get(issued);
  if (request === undefined) return;
  const { event, payload, callback, args } = request;
  invoke(event, payload)
    .then((response) => {
      if (callback) callback(...(args || []), response);
      menuDispatch({
        type: 'ASYNC_TRIGGER',
        loading: 'IDLE',
        payload: { key: issued },
      });
      // TODO feedback modal call
    })
    .catch((err) => {
      console.log('error communicating with the backend', err);
      // TODO feedback modal call
    });
};

export default menuReducer;
