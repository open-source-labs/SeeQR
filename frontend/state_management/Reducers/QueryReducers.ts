import QueryActions from '../Actions/QueryActions';

function queryReducer<K extends QueryActions>(state, action: QueryActions) {
  switch (action.type) {
    case 'FORMAT_QUERY': {
      return state;
    }

    case 'RUN_QUERY': {
      return state;
    }

    case 'TEXT_INPUT': {
      return state;
    }

    default: {
      return state;
    }
  }
}

export default queryReducer;
