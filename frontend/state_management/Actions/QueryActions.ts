export type QueryActions =
  | { type: 'UPDATE_QUERIES'; payload: any }
  | { type: 'UPDATE_COMPARED_QUERIES'; payload: any }
  | { type: 'UPDATE_WORKING_QUERIES'; payload: any }
  | { type: 'UPDATE_FILEPATH'; payload: any };
