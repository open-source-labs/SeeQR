
/**
 * Execute function at most once. Doesn't passthrough functions returned value
 */
export const once = (func) => {
  let hasRun = false;
  return () => {
    if (!hasRun) func();
    hasRun = true;
  };
};
