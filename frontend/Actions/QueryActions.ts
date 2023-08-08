type QueryActions =
  | { type: 'TEXT_INPUT'; field: string; payload: string }
  | { type: 'RUN_QUERY' }
  | { type: 'FORMAT_QUERY'; payload: string };

export default QueryActions;
