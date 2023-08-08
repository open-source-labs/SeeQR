import QueryActions from '../Actions/QueryActions';

type Field = {
  title: string;
  contents: string;
};

type Query = {
  group: string;
  label: string;
  database: string;
  active: boolean;
  compare: boolean;
  details: QueryData;
};

type QueryState = {
  fields: Field[];
  savedQueries: Query[];
};

function queryReducer(state: QueryState, action: QueryActions) {
  switch (action.type) {
    case 'FORMAT_QUERY': {
      // Changes a specific query's details
      return state;
    }

    case 'RUN_QUERY': {
      // Sends specific query's details to the backend
      return state;
    }
    case 'IMPORT_QUERY': {
      // invoke event to get new query to add to savedQueries from file in backend
      return state;
    }

    case 'TEXT_INPUT': {
      // Updates specific field's contents
      return state;
    }
    case 'SELECT_QUERY': {
      // set active query
      return state;
    }
    case 'DELETE_QUERY': {
      return state;
    }
    case 'SAVE_QUERY': {
      // send query to backend to save to file
      return state;
    }
    case 'TOGGLE_COMPARISON': {
      // edit compare flag on specific query
      return state;
    }

    default: {
      return state;
    }
  }
}

export default queryReducer;
