import ERDActions from '../Actions/ERDActions';

function erdReducer(state, action: ERDActions) {
  switch (action.type) {
    case 'ADD_TABLE': {
      return state;
    }
    case 'EDIT_TABLE': {
      return state;
    }
    case 'GENERATE_DATA': {
      return state;
    }
    case 'SAVE_CHANGES': {
      return state;
    }
    case 'SELECT_TABLE': {
      return state;
    }

    default:
      break;
  }
}

export default erdReducer;
