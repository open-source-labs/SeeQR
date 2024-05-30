// import { QueryActions } from '../Actions/QueryActions';
// import { AppState } from '../../../shared/types/types';

// export interface QueryState {
//   queries: AppState['queries'];
//   comparedQueries: AppState['queries'];
//   workingQuery: AppState['workingQuery'];
//   newFilePath: AppState['newFilePath'];
// }

// export const queryReducer = (
//   state: QueryState,
//   action: QueryActions,
// ): QueryState => {
//   switch (action.type) {
//     case 'UPDATE_QUERIES':
//       return { ...state, queries: action.payload };

//     case 'UPDATE_COMPARED_QUERIES':
//       return { ...state, comparedQueries: action.payload };

//     case 'UPDATE_WORKING_QUERIES':
//       return {
//         ...state,
//         workingQuery: action.payload,
//       };
//     case 'UPDATE_FILEPATH':
//       return {
//         ...state,
//         newFilePath: action.payload,
//       };

//     default: {
//       return state;
//     }
//   }
// };
