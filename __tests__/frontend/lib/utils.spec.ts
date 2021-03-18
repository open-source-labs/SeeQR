// overwrite window.require method to prevent errors when executing utils.ts without electron
window.require = ((str: string) => str) as any

// eslint-disable-next-line import/first
import * as utils from '../../../frontend/lib/utils';

describe('once', () => {
  it('should only run once', () => {
    let counter = 0;
    const cb = () => {
      counter += 1;
    };
    const limitedFunc = utils.once(cb);
    
    expect(counter).toBe(0)
    limitedFunc()
    expect(counter).toBe(1)
    limitedFunc()
    expect(counter).toBe(1)
    limitedFunc()
    expect(counter).toBe(1)
  });
});
