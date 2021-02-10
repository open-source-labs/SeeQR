import ms from 'ms'
/**
 * Execute function at most once. Doesn't passthrough functions returned value
 */
export const once = (func: Function) => {
  let hasRun = false;
  return () => {
    if (!hasRun) func();
    hasRun = true;
  };
};

/**
 * Get reading time for string in ms. Calculated based on number of words
 * Minimum reading time is 3s 
 */
export const readingTime = (str: string) => {
  const averageWordsPerMinute = 200;
  const totalWords = str.split(' ').length
  const readTime = totalWords * ms('1m') / averageWordsPerMinute
  return Math.max(ms('3s'), readTime)
}