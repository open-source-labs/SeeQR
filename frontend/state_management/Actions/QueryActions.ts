export type QueryActions =
  | { type: 'UPDATE_QUERIES' }
  | { type: 'UPDATE_COMPARED_QUERIES'; payload: any }
  | { type: 'UPDATE_WORKING_QUERIES'; payload: any }
  | { type: 'UPDATE_FILEPATH' };
