// Define the state type
export interface ViewState {
  selectedView: string;
  sideBarIsHidden: boolean;
  showConfigDialog: boolean;
  showCreateDialog: boolean;
  PG_isConnected: boolean;
  MYSQL_isConnected: boolean;
}

interface Action {
  type: string;
  payload?: string | boolean;
}

// eslint-disable-next-line import/prefer-default-export
export const viewStateReducer = (
  state: ViewState,
  action: Action,
): ViewState => {
  switch (action.type) {
    case 'setSelectedView':
      return { ...state, selectedView: action.payload };
    case 'toggleSideBar':
      return { ...state, sideBarIsHidden: !state.sideBarIsHidden };
    case 'toggleConfigDialog':
      return { ...state, showConfigDialog: !state.showConfigDialog };
    case 'toggleCreateDialog':
      return { ...state, showCreateDialog: !state.showCreateDialog };
    case 'setPG_isConnected':
      return { ...state, PG_isConnected: action.payload };
    case 'setMYSQL_isConnected':
      return { ...state, MYSQL_isConnected: action.payload };
    default:
      return state;
  }
};
